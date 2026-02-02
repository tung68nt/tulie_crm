import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CURRENCY_LOCALE, DATE_FORMAT, DATETIME_FORMAT } from '@/lib/constants'

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'VND'): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat(CURRENCY_LOCALE).format(value)
}

// Date formatting
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, DATE_FORMAT)
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, DATETIME_FORMAT)
}

export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

// Percentage formatting
export function formatPercent(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
}

// Text utilities
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
}

export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Phone number formatting (Vietnam)
export function formatPhone(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '')

    // Format as Vietnamese phone number
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    return phone
}

// Tax code formatting
export function formatTaxCode(code: string): string {
    const cleaned = code.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 10)}`
    }
    if (cleaned.length === 13) {
        return `${cleaned.slice(0, 10)}-${cleaned.slice(10)}`
    }
    return code
}

// Generate quote/contract/invoice number
export function generateQuoteNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `QT-${year}-${random}`
}

export function generateContractNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `HD-${year}-${random}`
}

export function generateInvoiceNumber(type: 'output' | 'input' = 'output'): string {
    const now = new Date()
    const year = now.getFullYear()
    const prefix = type === 'output' ? 'HDB' : 'HDM' // Hóa đơn Bán / Hóa đơn Mua
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}-${year}-${random}`
}

// Calculate change percentage
export function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
}

// URL slug generation
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}
