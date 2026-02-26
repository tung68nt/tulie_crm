'use server'
import { createClient } from '../server'
import { Quotation, QuotationItem } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getQuotations(customerId?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('quotations')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching quotations:', error)
            return []
        }

        return data as Quotation[]
    } catch (err) {
        console.error('Fatal error in getQuotations:', err)
        return []
    }
}

export async function getQuotationById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), creator:users!created_by(*), items:quotation_items(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching quotation by id:', error)
            return null
        }

        return data as Quotation
    } catch (err) {
        console.error('Fatal error in getQuotationById:', err)
        return null
    }
}

export async function getQuotationByToken(token: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), creator:users!created_by(*), items:quotation_items(*)')
            .eq('public_token', token)
            .single()

        if (error) {
            console.error('Error fetching quotation by token:', error)
            return null
        }

        return data as Quotation
    } catch (err) {
        console.error('Fatal error in getQuotationByToken:', err)
        return null
    }
}

export async function createQuotation(quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
    try {
        const supabase = await createClient()

        // Prepare quotation data (map empty UUIDs to null to prevent Postgres errors)
        const quoteDataToInsert = {
            ...quotation,
            customer_id: quotation.customer_id || null
        }

        // 1. Insert quotation
        const { data: quoteData, error: quoteError } = await supabase
            .from('quotations')
            .insert([quoteDataToInsert])
            .select()
            .single()

        if (quoteError) {
            console.error('Error creating quotation:', quoteError)
            throw quoteError
        }
        // Filter out empty rows (no product_id and no product_name)
        const validItems = items.filter(item => item.product_id || (item.product_name && item.product_name.trim() !== ''))

        // 2. Insert items with specific field selection to ensure database compatibility
        const quoteItems = validItems.map(item => ({
            quotation_id: quoteData.id,
            product_id: item.product_id || null,
            product_name: item.product_name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || '',
            unit_price: Number(item.unit_price) || 0,
            discount: Number(item.discount) || 0,
            total_price: Number(item.total_price) || 0,
            sort_order: Number(item.sort_order) || 0,
            section_name: item.section_name || null
        }))

        const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quoteItems)

        if (itemsError) {
            console.error('Error creating quotation items:', itemsError)
            throw itemsError
        }

        revalidatePath('/quotations')
        return quoteData
    } catch (err: any) {
        console.error('Fatal error in createQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo báo giá')
    }
}

export async function updateQuotation(id: string, quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
    try {
        const supabase = await createClient()

        // Prepare quotation data (map empty UUIDs to null)
        const quoteDataToUpdate = {
            ...quotation,
            customer_id: quotation.customer_id || null
        }

        // 1. Update quotation
        const { error: quoteError } = await supabase
            .from('quotations')
            .update(quoteDataToUpdate)
            .eq('id', id)

        if (quoteError) {
            console.error('Error updating quotation:', quoteError)
            throw quoteError
        }

        // 2. Refresh items (Delete old and insert new for simplicity)
        const { error: deleteError } = await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', id)

        if (deleteError) {
            console.error('Error deleting old quotation items:', deleteError)
            throw deleteError
        }

        // Filter out empty rows (no product_id and no product_name)
        const validItems = items.filter(item => item.product_id || (item.product_name && item.product_name.trim() !== ''))

        const quoteItems = validItems.map(item => ({
            quotation_id: id,
            product_id: item.product_id || null,
            product_name: item.product_name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || '',
            unit_price: Number(item.unit_price) || 0,
            discount: Number(item.discount) || 0,
            total_price: Number(item.total_price) || 0,
            sort_order: Number(item.sort_order) || 0,
            section_name: item.section_name || null
        }))

        const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quoteItems)

        if (itemsError) {
            console.error('Error inserting new quotation items:', itemsError)
            throw itemsError
        }

        revalidatePath('/quotations')
        revalidatePath(`/quotations/${id}`)
        return true
    } catch (err: any) {
        console.error('Fatal error in updateQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật báo giá')
    }
}

export async function deleteQuotation(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting quotation:', error)
            throw error
        }

        revalidatePath('/quotations')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa báo giá')
    }
}

export async function deleteQuotations(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quotations')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting quotations:', error)
            throw error
        }

        revalidatePath('/quotations')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteQuotations:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều báo giá')
    }
}
