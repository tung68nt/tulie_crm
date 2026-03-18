import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recalculateOrderPayment } from '@/lib/supabase/services/retail-order-service'

/**
 * POST /api/studio/recalculate-payment
 * Recalculate order payment from actual matched transactions.
 * Used to fix orders with incorrect paid_amount (double-charge from manual + webhook).
 * 
 * Body: { orderId: string }
 */
export async function POST(req: NextRequest) {
    try {
        // Auth check — only logged-in users can recalculate
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = await req.json()
        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
        }

        const result = await recalculateOrderPayment(orderId)

        return NextResponse.json({
            success: true,
            ...result,
        })
    } catch (err: any) {
        console.error('[Recalculate Payment] Error:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
