'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/format'
import {
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

interface FinanceChartsProps {
    monthlyData: any[]
    recentTransactions: any[]
}

export function FinanceCharts({ monthlyData, recentTransactions }: FinanceChartsProps) {
    const hasData = monthlyData && monthlyData.length > 0

    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                <TabsTrigger value="expenses">Chi phí</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Doanh thu vs Chi phí (Triệu VNĐ)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {!hasData ? (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                                    <div className="text-center space-y-2">
                                        <p className="text-3xl">📊</p>
                                        <p>Chưa có dữ liệu tài chính</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                                dy={8}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                                tickFormatter={(value) => `${value}`}
                                                width={45}
                                            />
                                            <Tooltip
                                                cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                                <p className="text-xs font-medium text-muted-foreground mb-2">Tháng {label}</p>
                                                                <div className="space-y-1">
                                                                    {payload.map((entry, index) => (
                                                                        <div key={index} className="flex items-center justify-between gap-6">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                                                                            </div>
                                                                            <span className="text-xs font-semibold">{entry.value} tr</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                height={36}
                                                iconType="circle"
                                                iconSize={8}
                                                formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                name="Doanh thu"
                                                stroke="#f97316"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expenses"
                                                name="Chi phí"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorExpenses)"
                                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Giao dịch thực tế</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-3">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === 'income'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-rose-50 text-red-500'
                                        }`}>
                                        {tx.type === 'income' ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                                    </div>
                                    <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                                        }`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                            {recentTransactions.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">Chưa có giao dịch gần đây</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="revenue">
                <Card className="rounded-xl border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Biểu đồ doanh thu 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueOnly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={45} />
                                    <Tooltip
                                        cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Tháng {label}</p>
                                                        <p className="text-sm font-bold">{payload[0].value} tr</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenueOnly)"
                                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="expenses">
                <Card className="rounded-xl border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Biểu đồ chi phí 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorExpensesOnly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={45} />
                                    <Tooltip
                                        cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Tháng {label}</p>
                                                        <p className="text-sm font-bold text-red-500">{payload[0].value} tr</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="expenses"
                                        name="Chi phí"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorExpensesOnly)"
                                        activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
