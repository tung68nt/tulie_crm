import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { formatCurrency } from '@/lib/utils/format'
import { Users, FileSignature, Receipt, Wallet } from 'lucide-react'

export default function DashboardPage() {
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
                    title="Doanh thu tháng này"
                    value={formatCurrency(350000000)}
                    change={15.2}
                    changeLabel="so với tháng trước"
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Tổng khách hàng"
                    value="248"
                    change={8.5}
                    changeLabel="so với tháng trước"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Hợp đồng đang thực hiện"
                    value="45"
                    change={12.3}
                    changeLabel="so với tháng trước"
                    icon={<FileSignature className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Hóa đơn chờ thanh toán"
                    value="12"
                    change={-5.2}
                    changeLabel="so với tháng trước"
                    icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            {/* Charts & Activities */}
            <div className="grid gap-6 lg:grid-cols-3">
                <RevenueChart />
                <AlertsPanel />
            </div>

            {/* Recent Activities */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RecentActivities />
                {/* Business Health Card - placeholder */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Sức khỏe doanh nghiệp</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Điểm tổng thể</span>
                            <span className="text-2xl font-bold text-green-500">85/100</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Dòng tiền</span>
                                <span className="text-green-500">Tốt</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-green-500 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Tỷ lệ thu hồi công nợ</span>
                                <span className="text-yellow-500">Trung bình</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full w-[65%] bg-yellow-500 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Tỷ lệ chuyển đổi báo giá</span>
                                <span className="text-green-500">Tốt</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full w-[78%] bg-green-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
