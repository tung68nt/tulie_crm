'use server'
import { createClient } from '../server'
import { DashboardStats, RevenueData } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const supabase = await createClient()

        // Fetch all invoices to calculate revenue
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('paid_amount, total_amount, status, type')

        if (invError) console.error('Error fetching invoices for stats:', invError)

        // Fetch retail orders (Studio/Academy) for revenue
        const { data: retailOrders, error: roError } = await supabase
            .from('retail_orders')
            .select('total_amount, paid_amount, payment_status, order_status')
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

        const totalRevenue = invoiceRevenue + retailRevenue
        const totalPendingRevenue = invoicePending + retailPending

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

        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('total_amount, paid_amount, issue_date, type')
            .gte('issue_date', oneYearAgo.toISOString())

        if (invError) console.error('Error fetching chart invoices:', invError)

        const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('amount, date')
            .gte('date', oneYearAgo.toISOString())

        if (expError) console.error('Error fetching chart expenses:', expError)

        // Aggregate by month
        const months = []
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
            const label = `T${d.getMonth() + 1}`

            const monthlyRevenue = invoices?.filter(inv => {
                if (!inv.issue_date) return false
                const invDate = new Date(inv.issue_date)
                return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear() && inv.type === 'output'
            }).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

            const monthlyExpenses = expenses?.filter(exp => {
                if (!exp.date) return false
                const expDate = new Date(exp.date)
                return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear()
            }).reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0

            months.push({
                date: label,
                revenue: monthlyRevenue / 1000000,
                expenses: monthlyExpenses / 1000000,
                profit: (monthlyRevenue - monthlyExpenses) / 1000000
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
