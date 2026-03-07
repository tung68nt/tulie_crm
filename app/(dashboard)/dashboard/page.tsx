import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { formatCurrency } from '@/lib/utils/format'
import { Users, FileSignature, Receipt, Wallet, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getDashboardStats, getRevenueChartData, getDealStats } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'
import { DealProjectionChart } from '@/components/dashboard/deal-projection-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

function calculateHealthScore(stats: any, dealStats: any) {
    let score = 0
    const metrics: { label: string; value: number; max: number; status: string; color: string }[] = []

    // 1. Revenue score (0-30): based on total revenue vs target 50M
    const revenueScore = Math.min(Math.round((stats.revenue.total / 50000000) * 30), 30)
    score += revenueScore
    metrics.push({
        label: 'Dòng tiền',
        value: revenueScore,
        max: 30,
        status: stats.revenue.total > 30000000 ? 'Tốt' : stats.revenue.total > 10000000 ? 'Trung bình' : stats.revenue.total > 0 ? 'Yếu' : 'Chưa có',
        color: stats.revenue.total > 30000000 ? '#10b981' : stats.revenue.total > 10000000 ? '#f59e0b' : '#ef4444'
    })

    // 2. Customer growth (0-25): based on new customers
    const customerScore = Math.min(Math.round((stats.customers.new / 5) * 25), 25)
    score += customerScore
    metrics.push({
        label: 'Khách hàng mới',
        value: customerScore,
        max: 25,
        status: `${stats.customers.new} khách`,
        color: stats.customers.new >= 3 ? '#10b981' : stats.customers.new >= 1 ? '#f59e0b' : '#ef4444'
    })

    // 3. Contract activity (0-25): based on active contracts
    const contractScore = Math.min(Math.round((stats.contracts.active / 5) * 25), 25)
    score += contractScore
    metrics.push({
        label: 'Hợp đồng đang chạy',
        value: contractScore,
        max: 25,
        status: `${stats.contracts.active} HĐ`,
        color: stats.contracts.active >= 3 ? '#10b981' : stats.contracts.active >= 1 ? '#f59e0b' : '#ef4444'
    })

    // 4. Pipeline health (0-20): based on deal pipeline value
    const pipelineValue = dealStats?.total_potential || 0
    const pipelineScore = Math.min(Math.round((pipelineValue / 50000000) * 20), 20)
    score += pipelineScore
    metrics.push({
        label: 'Pipeline (cơ hội)',
        value: pipelineScore,
        max: 20,
        status: pipelineValue > 0 ? formatCurrency(pipelineValue) : 'Chưa có',
        color: pipelineValue > 30000000 ? '#10b981' : pipelineValue > 5000000 ? '#f59e0b' : '#ef4444'
    })

    return { score, metrics }
}

function getScoreColor(score: number): string {
    if (score >= 75) return '#10b981'
    if (score >= 50) return '#f59e0b'
    if (score >= 25) return '#f97316'
    return '#ef4444'
}

function getScoreLabel(score: number): string {
    if (score >= 75) return 'Xuất sắc'
    if (score >= 50) return 'Tốt'
    if (score >= 25) return 'Cần cải thiện'
    return 'Cần hành động'
}

export default async function DashboardPage() {
    try {
        const [stats, chartData, recentActivities, dealStats] = await Promise.all([
            getDashboardStats(),
            getRevenueChartData(),
            getRecentActivities(),
            getDealStats()
        ])

        const health = calculateHealthScore(stats, dealStats)
        const scoreColor = getScoreColor(health.score)
        const scoreLabel = getScoreLabel(health.score)

        return (
            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
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

                {/* Charts */}
                <div className="flex flex-col gap-6">
                    <RevenueChart data={chartData} />
                    <DealProjectionChart stats={dealStats} />
                </div>

                {/* Bottom Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <RecentActivities data={recentActivities} />

                    {/* Business Health Card */}
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Sức khỏe doanh nghiệp</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Score display */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center border-4 shrink-0"
                                    style={{ borderColor: scoreColor }}
                                >
                                    <span className="text-xl font-bold" style={{ color: scoreColor }}>
                                        {health.score}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{scoreLabel}</p>
                                    <p className="text-xs text-muted-foreground">Điểm sức khỏe tổng thể /100</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3">
                                {health.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{metric.label}</span>
                                            <span className="font-medium text-xs">{metric.status}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${(metric.value / metric.max) * 100}%`,
                                                    backgroundColor: metric.color,
                                                    minWidth: metric.value > 0 ? '8px' : '0'
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground text-right">{metric.value}/{metric.max} điểm</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Fatal crash on DashboardPage:', error)
        return (
            <div className="p-8 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <span className="text-xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-semibold">Hệ thống đang gặp sự cố tải dữ liệu</h1>
                <p className="text-muted-foreground mx-auto max-w-md">
                    Rất tiếc, chúng tôi không thể tải dữ liệu tổng quan vào lúc này.
                </p>
            </div>
        )
    }
}
