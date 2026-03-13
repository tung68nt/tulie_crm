/**
 * Structured Logger
 * 
 * JSON-based logging with automatic context injection and sensitive data redaction.
 * Use this instead of console.log for production-grade logging.
 * 
 * Usage:
 *   import { logger } from '@/lib/logging/logger'
 *   logger.info('Payment processed', { orderId, amount })
 *   logger.error('Payment failed', { orderId, error: err.message })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Fields that should NEVER appear in logs
const SENSITIVE_KEYS = new Set([
    'password', 'password_hash', 'token', 'secret', 'api_key', 'apikey',
    'authorization', 'cookie', 'session', 'credit_card', 'card_number',
    'cvv', 'ssn', 'private_key', 'service_role_key', 'anon_key',
    'supabase_service_role_key', 'resend_api_key', 'sepay_api_key',
])

function redactSensitive(obj: Record<string, any>, depth = 0): Record<string, any> {
    if (depth > 3) return obj // Prevent deep recursion
    const redacted: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase().replace(/[-_]/g, '_')
        if (SENSITIVE_KEYS.has(lowerKey)) {
            redacted[key] = '[REDACTED]'
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            redacted[key] = redactSensitive(value, depth + 1)
        } else {
            redacted[key] = value
        }
    }
    return redacted
}

function formatLog(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: Record<string, any> = {
        timestamp: new Date().toISOString(),
        level,
        message,
    }

    if (context && Object.keys(context).length > 0) {
        entry.context = redactSensitive(context)
    }

    return JSON.stringify(entry)
}

export const logger = {
    debug(message: string, context?: Record<string, any>) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(formatLog('debug', message, context))
        }
    },

    info(message: string, context?: Record<string, any>) {
        console.log(formatLog('info', message, context))
    },

    warn(message: string, context?: Record<string, any>) {
        console.warn(formatLog('warn', message, context))
    },

    error(message: string, context?: Record<string, any>) {
        console.error(formatLog('error', message, context))
    },

    /**
     * Log an API request with standard fields
     */
    api(method: string, path: string, status: number, context?: Record<string, any>) {
        const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
        this[level](`${method} ${path} → ${status}`, context)
    },

    /**
     * Log a security-relevant event (auth, permissions, rate limit)
     */
    security(event: string, context?: Record<string, any>) {
        this.warn(`[SECURITY] ${event}`, context)
    },
}
