'use server'
import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { TelegramConfig } from '@/types'

async function getTelegramConfig(): Promise<TelegramConfig | null> {
    // SECURITY: Use admin client to bypass RLS since this is called from public API routes
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'telegram_config')
        .single()

    if (error || !data) return null
    return data.value as TelegramConfig
}

export async function sendTelegramNotification(message: string, type?: keyof TelegramConfig) {
    try {
        const config = await getTelegramConfig()
        if (!config || !config.is_enabled || !config.bot_token || !config.chat_id) {
            return false
        }

        // If a type is provided, check if that specific notification is enabled
        if (type && config[type] === false) {
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

export async function testTelegramConnection() {
    return sendTelegramNotification(`
<b>🔔 TEST CONNECTION SUCCESSFUL</b>
━━━━━━━━━━━━━━━━━━
Đây là tin nhắn thử nghiệm từ hệ thống Tulie CRM. 
Cấu hình Telegram của bạn hiện đang hoạt động tốt.
━━━━━━━━━━━━━━━━━━
<i>Time: ${new Date().toLocaleString('vi-VN')}</i>`)
}

function fillTemplate(template: string, vars: Record<string, any>) {
    if (!template) return ''
    return template.replace(/\{(\w+)\}/g, (match, p1) => {
        return vars[p1] !== undefined ? vars[p1] : match
    })
}

// Helper formats for common events - individual async functions satisfy "use server"
export async function formatNewRetailOrder(order: any) {
    const config = await getTelegramConfig()
    const vars = {
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone || 'N/A',
        total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount),
        payment_status: order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán',
        order_status: order.order_status
    }
    const tpl = (config as any)?.template_new_retail_order || `
<b>🛍️ ĐƠN HÀNG MỚI (STUDIO)</b>
━━━━━━━━━━━━━━━━━━
🆔 Mã đơn: <code>{order_number}</code>
👤 Khách hàng: <b>{customer_name}</b>
📞 SĐT: {customer_phone}
💰 Tổng đơn: <b>{total_amount}</b>
💳 Trạng thái: {payment_status}
📍 Tình trạng: <b>{order_status}</b>
━━━━━━━━━━━━━━━━━━
<i>Check ngay tại Tulie CRM!</i>`
    return fillTemplate(tpl, vars).trim()
}

export async function formatPaymentReceived(order: any, amount: number, isB2B: boolean = false) {
    const config = await getTelegramConfig()

    const vars = {
        amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
        order_number: order.order_number || '',
        contract_number: order.contract_number || '',
        customer_name: order.customer_name || '',
        company_name: order.customer?.company_name || ''
    }

    if (isB2B) {
        const tplB2B = (config as any)?.template_b2b_payment || `
<b>💰 TIỀN VỀ! (B2B)</b>
━━━━━━━━━━━━━━━━━━
🏦 Số tiền: <b>+{amount}</b>
📄 Hợp đồng: <code>{contract_number}</code>
👤 Khách hàng: <b>{company_name}</b>
━━━━━━━━━━━━━━━━━━
<i>Ting ting! Chúc mừng team! 🥂</i>`
        return fillTemplate(tplB2B, vars).trim()
    } else {
        const tplB2C = (config as any)?.template_retail_payment || `
<b>💰 TIỀN VỀ! (B2C)</b>
━━━━━━━━━━━━━━━━━━
🏦 Số tiền: <b>+{amount}</b>
📄 Mã đơn: <code>{order_number}</code>
👤 Khách hàng: <b>{customer_name}</b>
━━━━━━━━━━━━━━━━━━
<i>Ting ting! Chúc mừng team! 🥂</i>`
        return fillTemplate(tplB2C, vars).trim()
    }
}

export async function formatQuotationViewed(quote: any) {
    const config = await getTelegramConfig()
    const vars = {
        quotation_number: quote.quotation_number,
        company_name: quote.customer?.company_name || 'N/A',
        deal_title: quote.deal?.title || 'N/A',
        view_count: quote.view_count + 1
    }
    const tpl = (config as any)?.template_quotation_viewed || `
<b>👀 KHÁCH ĐÃ XEM BÁO GIÁ</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>{quotation_number}</code>
🏢 Khách hàng: <b>{company_name}</b>
📂 Deal: {deal_title}
📈 Lượt xem: {view_count}
━━━━━━━━━━━━━━━━━━
<i>Time to follow up! ⚡</i>`
    return fillTemplate(tpl, vars).trim()
}

export async function formatQuotationAccepted(quote: any) {
    const config = await getTelegramConfig()
    const vars = {
        quotation_number: quote.quotation_number,
        company_name: quote.customer?.company_name || 'N/A',
        total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.total_amount)
    }
    const tpl = (config as any)?.template_quotation_accepted || `
<b>🎉 KHÁCH ĐÃ DUYỆT BÁO GIÁ</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>{quotation_number}</code>
🏢 Khách hàng: <b>{company_name}</b>
💰 Tổng giá trị: <b>{total_amount}</b>
━━━━━━━━━━━━━━━━━━
<i>Chuẩn bị lên hợp đồng thôi! 🔥</i>`
    return fillTemplate(tpl, vars).trim()
}

export async function formatNewQuotation(quote: any) {
    const config = await getTelegramConfig()
    const vars = {
        quotation_number: quote.quotation_number,
        company_name: quote.customer?.company_name || 'N/A',
        creator_name: quote.creator?.full_name || 'N/A',
        total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.total_amount)
    }
    const tpl = (config as any)?.template_new_quotation || `
<b>📄 BÁO GIÁ MỚI ĐÃ TẠO (B2B)</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>{quotation_number}</code>
🏢 Khách hàng: <b>{company_name}</b>
👤 Tạo bởi: <b>{creator_name}</b>
💰 Tổng: <b>{total_amount}</b>
━━━━━━━━━━━━━━━━━━
<i>Check ngay link portal để gửi khách! ⚡</i>`
    return fillTemplate(tpl, vars).trim()
}

export async function formatNewInvoice(invoice: any) {
    const config = await getTelegramConfig()
    const vars = {
        invoice_number: invoice.invoice_number,
        company_name: invoice.customer?.company_name || invoice.vendor?.name || 'N/A',
        total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.total_amount)
    }
    const tpl = (config as any)?.template_new_invoice || `
<b>🧾 HÓA ĐƠN MỚI ĐÃ XUẤT (B2B)</b>
━━━━━━━━━━━━━━━━━━
🆔 Số: <code>{invoice_number}</code>
🏢 Khách hàng: <b>{company_name}</b>
💰 Tổng: <b>{total_amount}</b>
━━━━━━━━━━━━━━━━━━
<i>Đã lên hệ thống, chờ tiền về! 💸</i>`
    return fillTemplate(tpl, vars).trim()
}

export async function formatNewLead(lead: any) {
    const config = await getTelegramConfig()
    const vars = {
        full_name: lead.full_name || 'N/A',
        phone: lead.phone || 'N/A',
        source: lead.source || 'N/A',
        message: lead.message || 'Không có ghi chú'
    }
    const tpl = (config as any)?.template_new_lead || `
<b>🎯 LEAD MỚI TỪ WEBSITE</b>
━━━━━━━━━━━━━━━━━━
👤 Khách hàng: <b>{full_name}</b>
📞 SĐT: <code>{phone}</code>
🌐 Nguồn: {source}
📝 Lời nhắn: {message}
━━━━━━━━━━━━━━━━━━
<i>Vào hệ thống CRM để chốt sales ngay! 🚀</i>`
    return fillTemplate(tpl, vars).trim()
}
