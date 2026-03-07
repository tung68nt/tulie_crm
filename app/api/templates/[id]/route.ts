import { NextResponse } from 'next/server'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.id === id)

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error: any) {
        console.error('Error fetching template:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
