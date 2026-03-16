import { NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/security/auth-guard'

/**
 * POST /api/reset-templates — Admin-only endpoint
 * Deletes all custom document templates (dangerous operation)
 * SECURITY: Uses POST instead of GET to prevent accidental triggering via
 * browser prefetch, link previews, or injected img/link tags.
 */
export async function POST() {
    try {
        const authResult = await requireAdmin()
        if (isAuthError(authResult)) return authResult

        const { supabase } = authResult

        const { error } = await supabase.from('document_templates').delete().neq('id', 'default-0')
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: "Deleted custom templates." })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
