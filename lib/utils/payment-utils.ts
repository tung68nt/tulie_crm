// Payment utility functions (client-safe, no server imports)

export type SourceSystem = 'studio' | 'lab' | 'unknown'

// Pattern: DH_YY_MMDD_STT_VALUE (e.g., DH_25_0312_812_179)
export const ORDER_CODE_PATTERN = /DH_\d{2}_\d{4}_\d+_\d+/

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
 * Match pattern: DH_YY_MMDD_STT_VALUE
 */
export function extractOrderCode(content: string, paymentCode?: string | null): string | null {
    // Try payment code first
    if (paymentCode) {
        const match = paymentCode.match(ORDER_CODE_PATTERN)
        if (match) return match[0]
    }
    // Then try content
    if (content) {
        const match = content.match(ORDER_CODE_PATTERN)
        if (match) return match[0]
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
