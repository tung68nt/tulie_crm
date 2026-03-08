import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordRetailPayment, getRetailOrders } from '@/lib/supabase/services/retail-order-service'
import { recordInvoicePayment } from '@/lib/supabase/services/invoice-service'
import { sendTelegramNotification } from '@/lib/supabase/services/telegram-service'
import { verifySepaySignature, getSystemSetting } from '@/lib/supabase/services/settings-service'

/**
 * SePay Webhook Handler
 * Standard SePay payload fields: 
 * - id: Transaction ID
 * - content: Transfer description
 * - transferAmount: Amount transferred
 * - transferType: "in" or "out"
 * - gateway: Bank name
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()
        const signature = req.headers.get('x-sepay-signature') || req.headers.get('x-signature')
        const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key')

        console.log('SePay Webhook Received:', payload)

        // 1. Verify API Key / Token if provided (Academy style)
        const telegramConfig = await getSystemSetting('telegram_config')
        const storedApiKey = telegramConfig?.sepay_api_key

        if (authHeader && storedApiKey) {
            let receivedKey = ''
            const match = authHeader.match(/^(?:Apikey|Bearer)\s+(.+)$/i)
            receivedKey = match?.[1] ?? authHeader
            const cleanReceivedKey = receivedKey.trim().replace(/^["']|["']$/g, '')
            const cleanStoredKey = storedApiKey.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '')

            if (cleanReceivedKey !== cleanStoredKey) {
                console.warn('SePay Webhook Auth Failed: API key mismatch')
                return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 })
            }
        }

        // 2. Verify HMAC Signature
        if (signature) {
            const isValid = await verifySepaySignature(payload, signature)
            if (!isValid) {
                console.warn('SePay Webhook Signature Failed')
                return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
            }
        }

        const { content, transferAmount, transferType, id: transactionId, description: payloadDescription, code: paymentCode } = payload

        // Only process incoming transfers
        if (transferType !== 'in') {
            return NextResponse.json({ message: 'Ignored: Not an incoming transfer' }, { status: 200 })
        }

        const description = (content || payloadDescription || '').trim().toUpperCase()
        const amount = parseFloat(transferAmount)

        if (isNaN(amount)) {
            return NextResponse.json({ message: 'Invalid payload: missing amount' }, { status: 400 })
        }

        // 1. Try to match Retail Order (B2C)
        // Standard pattern: DH_YY_MMDD_STT_VALUE or just order_number
        // We look for DH_XX_XXXX_XXX_XXX in the description
        // Match pattern: DH_YY_MMDD_STT_VALUE or just order_number
        const orderCodePattern = /DH_\d{2}_\d{4}_\d+_\d+/i
        let orderNumber: string | null = null

        const match = description.match(orderCodePattern) || (paymentCode ? paymentCode.match(orderCodePattern) : null)
        if (match) {
            orderNumber = match[0].toUpperCase()
            const supabase = await createClient()
            const { data: order } = await supabase
                .from('retail_orders')
                .select('id, order_number')
                .eq('order_number', orderNumber)
                .single()

            if (order) {
                await recordRetailPayment(order.id, amount)
                await logWebhookTransaction(transactionId, 'retail_order', order.id, amount, description)
                return NextResponse.json({ success: true, matched: 'retail_order', order: orderNumber })
            }
        }

        // 2. Try to match B2B Invoice
        // Standard pattern: HD-XXXX, INV-XXXX, or whatever you use
        // In this CRM, we often use HĐ-YY-XXX or IV-XXXX
        const invoiceMatch = description.match(/(HD|IV|INV|HĐ)[-\s]\d+/)
        if (invoiceMatch) {
            const invoiceNumber = invoiceMatch[0].replace(/\s/g, '-') // Normalize
            const supabase = await createClient()
            const { data: invoice } = await supabase
                .from('invoices')
                .select('id, invoice_number')
                .eq('invoice_number', invoiceNumber)
                .single()

            if (invoice) {
                await recordInvoicePayment(invoice.id, amount, `Auto-matched via SePay: ${transactionId}`)
                await logWebhookTransaction(transactionId, 'invoice', invoice.id, amount, description)
                return NextResponse.json({ success: true, matched: 'invoice', invoice: invoiceNumber })
            }
        }

        // 3. Fallback: Notify Telegram that a payment was received but not matched
        await sendTelegramNotification(`
<b>⚠️ THANH TOÁN KHÔNG TỰ ĐỘNG KHỚP</b>
━━━━━━━━━━━━━━━━━━
💰 Số tiền: <b>+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</b>
📝 Nội dung: <code>${description}</code>
🏦 Giao dịch: ${transactionId}
━━━━━━━━━━━━━━━━━━
<i>Vui lòng kiểm tra và ghi nhận thủ công!</i>`, 'notify_unmatched_payment')

        return NextResponse.json({ success: false, message: 'Could not match order/invoice' }, { status: 200 })

    } catch (err: any) {
        console.error('Webhook Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

async function logWebhookTransaction(externalId: string, type: string, internalId: string, amount: number, content: string) {
    try {
        const supabase = await createClient()
        await supabase.from('activity_log').insert([{
            entity_type: type === 'invoice' ? 'invoice' : 'customer',
            entity_id: internalId,
            action: 'update',
            details: {
                event: 'webhook_payment',
                gateway: 'sepay',
                external_id: externalId,
                amount,
                description: content
            }
        }])
    } catch (e) {
        console.error('Failed to log webhook transaction:', e)
    }
}
