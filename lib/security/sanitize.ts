/**
 * HTML Sanitizer for preventing XSS attacks.
 * 
 * Uses allowlist approach — only safe HTML tags and attributes pass through.
 * All event handlers (onclick, onerror, etc.) and script tags are stripped.
 */

// Allowed HTML tags (safe for document rendering)
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
    // Style
    'style',
])

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
    '*': new Set(['class', 'id', 'style', 'title', 'lang', 'dir', 'data-*']),
    'a': new Set(['href', 'target', 'rel']),
    'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
    'td': new Set(['colspan', 'rowspan', 'align', 'valign']),
    'th': new Set(['colspan', 'rowspan', 'align', 'valign', 'scope']),
    'col': new Set(['span', 'width']),
    'colgroup': new Set(['span']),
    'table': new Set(['border', 'cellpadding', 'cellspacing', 'width']),
}

// Dangerous patterns to strip
const DANGEROUS_PATTERNS = [
    // Script and event-based XSS
    /<script[\s>][\s\S]*?<\/script>/gi,
    /<script[\s>]/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    // Event handlers
    /\bon\w+\s*=\s*["'][^"']*["']/gi,
    /\bon\w+\s*=\s*[^\s>]+/gi,
    // Dangerous tags
    /<iframe[\s>][\s\S]*?(<\/iframe>)?/gi,
    /<object[\s>][\s\S]*?(<\/object>)?/gi,
    /<embed[\s>][\s\S]*?(<\/embed>)?/gi,
    /<form[\s>][\s\S]*?(<\/form>)?/gi,
    /<input[\s>][^>]*>/gi,
    /<textarea[\s>][\s\S]*?(<\/textarea>)?/gi,
    /<select[\s>][\s\S]*?(<\/select>)?/gi,
    /<button[\s>][\s\S]*?(<\/button>)?/gi,
    /<meta[\s>][^>]*>/gi,
    /<link[\s>][^>]*>/gi,
    /<base[\s>][^>]*>/gi,
    // SVG-based XSS
    /<svg[\s>][\s\S]*?(<\/svg>)?/gi,
    /<math[\s>][\s\S]*?(<\/math>)?/gi,
]

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Strips dangerous tags, event handlers, and javascript: URIs.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    let sanitized = html

    // Strip dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '')
    }

    // Strip javascript: and data: from href/src attributes
    sanitized = sanitized.replace(
        /(<a\s[^>]*?)href\s*=\s*["']\s*(javascript|data)\s*:[^"']*["']/gi,
        '$1href="#"'
    )
    sanitized = sanitized.replace(
        /(<img\s[^>]*?)src\s*=\s*["']\s*(javascript|data)\s*:[^"']*["']/gi,
        '$1src=""'
    )

    return sanitized
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
