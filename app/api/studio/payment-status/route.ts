import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/supabase/services/payment-service'

/**
 * Payment Status Polling API
 * Client polls this endpoint every 5s to check real-time payment status
 * 
 * GET /api/studio/payment-status?order_id=xxx
 */
export async function GET(req: NextRequest) {
    try {
        const orderId = req.nextUrl.searchParams.get('order_id')

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
        }

        const status = await checkPaymentStatus(orderId)

        return NextResponse.json(status, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        })
    } catch (err: any) {
        if (err.message === 'Order not found') {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }
        console.error('[Payment Status] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
