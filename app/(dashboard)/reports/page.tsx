import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import {
    TrendingUp,
    TrendingDown,
    Users,
    FileSignature,
    Receipt,
    Target,
    Download,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Báo cáo</h1>
                    <p className="text-muted-foreground">
                        Tổng hợp báo cáo và phân tích kinh doanh
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
                            Doanh thu năm 2026
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(2640000000)}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +24.5% so với năm trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Khách hàng mới
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12 so với năm trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tỷ lệ chuyển đổi báo giá
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPercent(32.5)}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +5.2% so với năm trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Biên lợi nhuận
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPercent(42.8)}</div>
                        <p className="text-xs text-red-500 flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -2.1% so với năm trước
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Report Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/reports/sales">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Báo cáo bán hàng</CardTitle>
                                    <p className="text-sm text-muted-foreground">Doanh thu, hợp đồng, báo giá</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Tổng doanh thu</p>
                                    <p className="font-semibold">{formatCurrency(350000000)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Hợp đồng mới</p>
                                    <p className="font-semibold">12</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/reports/customers">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Báo cáo khách hàng</CardTitle>
                                    <p className="text-sm text-muted-foreground">Phân tích khách hàng</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Tổng KH</p>
                                    <p className="font-semibold">248</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">KH hoạt động</p>
                                    <p className="font-semibold">186</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/reports/performance">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Hiệu suất team</CardTitle>
                                    <p className="text-sm text-muted-foreground">KPIs nhân viên</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Đạt target</p>
                                    <p className="font-semibold text-green-500">2/3</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Hiệu suất TB</p>
                                    <p className="font-semibold">87%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                    <Receipt className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Báo cáo tài chính</CardTitle>
                                    <p className="text-sm text-muted-foreground">Lãi lỗ, dòng tiền</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Lợi nhuận</p>
                                    <p className="font-semibold text-green-500">{formatCurrency(180000000)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Margin</p>
                                    <p className="font-semibold">51.4%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <FileSignature className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Báo cáo hợp đồng</CardTitle>
                                <p className="text-sm text-muted-foreground">Tiến độ, milestone</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Đang thực hiện</p>
                                <p className="font-semibold">45</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Sắp hết hạn</p>
                                <p className="font-semibold text-yellow-500">3</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Sức khỏe doanh nghiệp</CardTitle>
                                <p className="text-sm text-muted-foreground">Tổng quan toàn diện</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Điểm tổng thể</p>
                                <p className="text-3xl font-bold text-green-500">85<span className="text-lg">/100</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-green-500">Tốt</p>
                                <p className="text-xs text-muted-foreground">Cập nhật: Hôm nay</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
