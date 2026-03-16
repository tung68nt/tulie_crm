import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/security/auth-guard'
import { syncTransactionsFromSePay } from '@/lib/supabase/services/payment-service'
import { validateBody, syncTransactionsSchema } from '@/lib/security/validation'

/**
 * SePay Transaction Sync API (Reconciliation)
 * Đối soát giao dịch định kỳ từ SePay User API
 * 
 * POST /api/studio/sync-transactions
 * Body: { limit?, dateMin?, dateMax? }
 * 
 * Requires: Admin role
 */
export async function POST(req: NextRequest) {
    try {
        // Require admin role
        const authResult = await requireAdmin()
        if (isAuthError(authResult)) return authResult

        const raw = await req.json().catch(() => ({}))
        const validation = validateBody(raw, syncTransactionsSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const body = validation.data

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
