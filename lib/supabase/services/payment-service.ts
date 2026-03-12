'use server'

import { createClient } from '../server'
import { recordRetailPayment } from './retail-order-service'
import { sendTelegramNotification } from './telegram-service'
import { getSystemSetting } from './settings-service'

// ============================================
// PAYMENT SERVICE
// Xử lý webhook, sync, và trạng thái thanh toán
// ============================================

// Nội dung CK pattern: SEVQR TLS DH_25_0312_812_179
// TLS = Tulie Studio, TLL = Tulie Lab
const ORDER_CODE_PATTERN = /DH_\d{2}_\d{4}_\d+_\d+/i
const SYSTEM_PREFIX_PATTERN = /\b(TLS|TLL)\b/i

export type SourceSystem = 'studio' | 'lab' | 'unknown'

export interface SepayWebhookPayload {
    id: number | string
    gateway?: string
    transactionDate?: string
    accountNumber?: string
    code?: string | null
    content?: string
    transferType?: string
    transferAmount?: number
    accumulated?: number
    subAccount?: string | null
    referenceCode?: string
    description?: string
}

export interface PaymentTransaction {
    id: string
    gateway?: string
    transaction_date?: string
    account_number?: string
    code?: string
    content?: string
    transfer_type: string
    amount_in: number
    amount_out: number
    accumulated?: number
    reference_code?: string
    description?: string
    source_system: SourceSystem
    matched_order_id?: string
    matched_invoice_id?: string
    created_at: string
}

/**
 * Detect source system from payment content
 * SEVQR TLS = Tulie Studio, SEVQR TLL = Tulie Lab
 */
export function detectSourceSystem(content: string): SourceSystem {
    if (!content) return 'unknown'
    const upper = content.toUpperCase()
    if (upper.includes('TLS')) return 'studio'
    if (upper.includes('TLL')) return 'lab'
    return 'unknown'
}

/**
 * Extract order code from payment content or code field
 * Match pattern: DH_YY_MMDD_STT_VALUE
 */
export function extractOrderCode(content: string, paymentCode?: string | null): string | null {
    // Try payment code first
    if (paymentCode) {
        const match = paymentCode.match(ORDER_CODE_PATTERN)
        if (match) return match[0].toUpperCase()
    }
    // Try content
    if (content) {
        const match = content.match(ORDER_CODE_PATTERN)
        if (match) return match[0].toUpperCase()
    }
    return null
}

/**
 * Generate standard payment content for QR code
 * Format: SEVQR TLS DH_25_0312_812_179
 */
export function generatePaymentContent(orderNumber: string, system: 'studio' | 'lab' = 'studio'): string {
    const prefix = system === 'studio' ? 'TLS' : 'TLL'
    return `SEVQR ${prefix} ${orderNumber}`
}

/**
 * Process a SePay webhook payload
 * 1. Record transaction in payment_transactions (idempotent upsert)
 * 2. Detect source system (TLS/TLL)
 * 3. Match to retail order
 * 4. Update payment status on order
 * 5. Log to activity_log for finance tab
 */
export async function processWebhookPayment(payload: SepayWebhookPayload): Promise<{
    success: boolean
    matched: string | null
    orderNumber: string | null
    sourceSystem: SourceSystem
    transactionId: string
}> {
    const supabase = await createClient()
    const transactionId = String(payload.id)
    const content = (payload.content || payload.description || '').trim()
    const amount = Number(payload.transferAmount) || 0
    const sourceSystem = detectSourceSystem(content)
    const orderCode = extractOrderCode(content, payload.code)

    // 1. Upsert transaction (idempotent - SePay may retry)
    const txData: any = {
        id: transactionId,
        gateway: payload.gateway || null,
        transaction_date: payload.transactionDate ? new Date(payload.transactionDate).toISOString() : new Date().toISOString(),
        account_number: payload.accountNumber || null,
        sub_account: payload.subAccount || null,
        code: orderCode || null,
        content: content || null,
        transfer_type: payload.transferType || 'in',
        amount_in: payload.transferType === 'in' ? amount : 0,
        amount_out: payload.transferType === 'out' ? amount : 0,
        accumulated: payload.accumulated ?? null,
        reference_code: payload.referenceCode || null,
        description: payload.description || null,
        source_system: sourceSystem,
    }

    // Upsert - avoid duplicates
    const { error: txError } = await supabase
        .from('payment_transactions')
        .upsert(txData, { onConflict: 'id' })

    if (txError) {
        console.error('[PaymentService] Failed to upsert transaction:', txError)
    }

    // 2. Only process incoming transfers
    if (payload.transferType !== 'in') {
        return { success: true, matched: null, orderNumber: null, sourceSystem, transactionId }
    }

    // 3. Only process Studio transactions (TLS) for this CRM
    if (sourceSystem === 'lab') {
        console.log(`[PaymentService] Lab transaction ${transactionId} recorded but not processed in CRM. Source: ${sourceSystem}`)
        return { success: true, matched: 'lab_ignored', orderNumber: orderCode, sourceSystem, transactionId }
    }

    // 4. Try to match retail order
    if (orderCode) {
        const { data: order } = await supabase
            .from('retail_orders')
            .select('id, order_number, total_amount, paid_amount, payment_status')
            .eq('order_number', orderCode)
            .single()

        if (order) {
            // Update transaction with matched order
            await supabase
                .from('payment_transactions')
                .update({ matched_order_id: order.id })
                .eq('id', transactionId)

            // Record payment on retail order
            await recordRetailPayment(order.id, amount)

            // Log to activity_log for finance tab
            await logPaymentActivity(transactionId, 'retail_order', order.id, amount, content, sourceSystem)

            return { success: true, matched: 'retail_order', orderNumber: orderCode, sourceSystem, transactionId }
        }
    }

    // 5. Try to match B2B Invoice
    const invoicePattern = /(HD|IV|INV|HĐ)[-\s]\d+/i
    const invoiceMatch = content.toUpperCase().match(invoicePattern)
    if (invoiceMatch) {
        const invoiceNumber = invoiceMatch[0].replace(/\s/g, '-')
        const { data: invoice } = await supabase
            .from('invoices')
            .select('id, invoice_number')
            .eq('invoice_number', invoiceNumber)
            .single()

        if (invoice) {
            await supabase
                .from('payment_transactions')
                .update({ matched_invoice_id: invoice.id })
                .eq('id', transactionId)

            // Record B2B payment
            const { recordInvoicePayment } = await import('./invoice-service')
            await recordInvoicePayment(invoice.id, amount, `Auto SePay: ${transactionId}`)

            await logPaymentActivity(transactionId, 'invoice', invoice.id, amount, content, sourceSystem)

            return { success: true, matched: 'invoice', orderNumber: invoiceNumber, sourceSystem, transactionId }
        }
    }

    // 6. Unmatched - send Telegram notification
    await sendTelegramNotification(`
<b>⚠️ THANH TOÁN KHÔNG TỰ ĐỘNG KHỚP</b>
━━━━━━━━━━━━━━━━━━
💰 Số tiền: <b>+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</b>
📝 Nội dung: <code>${content}</code>
🏦 Giao dịch: ${transactionId}
🏷️ Hệ thống: ${(sourceSystem as string) === 'studio' ? 'Tulie Studio' : (sourceSystem as string) === 'lab' ? 'Tulie Lab' : 'Không xác định'}
━━━━━━━━━━━━━━━━━━
<i>Vui lòng kiểm tra và ghi nhận thủ công!</i>`, 'notify_unmatched_payment')

    return { success: true, matched: null, orderNumber: orderCode, sourceSystem, transactionId }
}

/**
 * Check payment status for polling API
 */
export async function checkPaymentStatus(orderId: string): Promise<{
    payment_status: string
    paid_amount: number
    total_amount: number
    remaining_amount: number
    transactions: any[]
}> {
    const supabase = await createClient()

    // Get order info
    const { data: order, error: orderError } = await supabase
        .from('retail_orders')
        .select('id, total_amount, paid_amount, payment_status')
        .eq('id', orderId)
        .single()

    if (orderError || !order) {
        throw new Error('Order not found')
    }

    // Get transactions for this order
    const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('id, amount_in, transaction_date, gateway, content, source_system')
        .eq('matched_order_id', orderId)
        .order('transaction_date', { ascending: false })

    return {
        payment_status: order.payment_status,
        paid_amount: order.paid_amount || 0,
        total_amount: order.total_amount,
        remaining_amount: order.total_amount - (order.paid_amount || 0),
        transactions: (transactions || []).map(tx => ({
            id: tx.id,
            amount: tx.amount_in,
            date: tx.transaction_date,
            gateway: tx.gateway,
            content: tx.content,
            source: tx.source_system,
        }))
    }
}

/**
 * Sync transactions from SePay API (reconciliation)
 * Calls https://my.sepay.vn/userapi/transactions/list
 */
export async function syncTransactionsFromSePay(params: {
    limit?: number
    dateMin?: string
    dateMax?: string
} = {}): Promise<{ total: number; processed: number; matched: number; errors: number }> {
    const supabase = await createClient()
    const { limit = 100, dateMin, dateMax } = params

    // Get SePay API key from system settings
    const telegramConfig = await getSystemSetting('telegram_config')
    const apiKey = telegramConfig?.sepay_api_key
    if (!apiKey) {
        throw new Error('SePay API key not configured. Go to Settings → Telegram & SePay.')
    }

    // Build URL
    const queryParams = new URLSearchParams()
    queryParams.append('limit', String(Math.min(limit, 5000)))
    if (dateMin) queryParams.append('transaction_date_min', dateMin)
    if (dateMax) queryParams.append('transaction_date_max', dateMax)

    const cleanApiKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').replace(/^Bearer\s+/i, '')

    const response = await fetch(`https://my.sepay.vn/userapi/transactions/list?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${cleanApiKey}` }
    })

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Lỗi xác thực SePay (401). Vui lòng kiểm tra lại API Key.')
        }
        throw new Error(`SePay API error: ${response.status}`)
    }

    const data = await response.json()
    const transactions = data?.transactions || []

    const results = { total: transactions.length, processed: 0, matched: 0, errors: 0 }

    for (const tx of transactions) {
        try {
            const content = tx.transaction_content || tx.description || ''
            const amount = Number(tx.amount_in || 0)
            const sourceSystem = detectSourceSystem(content)
            const orderCode = extractOrderCode(content)
            const transactionId = String(tx.id)

            // Upsert transaction
            await supabase
                .from('payment_transactions')
                .upsert({
                    id: transactionId,
                    gateway: tx.bank_brand_name || tx.gateway || null,
                    transaction_date: tx.transaction_date ? new Date(tx.transaction_date).toISOString() : new Date().toISOString(),
                    account_number: tx.account_number || null,
                    sub_account: tx.sub_account || null,
                    code: orderCode || null,
                    content: content || null,
                    transfer_type: 'in',
                    amount_in: amount,
                    reference_code: tx.reference_number || null,
                    description: tx.description || null,
                    source_system: sourceSystem,
                }, { onConflict: 'id' })

            // Try to match order if Studio transaction
            if (orderCode && sourceSystem !== 'lab') {
                const { data: order } = await supabase
                    .from('retail_orders')
                    .select('id, payment_status')
                    .eq('order_number', orderCode)
                    .single()

                if (order) {
                    await supabase
                        .from('payment_transactions')
                        .update({ matched_order_id: order.id })
                        .eq('id', transactionId)

                    // Only record payment if not already paid
                    if (order.payment_status !== 'paid') {
                        await recordRetailPayment(order.id, amount)
                    }
                    results.matched++
                }
            }

            results.processed++
        } catch (err: any) {
            console.error(`[SyncSePay] Failed tx ${tx.id}:`, err.message)
            results.errors++
        }
    }

    return results
}

/**
 * Get payment transactions for an order (for display in order detail)
 */
export async function getPaymentTransactions(orderId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('matched_order_id', orderId)
        .order('transaction_date', { ascending: false })

    if (error) {
        console.error('[PaymentService] Error fetching transactions:', error)
        return []
    }
    return data || []
}

/**
 * Log payment activity for finance/reporting tab
 */
async function logPaymentActivity(
    externalId: string,
    type: string,
    internalId: string,
    amount: number,
    content: string,
    sourceSystem: SourceSystem
) {
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
                description: content,
                source_system: sourceSystem,
            }
        }])
    } catch (e) {
        console.error('[PaymentService] Failed to log activity:', e)
    }
}
