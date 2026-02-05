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
            .upsert({ key, value, updated_at: new Date().toISOString() })

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating system setting:', err)
        throw err
    }
}
