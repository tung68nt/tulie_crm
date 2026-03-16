/**
 * Input Sanitizer — uses sanitize-html library for robust XSS protection
 * 
 * SECURITY: Replaces previous regex-based approach which was bypassable.
 * sanitize-html uses a proper HTML parser with allowlist approach.
 */

import sanitizeHtmlLib from 'sanitize-html'

// ============================================
// ALLOWED TAGS & ATTRIBUTES (for document templates / rich content)
// ============================================

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
    allowedTags: [
        // Structure
        'div', 'span', 'p', 'br', 'hr',
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Text formatting
        'b', 'i', 'u', 'strong', 'em', 's', 'small', 'sub', 'sup', 'mark',
        // Lists
        'ul', 'ol', 'li',
        // Tables
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
        // Links & media
        'a', 'img',
        // Semantic
        'blockquote', 'pre', 'code', 'address', 'section', 'article', 'header', 'footer',
        'nav', 'main', 'aside', 'figure', 'figcaption', 'details', 'summary',
        // Style (for document templates — needed for print CSS)
        'style',
    ],
    allowedAttributes: {
        '*': ['class', 'id', 'style', 'title', 'lang', 'dir'],
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height', 'loading'],
        'th': ['colspan', 'rowspan', 'align', 'valign', 'scope'],
        'td': ['colspan', 'rowspan', 'align', 'valign'],
        'col': ['span'],
        'table': ['border', 'cellpadding', 'cellspacing'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Block javascript:, data:, vbscript: URIs
    disallowedTagsMode: 'discard',
    // Allow style tags (needed for document templates print CSS)
    allowVulnerableTags: false,
}

// Strict options for user-facing content (no style tags, fewer elements)
const STRICT_SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
    ...SANITIZE_OPTIONS,
    allowedTags: (SANITIZE_OPTIONS.allowedTags as string[]).filter(t => t !== 'style'),
}

// ============================================
// SANITIZE HTML 
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses sanitize-html library with allowlist approach.
 * 
 * @param html - Raw HTML string
 * @param strict - If true, disallows style tags (use for user-facing content)
 */
export function sanitizeHtml(html: string, strict: boolean = false): string {
    if (!html) return ''
    return sanitizeHtmlLib(html, strict ? STRICT_SANITIZE_OPTIONS : SANITIZE_OPTIONS)
}

// ============================================
// TEXT SANITIZATION
// ============================================

/**
 * Validate and sanitize text input (for form fields, not HTML content)
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
    if (!input) return ''
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, '') // Strip angle brackets
}

// ============================================
// HTML ENTITY ESCAPING (for Telegram, etc.)
// ============================================

/**
 * Escape HTML entities to prevent injection in HTML-formatted messages
 * Use for Telegram notifications, email subjects, etc.
 */
export function escapeHtmlEntities(text: string): string {
    if (!text) return ''
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// ============================================
// VALIDATORS
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 320
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
    if (!phone) return false
    // Allow digits, spaces, dashes, dots, plus, parentheses
    const phoneRegex = /^[+]?[\d\s\-().]{8,20}$/
    return phoneRegex.test(phone)
}
