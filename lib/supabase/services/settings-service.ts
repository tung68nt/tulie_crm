'use server'
import { createClient } from '../server'

export async function getProductCategories() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Fatal error in getProductCategories:', err)
        return []
    }
}

export async function createProductCategory(name: string, description?: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_categories')
            .insert([{ name, description }])
            .select()
            .single()

        if (error) throw error
        return data
    } catch (err) {
        console.error('Error creating category:', err)
        throw err
    }
}

export async function deleteProductCategory(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('product_categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting category:', err)
        throw err
    }
}

export async function getSystemSetting(key: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error) return null
        return data.value
    } catch (err) {
        return null
    }
}

export async function updateSystemSetting(key: string, value: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('system_settings')
            .upsert(
                { key, value, updated_at: new Date().toISOString() },
                { onConflict: 'key' }
            )

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating system setting:', err)
        throw err
    }
}


export async function getProductUnits() {
    const units = await getSystemSetting('product_units')
    return Array.isArray(units) ? units : ['Gói', 'Dự án', 'Tháng', 'Giờ', 'Thiết kế', 'Cái']
}

export async function updateProductUnits(units: string[]) {
    return updateSystemSetting('product_units', units)
}

export async function getBrands() {
    const brands = await getSystemSetting('brand_list')
    return Array.isArray(brands) ? brands : ['Tulie Agency', 'Tulie Studio', 'Tulie Lab']
}

export async function updateBrands(brands: string[]) {
    return updateSystemSetting('brand_list', brands)
}

export async function getTelegramConfig() {
    const config = await getSystemSetting('telegram_config')
    return config || { bot_token: '', chat_id: '', is_enabled: false }
}

export async function updateTelegramConfig(config: any) {
    return updateSystemSetting('telegram_config', config)
}

export async function getBrandConfig() {
    const config = await getSystemSetting('brand_config')
    return config || {
        logo_url: '/file/tulie-agency-logo.png',
        favicon_url: '/logo-icon.png',
        brand_name: 'Tulie Agency',
        email: 'info@tulie.vn',
    }
}

export async function updateBrandConfig(config: any) {
    return updateSystemSetting('brand_config', config)
}

export async function getAppearanceConfig() {
    const config = await getSystemSetting('appearance_config')
    return config || { darkMode: false, sidebarCollapsed: false }
}

export async function updateAppearanceConfig(config: any) {
    return updateSystemSetting('appearance_config', config)
}

export async function verifySepaySignature(payload: any, signature: string) {
    try {
        const config = await getSystemSetting('telegram_config')
        const secret = config?.sepay_secret_key || process.env.SEPAY_SECRET_KEY

        if (!secret) return true // Allow if no secret is configured (optional)

        const crypto = require('crypto')
        const payloadString = JSON.stringify(payload)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex')

        return signature === expectedSignature
    } catch (err) {
        console.error('Error verifying SePay signature:', err)
        return false
    }
}

export async function testSmtpConnection(config: any) {
    try {
        const nodemailer = require('nodemailer')

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: Number(config.port),
            secure: config.secure, // true for 465, false for other ports
            auth: {
                user: config.user,
                pass: config.pass,
            },
        })

        // Verify connection configuration
        await transporter.verify()

        // Send test email
        await transporter.sendMail({
            from: `"${config.from_name || 'Tulie CRM'}" <${config.from_email || config.user}>`,
            to: config.user, // Send to self as test
            subject: "Tulie CRM - Kiểm tra kết nối SMTP",
            text: "Chúc mừng! Cấu hình SMTP của bạn đã hoạt động chính xác.",
            html: "<b>Chúc mừng!</b><p>Cấu hình SMTP của bạn đã hoạt động chính xác.</p>"
        })

        return { success: true }
    } catch (err: any) {
        console.error('SMTP Test Error:', err)
        return { success: false, error: err.message || 'Lỗi không xác định khi kết nối SMTP' }
    }
}

// Bank account list
export async function getBankAccounts() {
    const accounts = await getSystemSetting('bank_accounts')
    return Array.isArray(accounts) ? accounts : []
}

export async function updateBankAccounts(accounts: any[]) {
    return updateSystemSetting('bank_accounts', accounts)
}

// Note templates
export async function getNoteTemplates() {
    const templates = await getSystemSetting('note_templates')
    return Array.isArray(templates) ? templates : []
}

export async function updateNoteTemplates(templates: any[]) {
    return updateSystemSetting('note_templates', templates)
}
