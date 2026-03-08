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
        bank_info: '',
        default_notes: '',
        default_payment_terms: ''
    }
}

export async function updateBrandConfig(config: any) {
    return updateSystemSetting('brand_config', config)
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
