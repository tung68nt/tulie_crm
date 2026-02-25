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

        // 1. Insert quotation
        const { data: quoteData, error: quoteError } = await supabase
            .from('quotations')
            .insert([quotation])
            .select()
            .single()

        if (quoteError) {
            console.error('Error creating quotation:', quoteError)
            throw quoteError
        }

        // 2. Insert items
        const quoteItems = items.map(item => ({
            ...item,
            quotation_id: quoteData.id
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

        // 1. Update quotation
        const { error: quoteError } = await supabase
            .from('quotations')
            .update(quotation)
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

        const quoteItems = items.map(item => ({
            ...item,
            id: undefined, // Let Supabase generate new IDs
            quotation_id: id
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
