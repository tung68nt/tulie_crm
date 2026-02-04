import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import {
    TrendingUp,
    TrendingDown,
    CreditCard,
    DollarSign,
} from 'lucide-react'
import { getDashboardStats, getRevenueChartData, getRecentTransactions } from '@/lib/supabase/services/dashboard-service'
import { FinanceCharts } from './finance-charts'

export default async function FinancePage() {
    const stats = await getDashboardStats()
    const chartData = await getRevenueChartData()
    const recentTransactions = await getRecentTransactions()

    const totalRevenue = stats.revenue.total
    const totalExpenses = chartData.reduce((sum, d) => sum + (d.expenses * 1000000), 0) // chartData is in millions
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Tài chính</h1>
                <p className="text-muted-foreground">
                    Theo dõi doanh thu, chi phí và lợi nhuận thực tế
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Doanh thu cộng dồn
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tổng doanh thu đã nhận
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Chi phí vận hành
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tổng chi phí đã ghi nhận
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Lợi nhuận gộp
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Biên lợi nhuận: {profitMargin.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hóa đơn chờ thu
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.invoices.pending} hóa đơn chưa thanh toán
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Component (Client Component) */}
            <FinanceCharts monthlyData={chartData} recentTransactions={recentTransactions as any} />
        </div>
    )
}
