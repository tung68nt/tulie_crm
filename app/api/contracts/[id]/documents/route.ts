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
 * Accepts optional { include_proposal_appendix: boolean } to toggle proposal appendix
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId } = await params
        const body = await request.json().catch(() => ({}))

        // If include_proposal_appendix is specified, update contract before regenerating
        if (typeof body.include_proposal_appendix === 'boolean') {
            const supabase = createAdminClient()
            await supabase
                .from('contracts')
                .update({ include_proposal_appendix: body.include_proposal_appendix })
                .eq('id', contractId)
        }

        await generateDocumentBundle(contractId)
        
        // Return fresh docs from DB
        const documents = await getContractDocuments(contractId)
        return NextResponse.json({ documents, regenerated: true })
    } catch (error: any) {
        console.error('Error regenerating contract documents:', error)
        return NextResponse.json({ error: 'Failed to regenerate documents' }, { status: 500 })
    }
}
