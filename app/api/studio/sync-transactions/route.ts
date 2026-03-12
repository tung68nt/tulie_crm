import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncTransactionsFromSePay } from '@/lib/supabase/services/payment-service'

/**
 * SePay Transaction Sync API (Reconciliation)
 * Đối soát giao dịch định kỳ từ SePay User API
 * 
 * POST /api/studio/sync-transactions
 * Body: { limit?, dateMin?, dateMax? }
 * 
 * Requires: Admin authentication
 */
export async function POST(req: NextRequest) {
    try {
        // Auth check - only admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 })
        }

        const body = await req.json().catch(() => ({}))

        const result = await syncTransactionsFromSePay({
            limit: body.limit,
            dateMin: body.dateMin,
            dateMax: body.dateMax,
        })

        return NextResponse.json({
            success: true,
            message: `Đồng bộ xong: ${result.processed}/${result.total} giao dịch, ${result.matched} khớp đơn hàng, ${result.errors} lỗi`,
            ...result,
        })
    } catch (err: any) {
        console.error('[SyncTransactions] Error:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
