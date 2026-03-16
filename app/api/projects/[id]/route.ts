import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { updateProjectStatus, updateProject, createAcceptanceReport } from '@/lib/supabase/services/project-service'
import { validateBody, updateProjectSchema, projectActionSchema } from '@/lib/security/validation'

/**
 * PATCH /api/projects/[id] — Requires 'edit' permission on projects
 * Updates project status or fields
 */
export async function PATCH(req: NextRequest, { params }: any) {
    try {
        const authResult = await requirePermission('projects', 'edit')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const raw = await req.json()

        if (raw.status && !raw.title && !raw.description) {
            // Status-only update (legacy path)
            await updateProjectStatus(id, raw.status)
        } else {
            // Full field update — validate with Zod
            const validation = validateBody(raw, updateProjectSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            await updateProject(id, validation.data)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error updating project:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }
}

/**
 * POST /api/projects/[id] — Authenticated endpoint
 * Handles project actions (e.g., create acceptance report)
 */
export async function POST(req: NextRequest, { params }: any) {
    try {
        const authResult = await requirePermission('projects', 'create')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const raw = await req.json()
        const validation = validateBody(raw, projectActionSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const body = validation.data

        if (body.action === 'create_acceptance_report') {
            // Generate report number: BBNT-YYYYMMDD-XXX
            const now = new Date()
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
            const reportNumber = `BBNT-${dateStr}-${crypto.randomUUID().substring(0, 5).toUpperCase()}`

            const report = await createAcceptanceReport({
                project_id: id,
                report_number: reportNumber,
                report_date: now.toISOString(),
                is_signed: false,
                notes: body.notes || '',
            })
            return NextResponse.json({ success: true, report })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (error: any) {
        console.error('Error in project action:', error)
        return NextResponse.json({ error: 'Failed to perform project action' }, { status: 500 })
    }
}
