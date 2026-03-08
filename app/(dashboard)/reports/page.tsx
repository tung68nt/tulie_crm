import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import {
    TrendingUp,
    Download,
    ArrowUpRight,
    Users,
    Target,
    Receipt,
    PieChart
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
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Báo cáo</h1>
                        <p className="text-muted-foreground font-normal">
                            Tổng hợp báo cáo và phân tích kinh doanh thực tế
                        </p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Xuất báo cáo
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Doanh thu thực tế
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                        <p className="text-[10px] text-green-600 font-bold flex items-center mt-1 uppercase tracking-tighter">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Dữ liệu từ hệ thống
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Tổng khách hàng
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customers.total}</div>
                        <p className="text-[10px] text-zinc-500 font-bold flex items-center mt-1 uppercase tracking-tighter">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Đã ghi nhận thực tế
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Hợp đồng đang thực hiện
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                            <Target className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contracts.active}</div>
                        <p className="text-[10px] text-green-600 font-bold flex items-center mt-1 uppercase tracking-tighter">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Trạng thái Active
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Hóa đơn chờ thu
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                            <Receipt className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.invoices.pending}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                            Hóa đơn chưa hoàn tất
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report Cards (Client Components for Charts) */}
            <ReportCards chartData={chartData} stats={stats} />
        </div>
    )
}
