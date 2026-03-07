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
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg">Tổng quan</TabsTrigger>
                <TabsTrigger value="revenue" className="rounded-lg">Doanh thu</TabsTrigger>
                <TabsTrigger value="expenses" className="rounded-lg">Chi phí</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="text-lg font-semibold">Doanh thu vs Chi phí (Triệu VNĐ)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            className="text-[10px] font-medium"
                                            tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            className="text-[10px] font-medium"
                                            tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: 'oklch(var(--muted))', strokeWidth: 1 }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-xl">
                                                            <p className="text-[10px] font-semibold text-muted-foreground mb-2">Tháng {label}</p>
                                                            <div className="space-y-1.5">
                                                                {payload.map((entry, index) => (
                                                                    <div key={index} className="flex items-center justify-between gap-4">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                            <span className="text-xs font-semibold text-foreground/80">{entry.name}</span>
                                                                        </div>
                                                                        <span className="text-xs font-semibold font-mono text-foreground">{entry.value} tr</span>
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
                                            className="text-xs font-medium"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Doanh thu"
                                            stroke="oklch(0.646 0.222 41.116)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            activeDot={{ r: 4, strokeWidth: 0 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Chi phí"
                                            stroke="oklch(0.577 0.245 27.325)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorExpenses)"
                                            activeDot={{ r: 4, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="text-lg font-semibold">Giao dịch thực tế</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === 'income'
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {tx.type === 'income' ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{tx.description}</p>
                                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'
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
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold">Biểu đồ doanh thu 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorRevenueOnly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ stroke: 'oklch(var(--muted))', strokeWidth: 1 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-xl">
                                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Tháng {label}</p>
                                                        <p className="text-lg font-bold text-primary">{payload[0].value} tr</p>
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
                                        stroke="oklch(0.646 0.222 41.116)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenueOnly)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="expenses">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold">Biểu đồ chi phí 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorExpensesOnly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ stroke: 'oklch(var(--muted))', strokeWidth: 1 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-xl">
                                                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Tháng {label}</p>
                                                        <p className="text-lg font-bold text-red-500">{payload[0].value} tr</p>
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
                                        stroke="oklch(0.577 0.245 27.325)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorExpensesOnly)"
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
