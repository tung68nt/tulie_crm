/**
 * Rate Limiter — Hybrid: Upstash Redis (production) + In-Memory (fallback)
 * 
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
 * uses Upstash Redis for distributed rate limiting across serverless instances.
 * Otherwise falls back to in-memory Map (single-instance only).
 */
import { NextResponse } from 'next/server'

// ============================================
// UPSTASH REDIS RATE LIMITER
// ============================================

let upstashLimiter: any = null
let upstashReady = false

async function getUpstashLimiter() {
    if (upstashReady) return upstashLimiter

    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token) {
        try {
            const { Redis } = await import('@upstash/redis')
            const { Ratelimit } = await import('@upstash/ratelimit')
            const redis = new Redis({ url, token })

            // We create limiters on-demand per config, so store the redis instance
            upstashLimiter = { Redis, Ratelimit, redis }
        } catch (e) {
            console.warn('[RateLimiter] Upstash import failed, using in-memory fallback:', e)
            upstashLimiter = null
        }
    }

    upstashReady = true
    return upstashLimiter
}

// Cache created limiters by config key
const upstashLimiterCache = new Map<string, any>()

async function checkUpstashRateLimit(
    identifier: string,
    options: RateLimitOptions
): Promise<NextResponse | null> {
    const upstash = await getUpstashLimiter()
    if (!upstash) return null // Will fall through to in-memory

    const cacheKey = `${options.keyPrefix}:${options.maxRequests}:${options.windowSeconds}`
    let limiter = upstashLimiterCache.get(cacheKey)

    if (!limiter) {
        limiter = new upstash.Ratelimit({
            redis: upstash.redis,
            limiter: upstash.Ratelimit.slidingWindow(options.maxRequests, `${options.windowSeconds} s`),
            prefix: `rl:${options.keyPrefix}`,
        })
        upstashLimiterCache.set(cacheKey, limiter)
    }

    const key = `${options.keyPrefix}:${identifier}`
    const result = await limiter.limit(key)

    if (!result.success) {
        const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.max(retryAfter, 1)),
                    'X-RateLimit-Limit': String(options.maxRequests),
                    'X-RateLimit-Remaining': String(result.remaining),
                    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
                },
            }
        )
    }

    return null
}

// ============================================
// IN-MEMORY RATE LIMITER (fallback)
// ============================================

interface RateLimitEntry {
    count: number
    resetTime: number
}

const store = new Map<string, RateLimitEntry>()
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

function checkInMemoryRateLimit(
    identifier: string,
    options: RateLimitOptions
): NextResponse | null {
    cleanup()

    const key = `${options.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowMs = options.windowSeconds * 1000

    const entry = store.get(key)

    if (!entry || now > entry.resetTime) {
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

// ============================================
// PUBLIC API
// ============================================

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
 * Uses Upstash Redis if configured, otherwise falls back to in-memory.
 * Returns null if within limits, or a 429 NextResponse if exceeded.
 */
export async function checkRateLimit(
    identifier: string,
    options: RateLimitOptions
): Promise<NextResponse | null> {
    // Try Upstash first
    try {
        const upstashResult = await checkUpstashRateLimit(identifier, options)
        if (upstashResult !== null) return upstashResult
        // If upstash is configured and returned null, the request is allowed
        const upstash = await getUpstashLimiter()
        if (upstash) return null
    } catch (e) {
        // Upstash error — fall through to in-memory
        console.warn('[RateLimiter] Upstash error, falling back to in-memory:', e)
    }

    // Fallback to in-memory
    return checkInMemoryRateLimit(identifier, options)
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
