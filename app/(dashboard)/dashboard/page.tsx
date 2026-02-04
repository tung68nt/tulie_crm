import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { formatCurrency } from '@/lib/utils/format'
import { Users, FileSignature, Receipt, Wallet } from 'lucide-react'
import { getDashboardStats, getRevenueChartData } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'

export default async function DashboardPage() {
    try {
        const [stats, chartData, recentActivities] = await Promise.all([
            getDashboardStats(),
            getRevenueChartData(),
            getRecentActivities()
        ])

        return (
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Tổng quan hoạt động kinh doanh của Tulie Agency
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Doanh thu tổng"
                        value={formatCurrency(stats.revenue.total)}
                        change={stats.revenue.change}
                        changeLabel={stats.revenue.period}
                        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Tổng khách hàng"
                        value={stats.customers.total.toString()}
                        change={stats.customers.change}
                        changeLabel="so với tháng trước"
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Hợp đồng đang thực hiện"
                        value={stats.contracts.active.toString()}
                        change={stats.contracts.change}
                        changeLabel="so với tháng trước"
                        icon={<FileSignature className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Hóa đơn chờ thanh toán"
                        value={stats.invoices.pending.toString()}
                        icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>

                {/* Charts & Activities */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <RevenueChart data={chartData} />
                    <AlertsPanel />
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <RecentActivities data={recentActivities} />

                    {/* Business Health Card - real data */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Sức khỏe doanh nghiệp</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Điểm tổng thể</span>
                                <span className="text-2xl font-bold text-gray-400">--/100</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Dòng tiền</span>
                                    <span className="text-muted-foreground">{stats.revenue.total > 0 ? 'Ổn định' : 'Chưa có'}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full ${stats.revenue.total > 0 ? 'w-[40%] bg-blue-500' : 'w-0'} rounded-full`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Khách hàng mới</span>
                                    <span className="text-muted-foreground">{stats.customers.new} khách</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full ${stats.customers.total > 0 ? 'w-[20%] bg-green-500' : 'w-0'} rounded-full`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Hợp đồng chờ duyệt</span>
                                    <span className="text-muted-foreground">{stats.contracts.pending}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-yellow-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Fatal crash on DashboardPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <span className="text-xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold">Hệ thống đang gặp sự cố tải dữ liệu</h1>
                <p className="text-muted-foreground mx-auto max-w-md">
                    Rất tiếc, chúng tôi không thể tải dữ liệu tổng quan vào lúc này.
                    Vui lòng làm mới trang hoặc quay lại sau.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                    Tải lại trang
                </button>
            </div>
        )
    }
}
