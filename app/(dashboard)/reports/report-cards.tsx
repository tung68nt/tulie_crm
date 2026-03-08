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
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest leading-relaxed">Avg Revenue</p>
                                <p className="font-bold text-2xl text-green-600 tracking-tight">{formatCurrency(stats.revenue.total / (stats.contracts.active || 1))}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Conversion</p>
                                <p className="font-bold text-xl tracking-tight">{stats.conversion_rate}%</p>
                            </div>
                        </div>
                        <div className="space-y-2 mt-auto">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Sales Efficiency</span>
                                <span className="font-black text-zinc-900 dark:text-zinc-50">{stats.efficiency_score}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.efficiency_score}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/finance" className="block h-full">
                <Card className="cursor-pointer transition-all hover:shadow-lg h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
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
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Dòng tiền (Paid)</p>
                                <p className="font-bold text-2xl text-green-600 tracking-tight">{formatCurrency(stats.revenue.total)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Pending</p>
                                <p className="font-bold text-xl tracking-tight text-red-600">{formatCurrency(stats.revenue.change)}</p>
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

            <Card className="cursor-pointer transition-shadow h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <FileSignature className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
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
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Đang chạy</p>
                            <p className="font-bold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">{stats.contracts.active}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Pending</p>
                            <p className="font-bold text-xl text-yellow-600 tracking-tight">{stats.contracts.pending}</p>
                        </div>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">Tiến độ TB</span>
                            <span className="font-black text-zinc-900 dark:text-zinc-50">65%</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-zinc-900 dark:bg-zinc-50 rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-950/50 cursor-pointer transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 h-full flex flex-col border-border/50 backdrop-blur-sm shadow-lg overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white dark:text-zinc-900" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-black uppercase tracking-widest">Sức khỏe doanh nghiệp</CardTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">Real-time analysis</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <div className="flex items-center justify-between py-6">
                        <div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-none mb-2">Điểm tổng quát</p>
                            <p className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                                {stats.health_score}
                                <span className="text-lg text-zinc-400 font-bold tracking-normal">/100</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-1 shadow-md shadow-green-500/20">
                                {stats.health_score >= 80 ? 'Ổn định' : stats.health_score >= 50 ? 'Cần chú ý' : 'Báo động'}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest block opacity-50">System Assessment</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                        <div className="text-center p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Dòng tiền</p>
                            <p className="text-zinc-900 dark:text-zinc-50 font-black text-sm">{stats.health_score >= 80 ? 'A+' : stats.health_score >= 60 ? 'B' : 'C'}</p>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Scale</p>
                            <p className="text-zinc-900 dark:text-zinc-50 font-black text-sm">{stats.contracts.active > 50 ? 'XL' : stats.contracts.active > 20 ? 'L' : 'M'}</p>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Hiệu quả</p>
                            <p className="text-zinc-900 dark:text-zinc-50 font-black text-sm">{stats.efficiency_score}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
