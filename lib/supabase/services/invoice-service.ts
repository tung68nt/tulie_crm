'use server'
import { createClient } from '../server'
import { Invoice, InvoiceItem } from '@/types'

// ... (lines 4-18 unchanged)

export async function getInvoiceById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, customer:customers(*), creator:users(*), contract:contracts(id, contract_number), items:invoice_items(*), payments:invoice_payments(*)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching invoice by id:', error)
        return null
    }

    return data as Invoice
}

export async function createInvoice(invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]) {
    const supabase = await createClient()

    // 1. Insert invoice
    const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()
        .single()

    if (invoiceError) {
        console.error('Error creating invoice:', invoiceError)
        throw invoiceError
    }

    // 2. Insert items
    const invoiceItems = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id
    }))

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

    if (itemsError) {
        console.error('Error creating invoice items:', itemsError)
        throw itemsError
    }

    return invoiceData
}
