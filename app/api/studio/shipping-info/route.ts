import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText } from '@/lib/security/sanitize'

/**
 * POST /api/studio/shipping-info — Public endpoint for saving shipping info
 * 
 * Security: Token-based auth (public_token) + rate limiting + input sanitization
 * Called from /portal/order/[id] and /order/[token] pages
 */
export async function POST(req: NextRequest) {
    try {
        // Rate limit: 10 requests per minute per IP
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 10,
            windowSeconds: 60,
            keyPrefix: 'shipping-info:post',
        })
        if (rateLimitResult) return rateLimitResult

        const { token, order_id, shipping_info } = await req.json()

        // Require token for auth (preferred), fallback to order_id for backward compat
        if (!token && !order_id) {
            return NextResponse.json({ error: 'Missing token or order_id' }, { status: 400 })
        }

        if (!shipping_info || typeof shipping_info !== 'object') {
            return NextResponse.json({ error: 'Invalid shipping_info' }, { status: 400 })
        }

        // Sanitize all shipping info fields
        const sanitized = {
            recipient_name: sanitizeText(shipping_info.recipient_name || '', 200),
            recipient_phone: sanitizeText(shipping_info.recipient_phone || '', 20),
            address: sanitizeText(shipping_info.address || '', 500),
            ward: sanitizeText(shipping_info.ward || '', 100),
            province: sanitizeText(shipping_info.province || '', 100),
        }

        const supabase = await createClient()

        // Verify order exists using token (secure) or order_id (legacy)
        let query = supabase
            .from('retail_orders')
            .select('id')

        if (token) {
            query = query.eq('public_token', token)
        } else {
            query = query.eq('id', order_id)
        }

        const { data: order, error: findError } = await query.single()

        if (findError || !order) {
            return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 })
        }

        // Update shipping info using the verified order.id
        const { error } = await supabase
            .from('retail_orders')
            .update({ shipping_info: sanitized })
            .eq('id', order.id)

        if (error) throw error

        return NextResponse.json({ message: 'Đã lưu thông tin nhận hàng' })
    } catch (err: any) {
        console.error('Error saving shipping info:', err)
        return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 })
    }
}
