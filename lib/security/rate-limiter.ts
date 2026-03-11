import { NextResponse } from 'next/server'

interface RateLimitEntry {
    count: number
    resetTime: number
}

// In-memory store — works for serverless with short-lived instances
// For high-traffic production, replace with Upstash Redis
const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return
    lastCleanup = now
    for (const [key, entry] of store) {
        if (now > entry.resetTime) {
            store.delete(key)
        }
    }
}

interface RateLimitOptions {
    /** Maximum number of requests allowed in the window */
    maxRequests: number
    /** Time window in seconds */
    windowSeconds: number
    /** Key prefix to separate different endpoints */
    keyPrefix: string
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 * Returns null if within limits, or a 429 NextResponse if exceeded.
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions
): NextResponse | null {
    cleanup()

    const key = `${options.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowMs = options.windowSeconds * 1000

    const entry = store.get(key)

    if (!entry || now > entry.resetTime) {
        // New window
        store.set(key, { count: 1, resetTime: now + windowMs })
        return null
    }

    if (entry.count >= options.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(options.maxRequests),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
                },
            }
        )
    }

    entry.count++
    return null
}

/**
 * Extract client IP from request headers (works with Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
    const headers = new Headers(request.headers)
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    )
}
