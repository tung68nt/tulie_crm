'use server'
import { createClient } from '../server'
import { TelegramConfig } from '@/types'

async function getTelegramConfig(): Promise<TelegramConfig | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'telegram_config')
        .single()

    if (error || !data) return null
    return data.value as TelegramConfig
}

export async function sendTelegramNotification(message: string) {
    try {
        const config = await getTelegramConfig()
        if (!config || !config.is_enabled || !config.bot_token || !config.chat_id) {
            return false
        }

        const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.chat_id,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        })

        if (!response.ok) {
            console.error('Telegram notification failed:', await response.text())
            return false
        }

        return true
    } catch (err) {
        console.error('Fatal error in sendTelegramNotification:', err)
        return false
    }
}

// Helper formats for common events - individual async functions satisfy "use server"
export async function formatNewRetailOrder(order: any) {
    return `
<b>🛍️ ĐƠN HÀNG MỚI (STUDIO)</b>
━━━━━━━━━━━━━━━━━━
🆔 Mã đơn: <code>${order.order_number}</code>
👤 Khách hàng: <b>${order.customer_name}</b>
📞 SĐT: ${order.customer_phone || 'N/A'}
💰 Tổng đơn: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</b>
💳 Trạng thái: ${order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán'}
📍 Tình trạng: <b>${order.order_status}</b>
━━━━━━━━━━━━━━━━━━
<i>Check ngay tại Tulie CRM!</i>`
}

export async function formatPaymentReceived(order: any, amount: number, isB2B: boolean = false) {
    return `
<b>💰 TIỀN VỀ! (${isB2B ? 'B2B' : 'B2C'})</b>
━━━━━━━━━━━━━━━━━━
🏦 Số tiền: <b>+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</b>
📄 Mã đơn/HĐ: <code>${order.order_number || order.contract_number}</code>
👤 Từ: <b>${order.customer_name || order.customer?.company_name}</b>
━━━━━━━━━━━━━━━━━━
<i>Ting ting! Chúc mừng team! 🥂</i>`
}

export async function formatQuotationViewed(quote: any) {
    return `
<b>👀 KHÁCH ĐÃ XEM BÁO GIÁ</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>${quote.quotation_number}</code>
🏢 Khách hàng: <b>${quote.customer?.company_name}</b>
📂 Deal: ${quote.deal?.title || 'N/A'}
📈 Lượt xem: ${quote.view_count + 1}
━━━━━━━━━━━━━━━━━━
<i>Time to follow up! ⚡</i>`
}

export async function formatQuotationAccepted(quote: any) {
    return `
<b>🎉 KHÁCH ĐÃ DUYỆT BÁO GIÁ</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>${quote.quotation_number}</code>
🏢 Khách hàng: <b>${quote.customer?.company_name}</b>
💰 Tổng giá trị: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.total_amount)}</b>
━━━━━━━━━━━━━━━━━━
<i>Chuẩn bị lên hợp đồng thôi! 🔥</i>`
}

export async function formatNewQuotation(quote: any) {
    return `
<b>📄 BÁO GIÁ MỚI ĐÃ TẠO (B2B)</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>${quote.quotation_number}</code>
🏢 Khách hàng: <b>${quote.customer?.company_name}</b>
👤 Tạo bởi: <b>${quote.creator?.full_name || 'N/A'}</b>
💰 Tổng: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.total_amount)}</b>
━━━━━━━━━━━━━━━━━━
<i>Check ngay link portal để gửi khách! ⚡</i>`
}

export async function formatNewInvoice(invoice: any) {
    return `
<b>🧾 HÓA ĐƠN MỚI ĐÃ XUẤT (B2B)</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>${invoice.invoice_number}</code>
🏢 Khách hàng: <b>${invoice.customer?.company_name || invoice.vendor?.name}</b>
💰 Tổng: <b>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.total_amount)}</b>
━━━━━━━━━━━━━━━━━━
<i>Đã lên hệ thống, chờ tiền về! 💸</i>`
}


