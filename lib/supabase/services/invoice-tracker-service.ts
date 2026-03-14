'use server'

import { createClient } from '../server'

// ============================================
// INVOICE RECONCILIATION
// ============================================

export interface InvoiceReconciliationItem {
    project_id: string
    project_title: string
    customer_name: string
    contract_amount: number
    output_invoiced: number
    output_paid: number
    input_invoiced: number
    input_paid: number
    gap: number // output_paid - input_paid
    has_output_invoice: boolean
    has_input_invoice: boolean
    status: 'ok' | 'missing_output' | 'missing_input' | 'unpaid' | 'gap'
}

/**
 * Get invoice reconciliation: match output (to client) vs input (from vendor) invoices per project/contract
 */
export async function getInvoiceReconciliation(): Promise<InvoiceReconciliationItem[]> {
    try {
        const supabase = await createClient()

        // Get active/completed contracts with their invoices
        const { data: contracts } = await supabase
            .from('contracts')
            .select(`
                id, title, total_amount, status,
                customer:customers(company_name),
                project:projects!project_id(id, title, status)
            `)
            .in('status', ['active', 'completed', 'signed'])
            .order('created_at', { ascending: false })

        if (!contracts || contracts.length === 0) return []

        // Get all invoices
        const { data: invoices } = await supabase
            .from('invoices')
            .select('id, type, contract_id, project_id, total_amount, paid_amount, status')

        const results: InvoiceReconciliationItem[] = []

        for (const contract of contracts) {
            const contractInvoices = invoices?.filter(
                inv => inv.contract_id === contract.id || inv.project_id === (contract.project as any)?.id
            ) || []

            const outputInvoices = contractInvoices.filter(i => i.type === 'output')
            const inputInvoices = contractInvoices.filter(i => i.type === 'input')

            const outputInvoiced = outputInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
            const outputPaid = outputInvoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0)
            const inputInvoiced = inputInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
            const inputPaid = inputInvoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0)

            let status: InvoiceReconciliationItem['status'] = 'ok'
            if (outputInvoices.length === 0) status = 'missing_output'
            else if (outputPaid < outputInvoiced) status = 'unpaid'
            else if (Math.abs(outputPaid - inputPaid) > 1000000) status = 'gap' // Gap > 1M VND

            results.push({
                project_id: (contract.project as any)?.id || contract.id,
                project_title: (contract.project as any)?.title || contract.title,
                customer_name: (contract.customer as any)?.company_name || 'N/A',
                contract_amount: contract.total_amount || 0,
                output_invoiced: outputInvoiced,
                output_paid: outputPaid,
                input_invoiced: inputInvoiced,
                input_paid: inputPaid,
                gap: outputPaid - inputPaid,
                has_output_invoice: outputInvoices.length > 0,
                has_input_invoice: inputInvoices.length > 0,
                status,
            })
        }

        // Sort: problems first
        const statusOrder = { missing_output: 0, unpaid: 1, gap: 2, missing_input: 3, ok: 4 }
        return results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    } catch (err) {
        console.error('Error in getInvoiceReconciliation:', err)
        return []
    }
}

/**
 * Get B2B orders that haven't issued output invoices yet
 */
export async function getUnissuedInvoices() {
    try {
        const supabase = await createClient()

        // Get active contracts
        const { data: contracts } = await supabase
            .from('contracts')
            .select('id, contract_number, title, total_amount, customer:customers(company_name)')
            .in('status', ['active', 'signed', 'completed'])

        // Get existing output invoices by contract_id
        const { data: invoices } = await supabase
            .from('invoices')
            .select('contract_id')
            .eq('type', 'output')

        const invoicedContractIds = new Set(invoices?.map(i => i.contract_id) || [])

        // Contracts without invoices
        return (contracts || [])
            .filter(c => !invoicedContractIds.has(c.id))
            .map(c => ({
                id: c.id,
                contract_number: c.contract_number,
                title: c.title,
                total_amount: c.total_amount,
                customer_name: (c.customer as any)?.company_name || 'N/A',
            }))
    } catch (err) {
        console.error('Error in getUnissuedInvoices:', err)
        return []
    }
}
