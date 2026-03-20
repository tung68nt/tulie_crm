import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { getContractDocuments, generateDocumentBundle } from '@/lib/supabase/services/document-template-service'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/contracts/[id]/documents
 * Returns list of all generated documents for a contract
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId } = await params
        const documents = await getContractDocuments(contractId)

        return NextResponse.json({ documents })
    } catch (error: any) {
        console.error('Error fetching contract documents:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }
}

/**
 * POST /api/contracts/[id]/documents
 * Regenerate all draft documents for a contract
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId } = await params
        
        // Debug: get milestones before regeneration
        const supabase = createAdminClient()
        const { data: milestones } = await supabase
            .from('contract_milestones')
            .select('id, name, type, amount, status')
            .eq('contract_id', contractId)
            .order('due_date', { ascending: true })
        
        console.log(`[POST /documents] Contract ${contractId} milestones:`, 
            milestones?.map(m => ({ name: m.name, type: m.type, amount: m.amount }))
        )
        
        const docs = await generateDocumentBundle(contractId)

        // Also get final docs from DB to confirm
        const finalDocs = await getContractDocuments(contractId)

        return NextResponse.json({ 
            documents: finalDocs,
            generated: docs?.length || 0,
            milestones: milestones?.map(m => ({ name: m.name, type: m.type, amount: m.amount })),
            regenerated: true 
        })
    } catch (error: any) {
        console.error('Error regenerating contract documents:', error)
        return NextResponse.json({ error: 'Failed to regenerate documents' }, { status: 500 })
    }
}
