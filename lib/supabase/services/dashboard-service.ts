import { createClient } from '../server'
import { DashboardStats, RevenueData } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()

    // Fetch all invoices to calculate revenue
    const { data: invoices } = await supabase
        .from('invoices')
        .select('paid_amount, total_amount, status, type')

    // Fetch customers count
    const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

    // Fetch active contracts count
    const { count: activeContractsCount } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

    const totalRevenue = invoices?.filter(i => i.type === 'output').reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0
    const pendingInvoicesCount = invoices?.filter(i => i.type === 'output' && i.status === 'sent').length || 0

    return {
        revenue: {
            total: totalRevenue,
            change: 0, // In real world, calculate vs last month
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
}

export async function getRevenueChartData(): Promise<RevenueData[]> {
    const supabase = await createClient()

    // For a real app, you'd aggregate this in SQL
    // For now, let's fetch invoices from the last 12 months
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

    const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount, issue_date, type')
        .gte('issue_date', oneYearAgo.toISOString())

    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', oneYearAgo.toISOString())

    // Aggregate by month
    const months = []
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        const monthKey = `${d.getMonth() + 1}/${d.getFullYear()}`
        const label = `T${d.getMonth() + 1}`

        const monthlyRevenue = invoices?.filter(inv => {
            const invDate = new Date(inv.issue_date)
            return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear() && inv.type === 'output'
        }).reduce((sum, inv) => sum + inv.total_amount, 0) || 0

        const monthlyExpenses = expenses?.filter(exp => {
            const expDate = new Date(exp.date)
            return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear()
        }).reduce((sum, exp) => sum + exp.amount, 0) || 0

        months.push({
            date: label,
            revenue: monthlyRevenue / 1000000, // Convert to millions for chart
            expenses: monthlyExpenses / 1000000,
            profit: (monthlyRevenue - monthlyExpenses) / 1000000
        })
    }

    return months
}
