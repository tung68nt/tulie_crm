// Payment utility functions (client-safe, no server imports)

export type SourceSystem = 'studio' | 'lab' | 'unknown'

// Pattern: DH_YY_MMDD_STT_VALUE (e.g., DH_25_0312_812_179)
export const ORDER_CODE_PATTERN = /DH_\d{2}_\d{4}_\d+_[A-Z]?\d+/

// Fallback pattern: SePay may strip underscores → DH260310811199
const ORDER_CODE_STRIPPED_PATTERN = /DH\d{2}\d{4}\d{3,}\d+/

/**
 * Normalize order code by removing underscores and converting to uppercase
 * DH_26_0310_811_I99 → DH260310811I99
 */
export function normalizeOrderCode(code: string): string {
    return code.replace(/_/g, '').toUpperCase()
}

/**
 * Detect source system from payment content
 * SEVQR TLS = Tulie Studio, SEVQR TLL = Tulie Lab
 */
export function detectSourceSystem(content: string): SourceSystem {
    if (!content) return 'unknown'
    const upper = content.toUpperCase()
    if (upper.includes('TLS')) return 'studio'
    if (upper.includes('TLL')) return 'lab'
    return 'unknown'
}

/**
 * Extract order code from payment content or code field
 * Match pattern: DH_YY_MMDD_STT_VALUE (with or without underscores)
 */
export function extractOrderCode(content: string, paymentCode?: string | null): string | null {
    // Try payment code first (exact pattern with underscores)
    if (paymentCode) {
        const match = paymentCode.match(ORDER_CODE_PATTERN)
        if (match) return match[0]
        // Try stripped pattern (SePay removes underscores)
        const strippedMatch = paymentCode.match(ORDER_CODE_STRIPPED_PATTERN)
        if (strippedMatch) return strippedMatch[0]
    }
    // Then try content
    if (content) {
        const match = content.match(ORDER_CODE_PATTERN)
        if (match) return match[0]
        // Try stripped pattern
        const strippedMatch = content.match(ORDER_CODE_STRIPPED_PATTERN)
        if (strippedMatch) return strippedMatch[0]
    }
    return null
}

/**
 * Generate standard payment content for QR code
 * Format: SEVQR TLS DH_25_0312_812_179
 */
export function generatePaymentContent(orderNumber: string, system: 'studio' | 'lab' = 'studio'): string {
    const prefix = system === 'studio' ? 'TLS' : 'TLL'
    return `SEVQR ${prefix} ${orderNumber}`
}
