import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY || '')
    }
    return _resend
}

// Sender email - phải là domain đã verify trên Resend
// Nếu chưa verify domain, dùng onboarding@resend.dev để test
const FROM_EMAIL = process.env.EMAIL_FROM || 'Tulie CRM <onboarding@resend.dev>'

/**
 * SECURITY: Escape HTML entities to prevent XSS in email templates.
 * All user-controlled values MUST be escaped before interpolation.
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
    try {
        const { data, error } = await getResend().emails.send({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            replyTo: replyTo || 'hello@tulie.agency',
        })

        if (error) {
            console.error('[Email] Send failed:', error)
            return { success: false, error: error.message }
        }

        console.log('[Email] Sent successfully:', data?.id)
        return { success: true, id: data?.id }
    } catch (err: any) {
        console.error('[Email] Fatal error:', err)
        return { success: false, error: err.message || 'Unknown error' }
    }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export function quotationEmailTemplate({
    customerName,
    quotationNumber,
    totalAmount,
    validUntil,
    publicUrl,
    senderName,
}: {
    customerName: string
    quotationNumber: string
    totalAmount: string
    validUntil: string
    publicUrl: string
    senderName: string
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .info-box { background: #f0f7ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .info-label { color: #6b7280; font-size: 14px; }
            .info-value { color: #111827; font-weight: 600; }
            .cta-button { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .cta-button:hover { background: #1d4ed8; }
            .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .footer a { color: #2563eb; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Báo giá từ Tulie</h1>
                <p>Mã báo giá: ${quotationNumber}</p>
            </div>
            <div class="content">
                <p>Xin chào <strong>${escapeHtml(customerName)}</strong>,</p>
                <p>Cảm ơn Quý khách đã quan tâm đến dịch vụ của chúng tôi. Dưới đây là thông tin báo giá:</p>
                
                <div class="info-box">
                    <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Mã báo giá:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${escapeHtml(quotationNumber)}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Tổng giá trị:</td>
                            <td style="color: #2563eb; font-weight: 700; font-size: 18px; text-align: right;">${totalAmount}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Hiệu lực đến:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${validUntil}</td>
                        </tr>
                    </table>
                </div>

                <p style="text-align: center;">
                    <a href="${publicUrl}" class="cta-button">🔗 Xem chi tiết báo giá</a>
                </p>

                <p>Nếu có bất kỳ thắc mắc nào, Quý khách vui lòng liên hệ trực tiếp với chúng tôi.</p>

                <p>Trân trọng,<br><strong>${escapeHtml(senderName)}</strong><br>Tulie Agency</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                <p>Hotline: 090 123 4567 | Email: <a href="mailto:hello@tulie.agency">hello@tulie.agency</a></p>
            </div>
        </div>
    </body>
    </html>
    `
}

export function invoiceEmailTemplate({
    customerName,
    invoiceNumber,
    totalAmount,
    dueDate,
    portalUrl,
    senderName,
}: {
    customerName: string
    invoiceNumber: string
    totalAmount: string
    dueDate: string
    portalUrl?: string
    senderName: string
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .info-box { background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .cta-button { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .footer a { color: #059669; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧾 Đề nghị thanh toán</h1>
                <p>Mã hoá đơn: ${invoiceNumber}</p>
            </div>
            <div class="content">
                <p>Xin chào <strong>${escapeHtml(customerName)}</strong>,</p>
                <p>Chúng tôi gửi đến Quý khách đề nghị thanh toán cho dịch vụ đã cung cấp:</p>
                
                <div class="info-box">
                    <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Mã hoá đơn:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Số tiền:</td>
                            <td style="color: #059669; font-weight: 700; font-size: 18px; text-align: right;">${totalAmount}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Hạn thanh toán:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${dueDate}</td>
                        </tr>
                    </table>
                </div>

                ${portalUrl ? `
                <p style="text-align: center;">
                    <a href="${portalUrl}" class="cta-button">📄 Xem hoá đơn</a>
                </p>
                ` : ''}

                <p>Quý khách vui lòng thanh toán trước hạn. Nếu đã thanh toán, vui lòng bỏ qua email này.</p>

                <p>Trân trọng,<br><strong>${senderName}</strong><br>Tulie Agency</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                <p>Hotline: 090 123 4567 | Email: <a href="mailto:hello@tulie.agency">hello@tulie.agency</a></p>
            </div>
        </div>
    </body>
    </html>
    `
}

export function contractEmailTemplate({
    customerName,
    contractNumber,
    title,
    totalAmount,
    startDate,
    endDate,
    senderName,
}: {
    customerName: string
    contractNumber: string
    title: string
    totalAmount: string
    startDate: string
    endDate?: string
    senderName: string
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .info-box { background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .footer a { color: #7c3aed; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📝 Thông tin hợp đồng</h1>
                <p>Mã hợp đồng: ${contractNumber}</p>
            </div>
            <div class="content">
                <p>Xin chào <strong>${escapeHtml(customerName)}</strong>,</p>
                <p>Chúng tôi gửi đến Quý khách thông tin hợp đồng như sau:</p>
                
                <div class="info-box">
                    <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Mã hợp đồng:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${contractNumber}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Tên hợp đồng:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${title}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Giá trị:</td>
                            <td style="color: #7c3aed; font-weight: 700; font-size: 18px; text-align: right;">${totalAmount}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Ngày bắt đầu:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${startDate}</td>
                        </tr>
                        ${endDate ? `
                        <tr>
                            <td style="color: #6b7280; font-size: 14px;">Ngày kết thúc:</td>
                            <td style="color: #111827; font-weight: 600; text-align: right;">${endDate}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <p>Nếu có bất kỳ câu hỏi nào, Quý khách vui lòng liên hệ chúng tôi.</p>

                <p>Trân trọng,<br><strong>${senderName}</strong><br>Tulie Agency</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                <p>Hotline: 090 123 4567 | Email: <a href="mailto:hello@tulie.agency">hello@tulie.agency</a></p>
            </div>
        </div>
    </body>
    </html>
    `
}

export function notificationEmailTemplate({
    customerName,
    subject,
    message,
    ctaText,
    ctaUrl,
    senderName,
}: {
    customerName: string
    subject: string
    message: string
    ctaText?: string
    ctaUrl?: string
    senderName: string
}) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #0891b2, #0e7490); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .cta-button { display: inline-block; background: #0891b2; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .footer a { color: #0891b2; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 ${subject}</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>${escapeHtml(customerName)}</strong>,</p>
                <div style="white-space: pre-line;">${escapeHtml(message)}</div>

                ${ctaText && ctaUrl ? `
                <p style="text-align: center;">
                    <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
                </p>
                ` : ''}

                <p>Trân trọng,<br><strong>${senderName}</strong><br>Tulie Agency</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                <p>Hotline: 090 123 4567 | Email: <a href="mailto:hello@tulie.agency">hello@tulie.agency</a></p>
            </div>
        </div>
    </body>
    </html>
    `
}
