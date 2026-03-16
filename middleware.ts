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
// MIDDLEWARE
// ============================================
export async function middleware(request: NextRequest) {
    // Rate limit portal pages first
    const rateLimited = checkPortalRateLimit(request)
    if (rateLimited) return rateLimited

    return await updateSession(request)
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
