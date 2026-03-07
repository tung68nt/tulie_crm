import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { formatCurrency } from '@/lib/utils/format'
import { Users, FileSignature, Receipt, Wallet } from 'lucide-react'
import { getDashboardStats, getRevenueChartData, getDealStats } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'
import { DealProjectionChart } from '@/components/dashboard/deal-projection-chart'

export default async function DashboardPage() {
    try {
        const [stats, chartData, recentActivities, dealStats] = await Promise.all([
            getDashboardStats(),
            getRevenueChartData(),
            getRecentActivities(),
            getDealStats()
        ])

        return (
            <div className="space-y-8 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-medium ">Dashboard</h1>
                    <p className="text-muted-foreground font-normal">
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
                        changeLabel="Tổng giá trị HĐ"
                        icon={<FileSignature className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Hóa đơn chờ thanh toán"
                        value={stats.invoices.pending.toString()}
                        icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
                    />
                </div>

                <div className="flex flex-col gap-6">
                    <RevenueChart data={chartData} />
                    <DealProjectionChart stats={dealStats} />
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <RecentActivities data={recentActivities} />

                    {/* Business Health Card - real data */}
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm p-6 overflow-hidden">
                        <h3 className="text-lg font-medium mb-4">Sức khỏe doanh nghiệp</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Điểm tổng thể</span>
                                <span className="text-2xl font-medium text-gray-400">--/100</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Dòng tiền</span>
                                    <span className="text-muted-foreground">{stats.revenue.total > 0 ? 'Ổn định' : 'Chưa có'}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.revenue.total / 50000000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Khách hàng mới</span>
                                    <span className="text-muted-foreground">{stats.customers.new} khách</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.customers.new / 5) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Hợp đồng chờ duyệt</span>
                                    <span className="text-muted-foreground">{stats.contracts.pending}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.contracts.pending / 10) * 100, 100)}%` }}
                                    />
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
                <h1 className="text-2xl font-semibold">Hệ thống đang gặp sự cố tải dữ liệu</h1>
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
