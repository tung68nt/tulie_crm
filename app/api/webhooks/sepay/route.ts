import { NextRequest, NextResponse } from 'next/server'
import { processWebhookPayment, SepayWebhookPayload } from '@/lib/supabase/services/payment-service'
import { getSystemSetting, verifySepaySignature } from '@/lib/supabase/services/settings-service'

/**
 * SePay Webhook Handler
 * Nhận thông báo giao dịch real-time từ SePay
 * 
 * Luồng xử lý:
 * 1. Xác thực API Key / HMAC
 * 2. Lưu giao dịch vào payment_transactions (idempotent)
 * 3. Phân biệt hệ thống: TLS = Tulie Studio, TLL = Tulie Lab
 * 4. Match đơn hàng retail (B2C) hoặc invoice (B2B)
 * 5. Cập nhật payment_status & ghi activity_log
 * 
 * SePay Timeout: Connection 5s, Response 8s
 * Response format: {"success": true} + HTTP 200/201
 */
export async function POST(req: NextRequest) {
    try {
        const payload: SepayWebhookPayload = await req.json()
        const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key')
        const signature = req.headers.get('x-sepay-signature') || req.headers.get('x-signature')

        console.log(`[SePay Webhook] Received: txn_id=${payload?.id}, type=${payload?.transferType}`)

        // 1. Verify API Key — MANDATORY
        const telegramConfig = await getSystemSetting('telegram_config')
        const storedApiKey = telegramConfig?.sepay_api_key

        if (!storedApiKey) {
            console.error('[SePay Webhook] No API key configured in system settings')
            return NextResponse.json({ success: false, message: 'Webhook not configured' }, { status: 503 })
        }

        // Auth is optional — SePay may be configured with "Không chứng thực"
        if (!authHeader && !signature) {
            console.log('[SePay Webhook] No auth header (SePay configured without authentication)')
        }

        if (authHeader && storedApiKey) {
            let receivedKey = ''
            const match = authHeader.match(/^(?:Apikey|Bearer)\s+(.+)$/i)
            receivedKey = match?.[1] ?? authHeader
            const cleanReceivedKey = receivedKey.trim().replace(/^["']|["']$/g, '')
            const cleanStoredKey = storedApiKey.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '')

            if (cleanReceivedKey !== cleanStoredKey) {
                console.warn('[SePay Webhook] API key mismatch — rejecting')
                return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
            }
        }

        // 2. Verify HMAC Signature (if provided)
        if (signature) {
            const isValid = await verifySepaySignature(payload, signature)
            if (!isValid) {
                return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
            }
        }

        // 3. Process payment via service
        const result = await processWebhookPayment(payload)

        console.log(`[SePay Webhook] Processed: matched=${result.matched}, order=${result.orderNumber}, system=${result.sourceSystem}`)

        // SePay requires: {"success": true} + HTTP 200
        return NextResponse.json({
            success: true,
            matched: result.matched,
            order: result.orderNumber,
        })

    } catch (err: any) {
        console.error('[SePay Webhook] Error:', err)

        // Return 200 for known error types so SePay stops retrying
        if (err.message?.includes('already') || err.message?.includes('not found')) {
            return NextResponse.json({ success: true, message: err.message })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
