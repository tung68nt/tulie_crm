import { NextRequest, NextResponse } from 'next/server'
import { updateProjectStatus, updateProject, createAcceptanceReport } from '@/lib/supabase/services/project-service'

export async function PATCH(req: NextRequest, { params }: any) {
    try {
        const { id } = await params
        const body = await req.json()

        if (body.status) {
            await updateProjectStatus(id, body.status)
        } else {
            await updateProject(id, body)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: any) {
    try {
        const { id } = await params
        const body = await req.json()

        if (body.action === 'create_acceptance_report') {
            // Generate report number: BBNT-YYYYMMDD-XXX
            const now = new Date()
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
            const reportNumber = `BBNT-${dateStr}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

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
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
