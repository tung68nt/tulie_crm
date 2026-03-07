import { NextResponse } from 'next/server'
import { generateDocument } from '@/lib/supabase/services/document-template-service'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: contractId } = await params
        const body = await request.json()
        const { type, additionalVariables } = body
        // type: 'contract' | 'order' | 'payment_request' | 'delivery_minutes'

        if (!type) {
            return NextResponse.json({ error: 'Missing document type' }, { status: 400 })
        }

        // Find the template matching the type
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.type === type)
        if (!template) {
            return NextResponse.json({ error: 'Template not found for type: ' + type }, { status: 404 })
        }

        // Get contract to extract customer_id
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: contract, error } = await supabase
            .from('contracts')
            .select('*, customer:customers(*), items:contract_items(*), milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
            .eq('id', contractId)
            .single()

        if (error || !contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        // Generate the document 
        const result = await generateDocument(
            template.id,
            contract.customer_id,
            contractId,
            additionalVariables
        )

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error generating document:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
