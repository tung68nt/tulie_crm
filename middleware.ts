import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ============================================
// PORTAL RATE LIMITING (in-memory, Edge-compatible)
// Prevents token enumeration on /portal/, /quote/, /order/ paths
// ============================================
const PORTAL_PATHS = ['/portal/', '/quote/', '/order/']
const PORTAL_RATE_LIMIT = 30       // max requests per window
const PORTAL_RATE_WINDOW = 60_000  // 1 minute in ms

interface RateEntry { count: number; reset: number }
const portalRateStore = new Map<string, RateEntry>()
let lastCleanup = Date.now()

function getIp(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown'
}

function checkPortalRateLimit(req: NextRequest): NextResponse | null {
    const pathname = req.nextUrl.pathname
    const isPortal = PORTAL_PATHS.some(p => pathname.startsWith(p))
    if (!isPortal) return null

    // Cleanup every 5 minutes
    const now = Date.now()
    if (now - lastCleanup > 300_000) {
        lastCleanup = now
        for (const [k, v] of portalRateStore) {
            if (now > v.reset) portalRateStore.delete(k)
        }
    }

    const ip = getIp(req)
    const key = `portal:${ip}`
    const entry = portalRateStore.get(key)

    if (!entry || now > entry.reset) {
        portalRateStore.set(key, { count: 1, reset: now + PORTAL_RATE_WINDOW })
        return null
    }

    if (entry.count >= PORTAL_RATE_LIMIT) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000)
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                },
            }
        )
    }

    entry.count++
    return null
}

// ============================================
// CSP NONCE GENERATION
// Generates a per-request nonce for Content-Security-Policy
// This replaces 'unsafe-inline' in script-src with a nonce
// ============================================
function generateCspHeaders(nonce: string) {
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://my.sepay.vn https://api.vietqr.io",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
    ].join('; ')
    return csp
}

// ============================================
// SUBDOMAIN ROUTING
// anhthe.tulie.studio → /anhthe routes
// ============================================
const SUBDOMAIN_MAP: Record<string, string> = {
    'anhthe': '/anhthe',
}

function handleSubdomainRewrite(request: NextRequest): NextResponse | URL | null {
    const hostname = request.headers.get('host') || ''
    // Extract subdomain: "anhthe.tulie.studio" → "anhthe"
    const match = hostname.match(/^([^.]+)\.tulie\.studio$/)
    if (!match) return null

    const subdomain = match[1]
    const basePath = SUBDOMAIN_MAP[subdomain]
    if (!basePath) return null

    const pathname = request.nextUrl.pathname

    // Block CRM dashboard routes on subdomain (security)
    if (pathname.startsWith('/(dashboard)') || pathname.match(/^\/(customers|quotations|contracts|invoices|products|deals|projects|reports|settings)/)) {
        return new NextResponse('Not Found', { status: 404 })
    }

    // Skip if already on the correct path (avoid infinite rewrite)
    if (pathname.startsWith(basePath)) return null

    // Skip static assets and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/file')) return null

    // Rewrite: / → /anhthe, /success → /anhthe/success, etc.
    const newPath = pathname === '/' ? basePath : `${basePath}${pathname}`
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return url
}

// ============================================
// MIDDLEWARE
// ============================================
export async function middleware(request: NextRequest) {
    // Handle subdomain rewrites first
    const subdomainResult = handleSubdomainRewrite(request)
    if (subdomainResult instanceof NextResponse) return subdomainResult
    if (subdomainResult instanceof URL) {
        return NextResponse.rewrite(subdomainResult)
    }

    // Rate limit portal pages first
    const rateLimited = checkPortalRateLimit(request)
    if (rateLimited) return rateLimited

    // Generate nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

    // Pass nonce to server components via request header
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)

    // Get session response (Supabase auth)
    const response = await updateSession(request)

    // Set CSP header with nonce on the response
    const csp = generateCspHeaders(nonce)
    response.headers.set('Content-Security-Policy', csp)

    // Also set nonce in response header for downstream use
    response.headers.set('x-nonce', nonce)

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
