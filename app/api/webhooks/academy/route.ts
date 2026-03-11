import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRetailOrder, recordRetailPayment, generateRetailOrderId } from '@/lib/supabase/services/retail-order-service'
import { getSystemSetting } from '@/lib/supabase/services/settings-service'

/**
 * Academy Webhook Receiver
 * Listens for ORDER_PAID events from Tulie Academy
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()
        const apiKey = req.headers.get('x-academy-api-key')

        // 1. Validate API Key — MANDATORY
        const telegramConfig = await getSystemSetting('telegram_config')
        const storedWebhookKey = telegramConfig?.academy_webhook_key

        if (!storedWebhookKey) {
            console.error('Academy Webhook: No webhook key configured')
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
        }

        if (!apiKey || apiKey !== storedWebhookKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('Academy Webhook Received: event=', payload?.event)

        const { event, order } = payload

        if (event !== 'ORDER_PAID' || !order) {
            return NextResponse.json({ message: 'Ignored: Not an order paid event' }, { status: 200 })
        }

        const supabase = await createClient()

        // 2. Check if already exists by external_id
        const { data: existing } = await supabase
            .from('retail_orders')
            .select('id')
            .eq('external_id', order.id)
            .eq('source_system', 'academy')
            .single()

        if (existing) {
            return NextResponse.json({ message: 'Order already exists' }, { status: 200 })
        }

        // 3. Create Retail Order (B2C) from Academy data
        // Academy order format: { id, code, amount, user: { email, profile: { name, phone } }, createdAt }

        const customerName = order.user?.profile?.name || order.user?.email || 'Academy User'
        const customerPhone = order.user?.profile?.phone || ''
        const customerEmail = order.user?.email || ''

        const { orderNumber, stt } = await generateRetailOrderId(order.amount)

        const newOrder = await createRetailOrder({
            order_number: orderNumber,
            stt,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            total_amount: order.amount,
            paid_amount: order.amount, // Academy push only when paid
            payment_status: 'paid',
            order_status: 'completed',
            source_system: 'academy',
            brand: 'academy',
            external_id: order.id,
            notes: `Academy Order: ${order.code}. Items: ${order.items?.map((i: any) => i.course?.title || i.product?.title).join(', ')}`,
            metadata: {
                academy_code: order.code,
                items: order.items
            }
        })

        await logWebhookTransaction(order.id, 'retail_order', newOrder.id, order.amount, `Academy Push: ${order.code}`)

        return NextResponse.json({ success: true, crm_id: newOrder.id })

    } catch (err: any) {
        console.error('Academy Webhook Integration Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function logWebhookTransaction(externalId: string, type: string, internalId: string, amount: number, content: string) {
    try {
        const supabase = await createClient()
        await supabase.from('activity_log').insert([{
            entity_type: 'customer',
            entity_id: internalId,
            action: 'create',
            details: {
                event: 'webhook_push',
                source: 'academy',
                external_id: externalId,
                amount,
                description: content
            }
        }])
    } catch (e) {
        console.error('Failed to log academy webhook transaction:', e)
    }
}
