'use server'

import nodemailer from 'nodemailer'
import { getSystemSetting } from './settings-service'

export async function getSmtpConfig() {
    const config = await getSystemSetting('smtp_config')
    return config || {
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from_name: 'Tulie CRM',
        from_email: ''
    }
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    try {
        const config = await getSmtpConfig()

        if (!config.host || !config.user || !config.pass) {
            console.error('SMTP is not configured')
            return { success: false, error: 'SMTP chưa được cấu hình' }
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port),
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        })

        const info = await transporter.sendMail({
            from: `"${config.from_name}" <${config.from_email || config.user}>`,
            to,
            subject,
            html,
        })

        return { success: true, messageId: info.messageId }
    } catch (error: any) {
        console.error('Error sending email:', error)
        return { success: false, error: error.message }
    }
}

export async function testSmtpConnection(config: any) {
    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port),
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        })

        await transporter.verify()

        // Send a test email
        await transporter.sendMail({
            from: `"${config.from_name}" <${config.from_email || config.user}>`,
            to: config.user,
            subject: 'Test Email từ Tulie CRM',
            html: `<p>Đây là email thử nghiệm từ hệ thống Tulie CRM.</p><p>Thời gian: ${new Date().toLocaleString('vi-VN')}</p>`,
        })

        return { success: true }
    } catch (error: any) {
        console.error('SMTP test error:', error)
        return { success: false, error: error.message }
    }
}
