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
        const body = await request.json()
        const is_visible = Boolean(body.is_visible)

        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('contract_documents')
            .update({ is_visible_on_portal: is_visible })
            .eq('id', docId)
            .eq('contract_id', id)

        if (error) {
            console.error('Toggle visibility error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, is_visible })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
