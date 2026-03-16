'use server'

import { createClient } from '../server'
import { Invoice, InvoiceItem } from '@/types'
import { revalidatePath } from 'next/cache'
import {
    sendTelegramNotification,
    formatNewInvoice,
    formatPaymentReceived
} from './telegram-service'
import { logActivity, logDestructiveAction } from './activity-service'

export async function getInvoices() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('invoices')
            .select('*, customer:customers(id, company_name), vendor:vendors(id, name)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching invoices:', error)
            return []
        }

        return data as Invoice[]
    } catch (err) {
        console.error('Fatal error in getInvoices:', err)
        return []
    }
}

export async function getInvoiceById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('invoices')
            .select('*, customer:customers(*), creator:users(*), contract:contracts(id, contract_number), vendor:vendors(*), items:invoice_items(*), payments:invoice_payments(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching invoice by id:', error)
            return null
        }

        return data as Invoice
    } catch (err) {
        console.error('Fatal error in getInvoiceById:', err)
        return null
    }
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

    // 3. Notify via Telegram
    const invoiceWithDetails = await getInvoiceById(invoiceData.id)
    if (invoiceWithDetails) {
        await sendTelegramNotification(await formatNewInvoice(invoiceWithDetails), 'notify_new_invoice')
    }

    revalidatePath('/invoices')

    await logActivity({
        action: 'create',
        entity_type: 'invoice',
        entity_id: invoiceData.id,
        description: `Tạo hóa đơn mới: ${invoice.invoice_number || invoiceData.id}`
    })

    return invoiceData
}

export async function recordInvoicePayment(id: string, amount: number, notes?: string) {
    try {
        const supabase = await createClient()
        const invoice = await getInvoiceById(id)
        if (!invoice) throw new Error('Invoice not found')

        const { data: { user } } = await supabase.auth.getUser()

        // 1. Record payment
        const { error: paymentError } = await supabase
            .from('invoice_payments')
            .insert([{
                invoice_id: id,
                amount,
                payment_date: new Date().toISOString(),
                payment_method: 'Bank Transfer',
                notes,
                created_by: user?.id
            }])

        if (paymentError) throw paymentError

        // 2. Update invoice paid amount and status
        const newPaidAmount = (invoice.paid_amount || 0) + amount
        const status = newPaidAmount >= invoice.total_amount ? 'paid' : 'partial'

        const { error: invoiceUpdateError } = await supabase
            .from('invoices')
            .update({
                paid_amount: newPaidAmount,
                status
            })
            .eq('id', id)

        if (invoiceUpdateError) throw invoiceUpdateError

        // 3. Notify via Telegram
        await sendTelegramNotification(await formatPaymentReceived(invoice, amount, true), 'notify_b2b_payment')

        revalidatePath('/invoices')
        revalidatePath(`/invoices/${id}`)

        await logActivity({
            action: 'update',
            entity_type: 'invoice',
            entity_id: id,
            description: `Ghi nhận thanh toán hóa đơn: ${invoice.invoice_number || id} — ${amount.toLocaleString()}đ`,
            metadata: { new_values: { amount, status, paid_amount: newPaidAmount } }
        })

        return true
    } catch (err) {
        console.error('Error recording invoice payment:', err)
        throw err
    }
}

export async function deleteInvoice(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting invoice:', error)
            throw error
        }

        revalidatePath('/invoices')
        await logDestructiveAction('invoice', id, 'delete')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteInvoice:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa hóa đơn')
    }
}

export async function deleteInvoices(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('invoices')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting invoices:', error)
            throw error
        }

        revalidatePath('/invoices')
        await logDestructiveAction('invoice', ids[0], 'bulk_delete', { affected_count: ids.length })
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteInvoices:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều hóa đơn')
    }
}
