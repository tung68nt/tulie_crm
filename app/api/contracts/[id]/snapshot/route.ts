import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'

/**
 * PUT /api/contracts/[id]/snapshot — Save customer_snapshot
 * Persists customer info override on the contract
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId } = await params
        const snapshot = await request.json()

        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('contracts')
            .update({ customer_snapshot: snapshot })
            .eq('id', contractId)

        if (error) {
            console.error('Error saving snapshot:', error)
            return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error in snapshot endpoint:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
