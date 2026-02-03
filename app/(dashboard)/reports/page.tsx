'use client'

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

// Mock Data for Charts
const salesData = [
    { name: 'T1', value: 4000 },
    { name: 'T2', value: 3000 },
    { name: 'T3', value: 2000 },
    { name: 'T4', value: 2780 },
    { name: 'T5', value: 1890 },
    { name: 'T6', value: 2390 },
    { name: 'T7', value: 3490 },
]

const customerData = [
    { name: 'T1', value: 20 },
    { name: 'T2', value: 35 },
    { name: 'T3', value: 25 },
    { name: 'T4', value: 40 },
    { name: 'T5', value: 30 },
]

import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

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
                <Link href="/reports/sales" className="block h-full">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Tổng doanh thu</p>
                                    <p className="font-bold text-2xl text-slate-900">{formatCurrency(350000000)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Hợp đồng mới</p>
                                    <p className="font-semibold text-xl">12</p>
                                </div>
                            </div>
                            <div className="h-[60px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/reports/customers" className="block h-full">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Tổng KH</p>
                                    <p className="font-bold text-2xl text-slate-900">248</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Hoạt động</p>
                                    <p className="font-semibold text-xl text-blue-600">186</p>
                                </div>
                            </div>
                            <div className="h-[60px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={customerData}>
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/reports/performance" className="block h-full">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Đạt target</p>
                                    <p className="font-bold text-2xl text-green-600">2/3</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Hiệu suất TB</p>
                                    <p className="font-semibold text-xl">87%</p>
                                </div>
                            </div>
                            <div className="space-y-2 mt-auto">
                                <div className="flex justify-between text-xs">
                                    <span>Team A</span>
                                    <span className="font-medium">92%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-purple-500 rounded-full" />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Team B</span>
                                    <span className="font-medium">82%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[82%] bg-purple-400 rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance" className="block h-full">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Lợi nhuận</p>
                                    <p className="font-bold text-2xl text-green-600">{formatCurrency(180000000)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase">Margin</p>
                                    <p className="font-semibold text-xl">51.4%</p>
                                </div>
                            </div>
                            <div className="h-[60px] w-full mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="value" stroke="#eab308" fillOpacity={1} fill="url(#colorProfit)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Đang thực hiện</p>
                                <p className="font-bold text-2xl text-slate-900">45</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Sắp hết hạn</p>
                                <p className="font-semibold text-xl text-yellow-600">3</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-auto">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Tiến độ trung bình</span>
                                <span className="font-medium">78%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[78%] bg-red-500 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
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
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Điểm tổng thể</p>
                                <p className="text-4xl font-bold text-green-600">85<span className="text-lg text-green-600/60 font-medium">/100</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">Tốt</p>
                                <p className="text-[10px] text-muted-foreground uppercase">Cập nhật: Hôm nay</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-auto">
                            <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                                <p className="text-[10px] text-slate-500 uppercase">Dòng tiền</p>
                                <p className="text-green-600 font-bold text-sm">A+</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                                <p className="text-[10px] text-slate-500 uppercase">Khách hàng</p>
                                <p className="text-blue-600 font-bold text-sm">A-</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                                <p className="text-[10px] text-slate-500 uppercase">Vận hành</p>
                                <p className="text-green-600 font-bold text-sm">B+</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
