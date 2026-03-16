import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { generateDocument } from '@/lib/supabase/services/document-template-service'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { validateBody, generateDocumentSchema } from '@/lib/security/validation'

/**
 * POST /api/contracts/[id]/generate-document — Authenticated endpoint
 * Generates document from template for a specific contract
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require permission to edit contracts (generate document = edit action)
        const authResult = await requirePermission('contracts', 'edit')
        if (isAuthError(authResult)) return authResult

        const { supabase } = authResult
        const { id: contractId } = await params
        const raw = await request.json()
        const validation = validateBody(raw, generateDocumentSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { type, additionalVariables } = validation.data

        // Find the template matching the type
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.type === type)
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        // Get contract to extract customer_id
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
        return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 })
    }
}
