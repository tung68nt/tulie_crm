'use server'
import { createClient } from '../server'
import { DashboardStats, RevenueData } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createClient()

        // Fetch all invoices to calculate revenue
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('id, paid_amount, total_amount, status, type')

        if (invError) console.error('Error fetching invoices for stats:', invError)

        // Fetch retail orders (Studio/Academy) for revenue
        const { data: retailOrders, error: roError } = await supabase
            .from('retail_orders')
            .select('id, total_amount, paid_amount, payment_status, order_status')
            .neq('order_status', 'cancelled')

        if (roError) console.error('Error fetching retail orders for stats:', roError)

        // Fetch customers stats
        const { count: customerCount, error: custError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { count: newCustomerCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo)

        if (custError) console.error('Error fetching customer count:', custError)

        // Fetch contracts stats
        const { count: activeContractsCount, error: contError } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        const { count: pendingContractsCount } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'draft')

        if (contError) console.error('Error fetching contract count:', contError)

        const invoiceRevenue = invoices?.filter(i => i.type === 'output').reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0
        const invoicePending = invoices?.filter(i => i.type === 'output' && i.status !== 'paid').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0) || 0
        const pendingInvoicesCount = invoices?.filter(i => i.type === 'output' && i.status === 'sent').length || 0

        // Retail orders revenue
        const retailRevenue = retailOrders?.reduce((sum, o) => sum + (o.paid_amount || 0), 0) || 0
        const retailPending = retailOrders?.filter(o => o.payment_status !== 'paid').reduce((sum, o) => sum + (o.total_amount - (o.paid_amount || 0)), 0) || 0

        const invoiceRetailRevenue = invoiceRevenue + retailRevenue
        const totalPendingRevenue = invoicePending + retailPending

        // SePay payment_transactions: actual bank transfers
        const { data: sepayTxns, error: sepayError } = await supabase
            .from('payment_transactions')
            .select('amount_in, transfer_type, matched_order_id, matched_invoice_id')
            .eq('transfer_type', 'in')

        if (sepayError) console.error('Error fetching SePay stats:', sepayError)
        // Only count SePay transactions matched to orders/invoices (SePay is shared across websites)
        const matchedSepayTxns = sepayTxns?.filter(tx => tx.matched_order_id || tx.matched_invoice_id) || []
        const sepayRevenue = matchedSepayTxns.reduce((sum, tx) => sum + (Number(tx.amount_in) || 0), 0)

        // Deduct invoice/order revenue already counted via SePay match
        const matchedInvIds = new Set(sepayTxns?.filter(tx => tx.matched_invoice_id).map(tx => tx.matched_invoice_id) || [])
        const matchedOrdIds = new Set(sepayTxns?.filter(tx => tx.matched_order_id).map(tx => tx.matched_order_id) || [])
        const unmatchedInvRevenue = invoices?.filter(i => i.type === 'output' && !matchedInvIds.has(i.id)).reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0
        const unmatchedRetailRevenue = retailOrders?.filter(o => !matchedOrdIds.has(o.id)).reduce((sum, o) => sum + (o.paid_amount || 0), 0) || 0

        // Total = SePay (B2C) + unmatched invoices/orders (B2B)
        const totalRevenue = sepayRevenue + unmatchedInvRevenue + unmatchedRetailRevenue

        // Fetch total value from active contracts
        const { data: activeContracts } = await supabase
            .from('contracts')
            .select('total_amount')
            .eq('status', 'active')

        const contractTotalValue = activeContracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0

        // Fetch deals for conversion rate
        const { data: deals } = await supabase
            .from('deals')
            .select('status')

        const totalDeals = deals?.length || 0
        const wonDeals = deals?.filter(d => d.status === 'closed_won').length || 0
        const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0

        // Calculate health score: ratio of paid amount to total amount on output invoices
        const totalOutputValue = invoices?.filter(i => i.type === 'output').reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0
        const healthScore = totalOutputValue > 0 ? (totalRevenue / totalOutputValue) * 100 : 100

        // Calculate efficiency: ratio of paid invoices to total invoices
        const totalInvoices = invoices?.filter(i => i.type === 'output').length || 0
        const paidInvoices = invoices?.filter(i => i.type === 'output' && i.status === 'paid').length || 0
        const efficiencyScore = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

        return {
            revenue: {
                total: totalRevenue,
                change: totalPendingRevenue,
                period: 'Chờ thanh toán'
            },
            customers: {
                total: customerCount || 0,
                new: newCustomerCount || 0,
                change: 0
            },
            contracts: {
                active: activeContractsCount || 0,
                pending: pendingContractsCount || 0,
                change: contractTotalValue
            },
            invoices: {
                pending: pendingInvoicesCount,
                overdue: 0,
                total_outstanding: totalPendingRevenue
            },
            health_score: Math.round(healthScore),
            conversion_rate: Math.round(conversionRate),
            efficiency_score: Math.round(efficiencyScore)
        }
    } catch (err) {
        console.error('Fatal error in getDashboardStats:', err)
        return {
            revenue: { total: 0, change: 0, period: 'Tháng này' },
            customers: { total: 0, new: 0, change: 0 },
            contracts: { active: 0, pending: 0, change: 0 },
            invoices: { pending: 0, overdue: 0, total_outstanding: 0 },
            health_score: 0,
            conversion_rate: 0,
            efficiency_score: 0
        }
    }
}

export async function getRevenueChartData(): Promise<RevenueData[]> {
    try {
        const supabase = await createClient()

        const now = new Date()
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

        // Source 1: SePay payment_transactions (B2C bank transfers)
        const { data: paymentTxns, error: ptError } = await supabase
            .from('payment_transactions')
            .select('id, amount_in, amount_out, transfer_type, transaction_date, matched_order_id, matched_invoice_id, content, code')
            .gte('transaction_date', oneYearAgo.toISOString())

        if (ptError) console.error('Error fetching payment_transactions:', ptError)

        // Source 2: Invoices (B2B contracts/invoices)
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, paid_amount, issue_date, type, customer_id, customers:customer_id(company_name)')
            .eq('type', 'output')
            .gte('issue_date', oneYearAgo.toISOString())

        if (invError) console.error('Error fetching chart invoices:', invError)

        // Source 3: Retail orders (Studio/Academy)
        const { data: retailOrders, error: retailError } = await supabase
            .from('retail_orders')
            .select('id, order_number, paid_amount, created_at, customer_name')
            .gte('created_at', oneYearAgo.toISOString())

        if (retailError) console.error('Error fetching chart retail_orders:', retailError)

        // Source 4: Manual expense entries
        const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('amount, date')
            .gte('date', oneYearAgo.toISOString())

        if (expError) console.error('Error fetching chart expenses:', expError)

        // Build set of invoice/order IDs already matched by SePay (to avoid double-counting)
        const matchedInvoiceIds = new Set<string>()
        const matchedOrderIds = new Set<string>()
        paymentTxns?.forEach(tx => {
            if (tx.matched_invoice_id) matchedInvoiceIds.add(tx.matched_invoice_id)
            if (tx.matched_order_id) matchedOrderIds.add(tx.matched_order_id)
        })

        // Aggregate by month
        const months = []
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
            const label = `T${d.getMonth() + 1}`
            const isMonth = (dateStr: string | null) => {
                if (!dateStr) return false
                const dt = new Date(dateStr)
                return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear()
            }

            // Collect detail items for this month
            const details: import('@/types').RevenueDetailItem[] = []

            // SePay revenue (only matched transactions — SePay is shared across websites)
            const sepayInTxns = paymentTxns?.filter(tx =>
                isMonth(tx.transaction_date) && tx.transfer_type === 'in'
                && (tx.matched_order_id || tx.matched_invoice_id)
            ) || []
            const sepayRevenue = sepayInTxns.reduce((sum, tx) => sum + (Number(tx.amount_in) || 0), 0)

            sepayInTxns.forEach(tx => {
                const amount = Number(tx.amount_in) || 0
                if (amount > 0) {
                    details.push({
                        source: 'sepay',
                        description: tx.content?.substring(0, 60) || tx.code || 'Giao dịch SePay',
                        amount,
                        reference_id: tx.id,
                        reference_code: tx.code || undefined,
                        date: tx.transaction_date || undefined,
                    })
                }
            })

            // SePay expenses (amount_out from bank)
            const sepayExpenses = paymentTxns?.filter(tx =>
                isMonth(tx.transaction_date) && tx.transfer_type === 'out'
            ).reduce((sum, tx) => sum + (Number(tx.amount_out) || 0), 0) || 0

            // Invoice revenue (B2B) — exclude those already counted via SePay match
            const unmatchedInvoices = invoices?.filter(inv =>
                isMonth(inv.issue_date) && !matchedInvoiceIds.has(inv.id)
            ) || []
            const invoiceRevenue = unmatchedInvoices.reduce((sum: number, inv: any) => sum + (inv.paid_amount || 0), 0)

            unmatchedInvoices.forEach((inv: any) => {
                const amount = inv.paid_amount || 0
                if (amount > 0) {
                    const customerName = inv.customers?.company_name || undefined
                    details.push({
                        source: 'invoice',
                        description: `HĐ ${inv.invoice_number}${customerName ? ` — ${customerName}` : ''}`,
                        amount,
                        reference_id: inv.id,
                        reference_code: inv.invoice_number || undefined,
                        customer_name: customerName,
                        date: inv.issue_date || undefined,
                    })
                }
            })

            // Retail order revenue — exclude those already counted via SePay match
            const unmatchedRetail = retailOrders?.filter(order =>
                isMonth(order.created_at) && !matchedOrderIds.has(order.id)
            ) || []
            const retailRevenue = unmatchedRetail.reduce((sum: number, order: any) => sum + (order.paid_amount || 0), 0)

            unmatchedRetail.forEach((order: any) => {
                const amount = order.paid_amount || 0
                if (amount > 0) {
                    details.push({
                        source: 'retail_order',
                        description: `ĐH ${order.order_number}${order.customer_name ? ` — ${order.customer_name}` : ''}`,
                        amount,
                        reference_id: order.id,
                        reference_code: order.order_number || undefined,
                        customer_name: order.customer_name || undefined,
                        date: order.created_at || undefined,
                    })
                }
            })

            // Manual expenses
            const manualExpenses = expenses?.filter(exp =>
                isMonth(exp.date)
            ).reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0

            const monthlyRevenue = sepayRevenue + invoiceRevenue + retailRevenue
            const monthlyExpenses = sepayExpenses + manualExpenses

            months.push({
                date: label,
                revenue: monthlyRevenue / 1000000,
                expenses: monthlyExpenses / 1000000,
                profit: (monthlyRevenue - monthlyExpenses) / 1000000,
                details: details.sort((a, b) => b.amount - a.amount),
            })
        }

        return months
    } catch (err) {
        console.error('Fatal error in getRevenueChartData:', err)
        return []
    }
}

export async function getRecentTransactions() {
    try {
        const supabase = await createClient()

        // Fetch recent 10 output invoices (income)
        const { data: income, error: incError } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, issue_date, status')
            .eq('type', 'output')
            .order('issue_date', { ascending: false })
            .limit(10)

        if (incError) console.error('Error fetching recent income:', incError)

        // Fetch recent 10 expenses (expense)
        const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('id, description, amount, date')
            .order('date', { ascending: false })
            .limit(10)

        if (expError) console.error('Error fetching recent expenses:', expError)

        const transactions = [
            ...(income || []).map(i => ({
                id: i.id,
                type: 'income',
                description: `Hóa đơn ${i.invoice_number}`,
                amount: i.total_amount,
                date: i.issue_date,
                status: i.status
            })),
            ...(expenses || []).map(e => ({
                id: e.id,
                type: 'expense',
                description: e.description,
                amount: e.amount,
                date: e.date,
                status: 'paid'
            }))
        ]

        // Sort by date descending
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    } catch (err) {
        console.error('Fatal error in getRecentTransactions:', err)
        return []
    }
}
export async function getDealStats() {
    try {
        const supabase = await createClient()

        // 1. Fetch Deals
        const { data: deals, error: dError } = await supabase
            .from('deals')
            .select('status, budget')

        // 2. Fetch standalone Quotations (those not linked to a deal, yet to be converted)
        const { data: quotes, error: qError } = await supabase
            .from('quotations')
            .select('status, total_amount, deal_id')
            .in('status', ['sent', 'viewed', 'accepted'])
            .is('deal_id', null)

        if (dError) throw dError
        if (qError) throw qError

        const stats = {
            new: 0,
            briefing: 0,
            proposal_sent: 0,
            closed_won: 0,
            closed_lost: 0,
            total_potential: 0
        }

        // Add Deal values
        deals?.forEach(deal => {
            const status = deal.status as keyof typeof stats
            const value = parseFloat(deal.budget || 0)
            if (status in stats) {
                (stats as any)[status] += value
            }
            if (status !== 'closed_lost') {
                stats.total_potential += value
            }
        })

        // Add Standalone Quotation values to 'proposal_sent' stage
        quotes?.forEach(quote => {
            const value = parseFloat(quote.total_amount || 0)
            stats.proposal_sent += value
            stats.total_potential += value
        })

        return stats
    } catch (err) {
        console.error('Error in getDealStats:', err)
        return null
    }
}
