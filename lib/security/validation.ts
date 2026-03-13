/**
 * Zod validation schemas for API input validation
 * 
 * Centralized schemas to validate and sanitize API request bodies.
 * Use these in API routes: const data = schema.parse(await req.json())
 */
import { z } from 'zod'

// ============================================
// COMMON VALIDATORS
// ============================================

/** UUID v4 format */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/** Vietnamese phone number */
export const phoneSchema = z.string()
    .min(8, 'Phone number too short')
    .max(20, 'Phone number too long')
    .regex(/^[+]?[\d\s\-().]{8,20}$/, 'Invalid phone number format')

/** Email address */
export const emailSchema = z.string()
    .email('Invalid email format')
    .max(320, 'Email too long')

/** Safe text (no HTML tags) */
export const safeTextSchema = (maxLength: number = 1000) =>
    z.string().max(maxLength).transform(val => val.replace(/[<>]/g, '').trim())

// ============================================
// API SPECIFIC SCHEMAS
// ============================================

/** POST /api/studio/confirm-transfer */
export const confirmTransferSchema = z.object({
    order_id: uuidSchema,
    order_number: z.string().min(1).max(50),
    customer_name: z.string().max(200).optional(),
    customer_phone: z.string().max(20).optional(),
    amount: z.number().positive().optional(),
    note: z.string().max(500).optional(),
})

/** POST /api/leads (public form) */
export const createLeadSchema = z.object({
    full_name: z.string().min(1, 'Name required').max(200),
    company_name: z.string().max(200).optional(),
    phone: phoneSchema,
    email: emailSchema.optional().or(z.literal('')),
    business_type: z.string().max(100).optional(),
    message: z.string().max(2000).optional(),
})

/** PATCH /api/leads (authenticated) */
export const updateLeadSchema = z.object({
    id: uuidSchema,
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
    notes: z.string().max(5000).optional(),
})

/** POST /api/send-email */
export const sendEmailSchema = z.object({
    type: z.enum(['quotation', 'invoice', 'contract', 'notification']),
    to: z.string().email(),
    data: z.record(z.string(), z.unknown()),
})

/** PATCH /api/projects/[id] */
export const updateProjectSchema = z.object({
    status: z.enum(['todo', 'in_progress', 'review', 'completed']).optional(),
}).passthrough() // Allow other fields for general project updates

/** POST /api/projects/[id] */
export const projectActionSchema = z.object({
    action: z.literal('create_acceptance_report'),
    notes: z.string().max(2000).optional(),
})

/** POST /api/studio/sync-transactions */
export const syncTransactionsSchema = z.object({
    limit: z.number().int().min(1).max(5000).optional(),
    dateMin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateMax: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// ============================================
// HELPER
// ============================================

/**
 * Validate request body against a Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateBody<T>(
    body: unknown,
    schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(body)
    if (!result.success) {
        const firstError = result.error.issues[0]
        return {
            success: false,
            error: firstError
                ? `${firstError.path.join('.')}: ${firstError.message}`
                : 'Validation failed',
        }
    }
    return { success: true, data: result.data }
}
