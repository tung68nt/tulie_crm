import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import {
    TrendingUp,
    Download,
    ArrowUpRight,
    Users,
    Target,
    Receipt
} from 'lucide-react'
import { getDashboardStats, getRevenueChartData } from '@/lib/supabase/services/dashboard-service'
import { ReportCards } from './report-cards'

export default async function ReportsPage() {
    const stats = await getDashboardStats()
    const chartData = await getRevenueChartData()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Báo cáo</h1>
                    <p className="text-muted-foreground">
                        Tổng hợp báo cáo và phân tích kinh doanh thực tế
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Xuất báo cáo
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Doanh thu thực tế
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Dữ liệu từ hệ thống
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng khách hàng
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customers.total}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Đã ghi nhận
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hợp đồng đang thực hiện
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contracts.active}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Trạng thái Active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hóa đơn chờ thu
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.invoices.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Hóa đơn chưa thanh toán
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report Cards (Client Components for Charts) */}
            <ReportCards chartData={chartData} stats={stats} />
        </div>
    )
}
