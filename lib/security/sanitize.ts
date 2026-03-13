/**
 * Input Sanitizer — lightweight, zero-dependency
 * 
 * Uses DOMParser-free approach suitable for server-side (Node.js).
 * For HTML content: strips dangerous tags/attributes via allowlist regex.
 * For text input: strips angle brackets and trims.
 */

// ============================================
// ALLOWED TAGS & ATTRIBUTES
// ============================================

const ALLOWED_TAGS = new Set([
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
])

const ALLOWED_ATTRIBUTES = new Set([
    'class', 'id', 'style', 'title', 'lang', 'dir',
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height', 'loading',
    'colspan', 'rowspan', 'align', 'valign', 'scope', 'span',
    'border', 'cellpadding', 'cellspacing',
])

// ============================================
// SANITIZE HTML 
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses allowlist approach — only safe HTML tags and attributes pass through.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    // 1. Remove script tags and their content
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // 2. Remove event handlers (onclick, onerror, etc.)  
    clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')

    // 3. Remove javascript: and data: URIs in attributes
    clean = clean.replace(/(href|src|action)\s*=\s*["']?\s*(?:javascript|data|vbscript):/gi, '$1="')

    // 4. Strip disallowed tags (keep content, remove tag)
    clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
        const lowerTag = tag.toLowerCase()
        if (ALLOWED_TAGS.has(lowerTag)) {
            // Keep tag but strip disallowed attributes
            return match.replace(/\s+([a-zA-Z\-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/g, (attrMatch, attrName) => {
                return ALLOWED_ATTRIBUTES.has(attrName.toLowerCase()) ? attrMatch : ''
            })
        }
        // Strip the tag entirely (discard)
        return ''
    })

    return clean
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
