import { NextRequest, NextResponse } from 'next/server'
import { processWebhookPayment, SepayWebhookPayload } from '@/lib/supabase/services/payment-service'
import { getSystemSetting, verifySepaySignature } from '@/lib/supabase/services/settings-service'
import { validateBody, sepayWebhookSchema } from '@/lib/security/validation'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/webhooks/sepay — Health check
 * Kiểm tra webhook đã cấu hình đúng chưa
 */
export async function GET() {
    try {
        const telegramConfig = await getSystemSetting('telegram_config')
        const hasApiKey = !!telegramConfig?.sepay_api_key
        const hasSecretKey = !!telegramConfig?.sepay_secret_key

        // Lấy giao dịch gần nhất
        const supabase = await createClient()
        const { data: lastTx } = await supabase
            .from('payment_transactions')
            .select('id, transaction_date, content, source_system')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const lastTxTime = lastTx?.transaction_date ? new Date(lastTx.transaction_date) : null
        const minutesAgo = lastTxTime ? Math.round((Date.now() - lastTxTime.getTime()) / 60000) : null

        return NextResponse.json({
            status: 'ok',
            webhook_url: '/api/webhooks/sepay',
            config: {
                api_key_configured: hasApiKey,
                secret_key_configured: hasSecretKey,
            },
            last_transaction: lastTx ? {
                id: lastTx.id,
                date: lastTx.transaction_date,
                minutes_ago: minutesAgo,
                source: lastTx.source_system,
                content_preview: lastTx.content?.substring(0, 50),
            } : null,
            help: !hasApiKey 
                ? '⚠️ Chưa cấu hình SePay API Key. Vào Cài đặt → Cổng thanh toán để cấu hình.'
                : '✅ Webhook đã sẵn sàng. Cấu hình URL này vào SePay Dashboard.',
        })
    } catch (err: any) {
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
    }
}

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
        const raw = await req.json()
        const validation = validateBody(raw, sepayWebhookSchema)
        if (!validation.success) {
            console.warn('[SePay Webhook] Invalid payload:', validation.error)
            return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
        }
        const payload = validation.data as SepayWebhookPayload
        const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key')
        const signature = req.headers.get('x-sepay-signature') || req.headers.get('x-signature')

        console.log(`[SePay Webhook] Received: type=${payload?.transferType}`)

        // 1. Verify API Key — Optional: only enforced if configured
        const telegramConfig = await getSystemSetting('telegram_config')
        const storedApiKey = telegramConfig?.sepay_api_key

        if (storedApiKey) {
            // API key is configured → enforce authentication
            if (!authHeader && !signature) {
                console.warn('[SePay Webhook] Rejected: API key configured but no auth provided')
                return NextResponse.json({ success: false, message: 'Unauthorized: missing credentials' }, { status: 401 })
            }

            if (authHeader) {
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
        } else {
            // No API key configured → accept without auth (backward compatible)
            console.log('[SePay Webhook] No API key configured — accepting without auth')
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

        console.log(`[SePay Webhook] Processed: matched=${result.matched}, system=${result.sourceSystem}`)

        // SECURITY: SePay only requires {"success": true} + HTTP 200
        // Don't leak internal order matching details
        return NextResponse.json({
            success: true,
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
