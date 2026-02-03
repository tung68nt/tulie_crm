'use server'
import { createClient } from '../server'
import { Quotation, QuotationItem } from '@/types'

export async function getQuotations(customerId?: string) {
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
}

export async function getQuotationById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('quotations')
        .select('*, customer:customers(*), creator:users(*), items:quotation_items(*)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching quotation by id:', error)
        return null
    }

    return data as Quotation
}

export async function createQuotation(quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
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

    return quoteData
}
