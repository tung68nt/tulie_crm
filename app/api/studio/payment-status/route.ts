import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'

/**
 * Payment Status Polling API
 * Client polls this endpoint to check real-time payment status
 * 
 * PUBLIC endpoint (called from /order/[token] page)
 * Protected by: public_token verification (not order_id) + rate limiting
 * 
 * GET /api/studio/payment-status?token=xxx
 * Legacy support: GET /api/studio/payment-status?order_id=xxx (deprecated)
 */
export async function GET(req: NextRequest) {
    try {
        // Rate limit: 30 requests per minute per IP (polling every 5s = 12/min)
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 30,
            windowSeconds: 60,
            keyPrefix: 'payment-status',
        })
        if (rateLimitResult) return rateLimitResult

        const token = req.nextUrl.searchParams.get('token')
        const orderId = req.nextUrl.searchParams.get('order_id')

        if (!token && !orderId) {
            return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 })
        }

        const supabase = await createClient()

        // Prefer token-based lookup (secure), fallback to order_id (legacy)
        let order
        if (token) {
            const { data } = await supabase
                .from('retail_orders')
                .select('id, total_amount, paid_amount, payment_status')
                .eq('public_token', token)
                .single()
            order = data
        } else if (orderId) {
            const { data } = await supabase
                .from('retail_orders')
                .select('id, total_amount, paid_amount, payment_status')
                .eq('id', orderId)
                .single()
            order = data
        }

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Get transactions for this order
        const { data: transactions } = await supabase
            .from('payment_transactions')
            .select('id, amount_in, transaction_date, gateway, content, source_system')
            .eq('matched_order_id', order.id)
            .order('transaction_date', { ascending: false })

        return NextResponse.json({
            payment_status: order.payment_status,
            paid_amount: order.paid_amount || 0,
            total_amount: order.total_amount,
            remaining_amount: order.total_amount - (order.paid_amount || 0),
            transactions: (transactions || []).map(tx => ({
                id: tx.id,
                amount: tx.amount_in,
                date: tx.transaction_date,
                gateway: tx.gateway,
            })),
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        })
    } catch (err: any) {
        console.error('[Payment Status] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
