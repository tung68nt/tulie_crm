'use server'
import { createClient } from '../server'
import { Quotation, QuotationItem } from '@/types'

// ... (lines 4-24 unchanged)

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
