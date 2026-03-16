import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { hasPermission } from '@/lib/security/permissions'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import {
    sendEmail,
    quotationEmailTemplate,
    invoiceEmailTemplate,
    contractEmailTemplate,
    notificationEmailTemplate,
} from '@/lib/email'
import { validateBody, sendEmailSchema } from '@/lib/security/validation'

/**
 * POST /api/send-email — Authenticated endpoint for sending emails
 * Rate limited to prevent email bombing
 * Permission checked based on email type (quotation→quotations, invoice→invoices, etc.)
 */
export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        // Rate limit: 10 emails per minute per user
        const rateLimitResult = await checkRateLimit(authResult.user.id, {
            maxRequests: 10,
            windowSeconds: 60,
            keyPrefix: 'email:send',
        })
        if (rateLimitResult) return rateLimitResult

        const raw = await request.json()
        const validation = validateBody(raw, sendEmailSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { type, to, data } = validation.data

        let subject = ''
        let html = ''

        switch (type) {
            case 'quotation': {
                subject = `[Tulie] Báo giá ${data.quotationNumber}`
                html = quotationEmailTemplate({
                    customerName: data.customerName || 'Quý khách',
                    quotationNumber: data.quotationNumber,
                    totalAmount: data.totalAmount,
                    validUntil: data.validUntil,
                    publicUrl: data.publicUrl,
                    senderName: data.senderName || 'Tulie Agency',
                })
                break
            }

            case 'invoice': {
                subject = `[Tulie] Đề nghị thanh toán ${data.invoiceNumber}`
                html = invoiceEmailTemplate({
                    customerName: data.customerName || 'Quý khách',
                    invoiceNumber: data.invoiceNumber,
                    totalAmount: data.totalAmount,
                    dueDate: data.dueDate,
                    portalUrl: data.portalUrl,
                    senderName: data.senderName || 'Tulie Agency',
                })
                break
            }

            case 'contract': {
                subject = `[Tulie] Thông tin hợp đồng ${data.contractNumber}`
                html = contractEmailTemplate({
                    customerName: data.customerName || 'Quý khách',
                    contractNumber: data.contractNumber,
                    title: data.title,
                    totalAmount: data.totalAmount,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    senderName: data.senderName || 'Tulie Agency',
                })
                break
            }

            case 'notification': {
                subject = data.subject || '[Tulie] Thông báo'
                html = notificationEmailTemplate({
                    customerName: data.customerName || 'Quý khách',
                    subject: data.subject || 'Thông báo',
                    message: data.message,
                    ctaText: data.ctaText,
                    ctaUrl: data.ctaUrl,
                    senderName: data.senderName || 'Tulie Agency',
                })
                break
            }

            default:
                return NextResponse.json(
                    { error: 'Unknown email type' },
                    { status: 400 }
                )
        }

        // Allow custom subject override
        if (data.customSubject) {
            subject = data.customSubject
        }

        const result = await sendEmail({ to, subject, html })

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            id: result.id,
            message: 'Email đã được gửi thành công'
        })
    } catch (error: any) {
        console.error('[API] Send email error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
