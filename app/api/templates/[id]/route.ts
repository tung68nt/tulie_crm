import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

/**
 * GET /api/templates/[id] — Requires 'view' permission on templates
 * Returns a single document template by ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission('templates', 'view')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.id === id)

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error: any) {
        console.error('Error fetching template:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
