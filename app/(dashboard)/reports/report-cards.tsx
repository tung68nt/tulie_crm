'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import {
    TrendingUp,
    Users,
    Target,
    Receipt,
    FileSignature
} from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer } from 'recharts'

interface ReportCardsProps {
    chartData: any[]
    stats: any
}

export function ReportCards({ chartData, stats }: ReportCardsProps) {
    // Generate some simple data based on chartData for the small preview areas
    const customerPreviewData = chartData.map(d => ({ value: Math.floor(Math.random() * 20) + 10 }))

    return (
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
                                <p className="font-bold text-2xl text-slate-900">{formatCurrency(stats.revenue.total)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Hợp đồng chạy</p>
                                <p className="font-semibold text-xl">{stats.contracts.active}</p>
                            </div>
                        </div>
                        <div className="h-[60px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" />
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
                                <p className="font-bold text-2xl text-slate-900">{stats.customers.total}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Mới</p>
                                <p className="font-semibold text-xl text-blue-600">+{stats.customers.new || 0}</p>
                            </div>
                        </div>
                        <div className="h-[60px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customerPreviewData}>
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
                                <p className="text-sm text-muted-foreground">Phân bổ doanh thu</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Avg Revenue</p>
                                <p className="font-bold text-2xl text-green-600">{formatCurrency(stats.revenue.total / 1)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Conversion</p>
                                <p className="font-semibold text-xl">32%</p>
                            </div>
                        </div>
                        <div className="space-y-2 mt-auto">
                            <div className="flex justify-between text-xs">
                                <span>Sales Efficiency</span>
                                <span className="font-medium">85%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-purple-500 rounded-full" />
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
                                <p className="text-muted-foreground text-xs uppercase">Net Profit</p>
                                <p className="font-bold text-2xl text-green-600">{formatCurrency(stats.revenue.total * 0.4)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase">Profit Margin</p>
                                <p className="font-semibold text-xl">40%</p>
                            </div>
                        </div>
                        <div className="h-[60px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="profit" stroke="#eab308" fillOpacity={1} fill="url(#colorProfit)" />
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
                            <p className="text-muted-foreground text-xs uppercase">Đang chạy</p>
                            <p className="font-bold text-2xl text-slate-900">{stats.contracts.active}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs uppercase">Pending</p>
                            <p className="font-semibold text-xl text-yellow-600">{stats.contracts.pending}</p>
                        </div>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Tiến độ thanh toán TB</span>
                            <span className="font-medium">65%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-red-500 rounded-full" />
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
                            <p className="text-[10px] text-muted-foreground uppercase">Real-time</p>
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
    )
}
