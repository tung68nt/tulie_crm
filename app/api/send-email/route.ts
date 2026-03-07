import { NextRequest, NextResponse } from 'next/server'
import {
    sendEmail,
    quotationEmailTemplate,
    invoiceEmailTemplate,
    contractEmailTemplate,
    notificationEmailTemplate,
} from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, to, data } = body

        if (!to || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: to, type' },
                { status: 400 }
            )
        }

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
                    { error: `Unknown email type: ${type}` },
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
                { error: result.error },
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
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
