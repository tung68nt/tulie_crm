import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/supabase/services/telegram-service'

/**
 * Manual Payment Confirmation API
 * Khi khách bấm "Tôi đã chuyển khoản" — gửi yêu cầu xác nhận lên Telegram
 * 
 * POST /api/studio/confirm-transfer
 * Body: { order_id, order_number, customer_name, amount, note? }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { order_id, order_number, customer_name, customer_phone, amount, note } = body

        if (!order_id || !order_number) {
            return NextResponse.json({ error: 'Missing order_id or order_number' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get order details
        const { data: order } = await supabase
            .from('retail_orders')
            .select('id, order_number, total_amount, paid_amount, payment_status, customer_name, customer_phone')
            .eq('id', order_id)
            .single()

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const remainingAmount = order.total_amount - (order.paid_amount || 0)
        const transferAmount = amount || remainingAmount

        // Send Telegram notification to team
        await sendTelegramNotification(`
<b>💸 YÊU CẦU XÁC NHẬN CHUYỂN KHOẢN</b>
━━━━━━━━━━━━━━━━━━
📋 Đơn hàng: <b>${order.order_number}</b>
👤 Khách: <b>${order.customer_name || customer_name}</b>
📱 SĐT: ${order.customer_phone || customer_phone || 'N/A'}
💰 Số tiền báo chuyển: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transferAmount)}</b>
💳 Còn thiếu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)}
📌 Trạng thái: ${order.payment_status === 'paid' ? '✅ Đã thanh toán đủ' : order.payment_status === 'partial' ? '⚠️ Thanh toán 1 phần' : '🔴 Chưa thanh toán'}
${note ? `📝 Ghi chú: ${note}` : ''}
━━━━━━━━━━━━━━━━━━
<i>⚡ Khách bấm "Tôi đã chuyển khoản". Vui lòng kiểm tra sao kê ngân hàng và ghi nhận thanh toán nếu đúng.</i>
<i>🏦 STK: 104002106705 - NGHIEM THI LIEN - Vietinbank</i>`, 'notify_retail_payment')

        return NextResponse.json({
            success: true,
            message: 'Yêu cầu xác nhận đã được gửi đến team. Chúng tôi sẽ kiểm tra và xác nhận sớm nhất!',
        })
    } catch (err: any) {
        console.error('[ConfirmTransfer] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
