import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string, docId: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id, docId } = await params

        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        // Get current status
        const { data: doc, error: fetchErr } = await supabase
            .from('contract_documents')
            .select('status')
            .eq('id', docId)
            .eq('contract_id', id)
            .single()

        if (fetchErr || !doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const newStatus = doc.status === 'signed' ? 'draft' : 'signed'

        const { error } = await supabase
            .from('contract_documents')
            .update({ status: newStatus })
            .eq('id', docId)
            .eq('contract_id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: newStatus })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
