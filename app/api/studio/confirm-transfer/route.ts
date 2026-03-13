import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/supabase/services/telegram-service'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText } from '@/lib/security/sanitize'

/**
 * Manual Payment Confirmation API
 * Khi khách bấm "Tôi đã chuyển khoản" — gửi yêu cầu xác nhận lên Telegram
 * 
 * PUBLIC endpoint (called from /order/[token] page)
 * Protected by: rate limiting + order existence validation
 * 
 * POST /api/studio/confirm-transfer
 * Body: { order_id, order_number, customer_name, amount, note? }
 */
export async function POST(req: NextRequest) {
    try {
        // Rate limit: 3 requests per IP per 10 minutes
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 3,
            windowSeconds: 600,
            keyPrefix: 'confirm-transfer',
        })
        if (rateLimitResult) return rateLimitResult

        const body = await req.json()
        const { order_id, order_number, customer_name, customer_phone, amount, note } = body

        // Input validation
        if (!order_id || !order_number) {
            return NextResponse.json({ error: 'Missing order_id or order_number' }, { status: 400 })
        }

        // Validate order_id format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(order_id)) {
            return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get order details — verify it exists
        const { data: order } = await supabase
            .from('retail_orders')
            .select('id, order_number, total_amount, paid_amount, payment_status, customer_name, customer_phone')
            .eq('id', order_id)
            .single()

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Additional rate limit per order_id: 3 per 30 minutes
        const orderRateLimit = await checkRateLimit(order_id, {
            maxRequests: 3,
            windowSeconds: 1800,
            keyPrefix: 'confirm-transfer:order',
        })
        if (orderRateLimit) return orderRateLimit

        const remainingAmount = order.total_amount - (order.paid_amount || 0)
        const transferAmount = amount || remainingAmount

        // Sanitize user input
        const cleanNote = note ? sanitizeText(note, 500) : ''

        // Send Telegram notification to team
        await sendTelegramNotification(`
<b>💸 YÊU CẦU XÁC NHẬN CHUYỂN KHOẢN</b>
━━━━━━━━━━━━━━━━━━
📋 Đơn hàng: <b>${order.order_number}</b>
👤 Khách: <b>${order.customer_name || sanitizeText(customer_name || '', 100)}</b>
📱 SĐT: ${order.customer_phone || sanitizeText(customer_phone || '', 20) || 'N/A'}
💰 Số tiền báo chuyển: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transferAmount)}</b>
💳 Còn thiếu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)}
📌 Trạng thái: ${order.payment_status === 'paid' ? '✅ Đã thanh toán đủ' : order.payment_status === 'partial' ? '⚠️ Thanh toán 1 phần' : '🔴 Chưa thanh toán'}
${cleanNote ? `📝 Ghi chú: ${cleanNote}` : ''}
━━━━━━━━━━━━━━━━━━
<i>⚡ Khách bấm "Tôi đã chuyển khoản". Vui lòng kiểm tra sao kê ngân hàng và ghi nhận thanh toán nếu đúng.</i>`, 'notify_retail_payment')

        return NextResponse.json({
            success: true,
            message: 'Yêu cầu xác nhận đã được gửi đến team. Chúng tôi sẽ kiểm tra và xác nhận sớm nhất!',
        })
    } catch (err: any) {
        console.error('[ConfirmTransfer] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
