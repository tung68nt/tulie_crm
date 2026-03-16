import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/supabase/services/telegram-service'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText, escapeHtmlEntities } from '@/lib/security/sanitize'
import { validateBody, confirmTransferSchema } from '@/lib/security/validation'

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

        const raw = await req.json()
        const validation = validateBody(raw, confirmTransferSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { order_id, order_number, customer_name, customer_phone, amount, note } = validation.data

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

        // Sanitize and escape user input for Telegram HTML
        const cleanNote = note ? sanitizeText(note, 500) : ''
        const escapedName = escapeHtmlEntities(order.customer_name || sanitizeText(customer_name || '', 100))
        const escapedPhone = escapeHtmlEntities(order.customer_phone || sanitizeText(customer_phone || '', 20) || 'N/A')

        // Send Telegram notification to team 
        await sendTelegramNotification(`
<b>💸 YÊU CẦU XÁC NHẬN CHUYỂN KHOẢN</b>
━━━━━━━━━━━━━━━━━━
📋 Đơn hàng: <b>${escapeHtmlEntities(order.order_number)}</b>
👤 Khách: <b>${escapedName}</b>
📱 SĐT: ${escapedPhone}
💰 Số tiền báo chuyển: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transferAmount)}</b>
💳 Còn thiếu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)}
📌 Trạng thái: ${order.payment_status === 'paid' ? '✅ Đã thanh toán đủ' : order.payment_status === 'partial' ? '⚠️ Thanh toán 1 phần' : '🔴 Chưa thanh toán'}
${cleanNote ? `📝 Ghi chú: ${escapeHtmlEntities(cleanNote)}` : ''}
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
