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
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface ReportCardsProps {
    chartData: any[]
    stats: any
}

export function ReportCards({ chartData, stats }: ReportCardsProps) {
    // Generate some simple data based on chartData for the small preview areas
    const customerPreviewData = chartData.map(d => ({ name: d.name, value: Math.floor(Math.random() * 20) + 10 }))

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/reports/sales" className="block h-full">
                <Card className="cursor-pointer transition-shadow h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Báo cáo bán hàng</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Doanh thu, hợp đồng, báo giá</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs">Tổng doanh thu</p>
                                <p className="font-semibold text-2xl text-slate-900">{formatCurrency(stats.revenue.total)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Hợp đồng chạy</p>
                                <p className="font-semibold text-xl">{stats.contracts.active}</p>
                            </div>
                        </div>
                        <div className="h-[100px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        hide={false}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <YAxis
                                        hide={false}
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b' }}
                                        tickFormatter={(value) => `${value / 1000000}tr`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/reports/customers" className="block h-full">
                <Card className="cursor-pointer transition-shadow h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Báo cáo khách hàng</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Phân tích khách hàng</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs">Tổng KH</p>
                                <p className="font-semibold text-2xl text-slate-900">{stats.customers.total}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Mới</p>
                                <p className="font-semibold text-xl text-blue-600">+{stats.customers.new || 0}</p>
                            </div>
                        </div>
                        <div className="h-[100px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customerPreviewData}>
                                    <XAxis hide={true} dataKey="name" />
                                    <YAxis hide={false} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/reports/performance" className="block h-full">
                <Card className="cursor-pointer transition-shadow h-full flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Target className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Hiệu suất team</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Phân bổ doanh thu</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium">Avg Revenue</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.revenue.total / (stats.contracts.active || 1))}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-medium">Conversion</p>
                                <p className="text-2xl font-bold tracking-tight">{stats.conversion_rate}%</p>
                            </div>
                        </div>
                        <div className="space-y-2 mt-auto">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Sales Efficiency</span>
                                <span className="font-bold text-foreground">{stats.efficiency_score}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.efficiency_score}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/finance" className="block h-full">
                <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full flex flex-col overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Báo cáo tài chính</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Lãi lỗ, dòng tiền</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium">Dòng tiền (Paid)</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.revenue.total)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-medium">Pending</p>
                                <p className="text-2xl font-bold tracking-tight text-destructive">{formatCurrency(stats.revenue.change)}</p>
                            </div>
                        </div>
                        <div className="h-[60px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide={true} />
                                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                            <FileSignature className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Báo cáo hợp đồng</CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">Tiến độ, milestone</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-muted-foreground text-xs font-medium">Đang chạy</p>
                            <p className="text-2xl font-bold tracking-tight">{stats.contracts.active}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium">Pending</p>
                            <p className="text-2xl font-bold tracking-tight text-muted-foreground">{stats.contracts.pending}</p>
                        </div>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Tiến độ TB</span>
                            <span className="font-bold text-foreground">65%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-primary rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-full flex flex-col overflow-hidden bg-muted/40">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Sức khỏe doanh nghiệp</CardTitle>
                            <p className="text-xs text-muted-foreground font-medium">Phân tích tổng thể</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <div className="flex items-center justify-between py-6">
                        <div>
                            <p className="text-muted-foreground text-xs font-medium mb-2">Điểm tổng quát</p>
                            <p className="text-4xl font-bold tracking-tight">
                                {stats.health_score}
                                <span className="text-lg text-muted-foreground font-medium ml-1">/100</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground text-background mb-1">
                                {stats.health_score >= 80 ? 'Ổn định' : stats.health_score >= 50 ? 'Cần chú ý' : 'Báo động'}
                            </div>
                            <p className="text-xs text-muted-foreground block">System Assessment</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                        <div className="text-center p-2 bg-background border rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Dòng tiền</p>
                            <p className="text-sm font-bold">{stats.health_score >= 80 ? 'A+' : stats.health_score >= 60 ? 'B' : 'C'}</p>
                        </div>
                        <div className="text-center p-2 bg-background border rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Scale</p>
                            <p className="text-sm font-bold">{stats.contracts.active > 50 ? 'XL' : stats.contracts.active > 20 ? 'L' : 'M'}</p>
                        </div>
                        <div className="text-center p-2 bg-background border rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Hiệu quả</p>
                            <p className="text-sm font-bold">{stats.efficiency_score}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
