'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/format'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    PieChart
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

const monthlyData = [
    { name: 'T1', revenue: 120, expenses: 80 },
    { name: 'T2', revenue: 150, expenses: 90 },
    { name: 'T3', revenue: 180, expenses: 100 },
    { name: 'T4', revenue: 140, expenses: 85 },
    { name: 'T5', revenue: 200, expenses: 110 },
    { name: 'T6', revenue: 220, expenses: 120 },
    { name: 'T7', revenue: 190, expenses: 95 },
    { name: 'T8', revenue: 250, expenses: 130 },
    { name: 'T9', revenue: 280, expenses: 140 },
    { name: 'T10', revenue: 260, expenses: 135 },
    { name: 'T11', revenue: 300, expenses: 150 },
    { name: 'T12', revenue: 350, expenses: 170 },
]

const recentTransactions = [
    { id: '1', type: 'income', description: 'Thanh toán từ ABC Corp', amount: 110000000, date: '2026-01-09' },
    { id: '2', type: 'expense', description: 'Lương nhân viên T12', amount: 85000000, date: '2026-01-05' },
    { id: '3', type: 'income', description: 'Thanh toán từ DEF Industries', amount: 60000000, date: '2026-01-02' },
    { id: '4', type: 'expense', description: 'Thuê văn phòng T1', amount: 25000000, date: '2026-01-01' },
    { id: '5', type: 'income', description: 'Thanh toán từ XYZ Ltd', amount: 88000000, date: '2025-12-28' },
]

export default function FinancePage() {
    const totalRevenue = 350000000
    const totalExpenses = 170000000
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = (netProfit / totalRevenue) * 100

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Tài chính</h1>
                <p className="text-muted-foreground">
                    Theo dõi doanh thu, chi phí và lợi nhuận
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Doanh thu tháng này
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +16.7% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Chi phí tháng này
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-red-500 flex items-center mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            +13.3% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Lợi nhuận ròng
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Biên lợi nhuận: {profitMargin.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Công nợ phải thu
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(165000000)}</div>
                        <p className="text-xs text-yellow-500 mt-1">
                            3 hóa đơn quá hạn
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
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
                                <CardTitle>Doanh thu vs Chi phí</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                            <YAxis
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(value) => `${value}tr`}
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
                                <CardTitle>Giao dịch gần đây</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentTransactions.slice(0, 5).map((tx) => (
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
                            <CardTitle>Biểu đồ doanh thu năm 2026</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `${value}tr`}
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
                            <CardTitle>Biểu đồ chi phí năm 2026</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `${value}tr`}
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
        </div>
    )
}
