'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MONTHLY_REVENUE, CONTRACTS, INVOICES, formatCurrency } from '@/lib/demo/mock-data'
import { Wallet, TrendingUp } from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ComposedChart
} from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

export default function DemoFinance() {
    const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0)
    const totalExpenses = MONTHLY_REVENUE.reduce((s, m) => s + m.expenses, 0)
    const profit = totalRevenue - totalExpenses
    const profitMargin = Math.round((profit / totalRevenue) * 100)

    const totalContractValue = CONTRACTS.reduce((s, c) => s + c.value, 0)
    const totalPaid = CONTRACTS.reduce((s, c) => s + c.paid, 0)
    const receivable = totalContractValue - totalPaid

    const paidInvoices = INVOICES.filter(i => i.status === 'paid')
    const pendingInvoices = INVOICES.filter(i => i.status !== 'paid')

    const revenueData = MONTHLY_REVENUE.map(m => ({
        name: m.month,
        'Doanh thu': m.revenue,
        'Chi phí': m.expenses,
        'Lợi nhuận': m.revenue - m.expenses,
        'Biên LN': Math.round(((m.revenue - m.expenses) / m.revenue) * 100),
    }))

    const cumulativeData = MONTHLY_REVENUE.reduce((acc: any[], m, i) => {
        const prev = i > 0 ? acc[i - 1] : { 'Tích lũy DT': 0, 'Tích lũy CP': 0 }
        acc.push({
            name: m.month,
            'Tích lũy DT': prev['Tích lũy DT'] + m.revenue,
            'Tích lũy CP': prev['Tích lũy CP'] + m.expenses,
        })
        return acc
    }, [])

    const invoicePieData = [
        { name: 'Đã thanh toán', value: paidInvoices.reduce((s, i) => s + i.amount, 0) },
        { name: 'Chờ thanh toán', value: INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0) },
        { name: 'Quá hạn', value: INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0) },
    ]

    const profitMarginData = revenueData.map(d => ({ name: d.name, 'Biên LN (%)': d['Biên LN'] }))

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <Wallet className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Tài chính</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Tổng quan tài chính 12 tháng gần nhất</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), sub: '12 tháng', color: 'text-emerald-600' },
                    { label: 'Tổng chi phí', value: formatCurrency(totalExpenses), sub: '12 tháng', color: 'text-red-500' },
                    { label: 'Lợi nhuận', value: formatCurrency(profit), sub: `Biên ${profitMargin}%`, color: 'text-blue-600' },
                    { label: 'Công nợ phải thu', value: formatCurrency(receivable), sub: `${pendingInvoices.length} hóa đơn`, color: 'text-amber-600' },
                ].map((s, i) => (
                    <Card key={i} className="rounded-xl border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight">{s.label}</CardTitle>
                            <TrendingUp className={`h-4 w-4 ${s.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{s.value}</div>
                            <p className="text-xs text-muted-foreground font-medium mt-1">{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue vs Expense Bar + Profit Line */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Doanh thu, Chi phí & Lợi nhuận</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis yAxisId="left" tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: '#71717a' }} width={75} />
                            <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 11, fill: '#71717a' }} width={45} />
                            <Tooltip formatter={(v, name) => name === 'Biên LN' ? `${v}%` : formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar yAxisId="left" dataKey="Doanh thu" fill="#18181b" radius={[3, 3, 0, 0]} />
                            <Bar yAxisId="left" dataKey="Chi phí" fill="#d4d4d8" radius={[3, 3, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="Biên LN" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Cumulative Revenue Area */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Doanh thu & chi phí tích lũy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={cumulativeData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: '#71717a' }} width={70} />
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="Tích lũy DT" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Tích lũy CP" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Invoice Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Phân bổ hóa đơn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={invoicePieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                                    {invoicePieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly breakdown table */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Chi tiết theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
                                    <th className="text-left py-3 px-2">Tháng</th>
                                    <th className="text-right py-3 px-2">Doanh thu</th>
                                    <th className="text-right py-3 px-2">Chi phí</th>
                                    <th className="text-right py-3 px-2">Lợi nhuận</th>
                                    <th className="text-right py-3 px-2">Biên LN</th>
                                    <th className="text-right py-3 px-2">Dự án</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {MONTHLY_REVENUE.map((m, i) => {
                                    const p = m.revenue - m.expenses
                                    const margin = Math.round((p / m.revenue) * 100)
                                    return (
                                        <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            <td className="py-3 px-2 font-semibold text-zinc-950 dark:text-zinc-50">{m.month}</td>
                                            <td className="py-3 px-2 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(m.revenue)}</td>
                                            <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{formatCurrency(m.expenses)}</td>
                                            <td className="py-3 px-2 text-right font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(p)}</td>
                                            <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{margin}%</td>
                                            <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{m.projects}</td>
                                        </tr>
                                    )
                                })}
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                    <td className="py-3 px-2 text-zinc-950 dark:text-zinc-50">Tổng cộng</td>
                                    <td className="py-3 px-2 text-right text-zinc-900 dark:text-zinc-100">{formatCurrency(totalRevenue)}</td>
                                    <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{formatCurrency(totalExpenses)}</td>
                                    <td className="py-3 px-2 text-right text-emerald-700 dark:text-emerald-400">{formatCurrency(profit)}</td>
                                    <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{profitMargin}%</td>
                                    <td className="py-3 px-2 text-right text-zinc-600 dark:text-zinc-400">{MONTHLY_REVENUE.reduce((s, m) => s + m.projects, 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
