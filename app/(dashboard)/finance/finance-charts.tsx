'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/format'
import {
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
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
            <TabsList>
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                <TabsTrigger value="expenses">Chi phí</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Doanh thu vs Chi phí (Triệu VNĐ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value) => value !== undefined ? [`${value} triệu`, ''] : ['', '']}
                                        />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Doanh thu" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expenses" name="Chi phí" fill="hsl(0 84.2% 60.2%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Giao dịch thực tế</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'income'
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
                                        <p className="text-sm font-medium truncate">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                                    </div>
                                    <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="revenue">
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => value !== undefined ? [`${value} triệu`, ''] : ['', '']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        stroke="hsl(142.1 76.2% 36.3%)"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(142.1 76.2% 36.3%)' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="expenses">
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ chi phí 12 tháng qua</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value) => value !== undefined ? [`${value} triệu`, ''] : ['', '']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expenses"
                                        name="Chi phí"
                                        stroke="hsl(0 84.2% 60.2%)"
                                        strokeWidth={2}
                                        dot={{ fill: 'hsl(0 84.2% 60.2%)' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
