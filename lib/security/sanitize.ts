/**
 * HTML Sanitizer — using sanitize-html library
 * 
 * Replaces custom regex-based sanitizer with battle-tested library.
 * Same export API for backward compatibility.
 */
import sanitizeHtmlLib from 'sanitize-html'

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses allowlist approach — only safe HTML tags and attributes pass through.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    return sanitizeHtmlLib(html, {
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
            // Style (for document templates)
            'style',
        ],
        allowedAttributes: {
            '*': ['class', 'id', 'style', 'title', 'lang', 'dir'],
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt', 'width', 'height', 'loading'],
            'td': ['colspan', 'rowspan', 'align', 'valign'],
            'th': ['colspan', 'rowspan', 'align', 'valign', 'scope'],
            'col': ['span', 'width'],
            'colgroup': ['span'],
            'table': ['border', 'cellpadding', 'cellspacing', 'width'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        // Strip everything else (don't just escape)
        disallowedTagsMode: 'discard',
    })
}

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
