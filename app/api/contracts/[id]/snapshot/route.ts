import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'

/**
 * PUT /api/contracts/[id]/snapshot — Save customer_snapshot
 * Persists customer info override on the contract
 * Also syncs back to `customers` table and other contracts of the same customer
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

        // 1. Save snapshot to this contract
        const { error } = await supabase
            .from('contracts')
            .update({ customer_snapshot: snapshot })
            .eq('id', contractId)

        if (error) {
            console.error('Error saving snapshot:', error)
            return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
        }

        // 2. Sync back to customers table + other contracts in same project
        const { data: contract } = await supabase
            .from('contracts')
            .select('customer_id, project_id')
            .eq('id', contractId)
            .single()

        if (contract?.customer_id) {
            // Update customers table with snapshot fields
            const customerUpdate: Record<string, any> = {}
            if (snapshot.company_name) customerUpdate.company_name = snapshot.company_name
            if (snapshot.representative) customerUpdate.representative = snapshot.representative
            if (snapshot.position) customerUpdate.position = snapshot.position
            if (snapshot.email) customerUpdate.email = snapshot.email
            if (snapshot.phone) customerUpdate.phone = snapshot.phone
            if (snapshot.tax_code) customerUpdate.tax_code = snapshot.tax_code
            if (snapshot.address) customerUpdate.address = snapshot.address
            if (snapshot.invoice_address) customerUpdate.invoice_address = snapshot.invoice_address

            if (Object.keys(customerUpdate).length > 0) {
                await supabase
                    .from('customers')
                    .update(customerUpdate)
                    .eq('id', contract.customer_id)
            }

            // Sync snapshot to other contracts in the same project
            if (contract.project_id) {
                await supabase
                    .from('contracts')
                    .update({ customer_snapshot: snapshot })
                    .eq('project_id', contract.project_id)
                    .neq('id', contractId)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error in snapshot endpoint:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
