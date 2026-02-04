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

        // Fetch customers count
        const { count: customerCount, error: custError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })

        if (custError) console.error('Error fetching customer count:', custError)

        // Fetch active contracts count
        const { count: activeContractsCount, error: contError } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        if (contError) console.error('Error fetching contract count:', contError)

        const totalRevenue = invoices?.filter(i => i.type === 'output').reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0
        const pendingInvoicesCount = invoices?.filter(i => i.type === 'output' && i.status === 'sent').length || 0

        return {
            revenue: {
                total: totalRevenue,
                change: 0,
                period: 'Tháng này'
            },
            customers: {
                total: customerCount || 0,
                new: 0,
                change: 0
            },
            contracts: {
                active: activeContractsCount || 0,
                pending: 0,
                change: 0
            },
            invoices: {
                pending: pendingInvoicesCount,
                overdue: 0,
                total_outstanding: 0
            }
        }
    } catch (err) {
        console.error('Fatal error in getDashboardStats:', err)
        return {
            revenue: { total: 0, change: 0, period: 'Tháng này' },
            customers: { total: 0, new: 0, change: 0 },
            contracts: { active: 0, pending: 0, change: 0 },
            invoices: { pending: 0, overdue: 0, total_outstanding: 0 }
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
