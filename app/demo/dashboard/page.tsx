'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DASHBOARD_STATS, MONTHLY_REVENUE, PROJECTS, INVOICES, CUSTOMERS, QUOTATIONS, CONTRACTS, formatCurrency } from '@/lib/demo/mock-data'
import { TrendingUp, Users, Rocket, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#18181b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

const revenueData = MONTHLY_REVENUE.map(m => ({
    name: m.month,
    'Doanh thu': m.revenue,
    'Chi phí': m.expenses,
    'Lợi nhuận': m.revenue - m.expenses,
}))

const projectStatusData = [
    { name: 'Thiết kế', value: PROJECTS.filter(p => p.status === 'design').length },
    { name: 'Đang thi công', value: PROJECTS.filter(p => p.status === 'in_progress').length },
    { name: 'Hoàn thành', value: PROJECTS.filter(p => p.status === 'completed').length },
]

const customerTypeData = [
    { name: 'Cá nhân', value: CUSTOMERS.filter(c => c.type === 'Cá nhân').length },
    { name: 'Doanh nghiệp', value: CUSTOMERS.filter(c => c.type === 'Doanh nghiệp').length },
]

const quotationStatusData = [
    { name: 'Nháp', value: QUOTATIONS.filter(q => q.status === 'draft').length },
    { name: 'Đã gửi', value: QUOTATIONS.filter(q => q.status === 'sent').length },
    { name: 'Đã duyệt', value: QUOTATIONS.filter(q => q.status === 'accepted').length },
    { name: 'Đang TH', value: QUOTATIONS.filter(q => q.status === 'in_progress').length },
]

const invoiceStatusData = [
    { name: 'Đã TT', value: INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) },
    { name: 'Chờ TT', value: INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0) },
    { name: 'Quá hạn', value: INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0) },
]

const contractValueByMonth = MONTHLY_REVENUE.map((m, i) => ({
    name: m.month,
    'Giá trị HĐ': Math.round(m.revenue * 1.3),
    'Đã thu': m.revenue,
}))

export default function DemoDashboard() {
    const stats = DASHBOARD_STATS

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-950 tracking-tight">Dashboard</h1>
                <p className="text-sm font-medium text-muted-foreground mt-1">Tổng quan hoạt động kinh doanh NovaDeco</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Doanh thu tích lũy', value: formatCurrency(stats.totalRevenue), change: `+${stats.revenueGrowth}%`, up: true, icon: TrendingUp, color: 'text-emerald-600' },
                    { label: 'Khách hàng', value: stats.totalCustomers.toString(), change: `+${stats.newCustomersMonth} tháng này`, up: true, icon: Users, color: 'text-blue-600' },
                    { label: 'Dự án đang chạy', value: stats.activeProjects.toString(), change: `${stats.completedProjects} hoàn thành`, up: true, icon: Rocket, color: 'text-violet-600' },
                    { label: 'Hóa đơn chờ thu', value: formatCurrency(stats.pendingAmount), change: `${stats.pendingInvoices} hóa đơn`, up: false, icon: Receipt, color: 'text-amber-600' },
                ].map((s, i) => (
                    <Card key={i} className="rounded-xl border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight">{s.label}</CardTitle>
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{s.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                {s.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-amber-500" />}
                                <span className={`text-xs font-semibold ${s.up ? 'text-emerald-600' : 'text-amber-600'}`}>{s.change}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue Bar Chart */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Doanh thu & Chi phí 12 tháng</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={revenueData} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={70} />
                            <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Doanh thu" fill="#18181b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Chi phí" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Area chart - Profit trend */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Xu hướng lợi nhuận</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={70} />
                            <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                            <Area type="monotone" dataKey="Lợi nhuận" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Project Status Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Trạng thái dự án</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                                    {projectStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Customer Type Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Loại khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={customerTypeData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                                    {customerTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quotation Status Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Trạng thái báo giá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={quotationStatusData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                                    {quotationStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Contract Value Line Chart */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Giá trị hợp đồng & thu tiền</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={contractValueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 11, fill: '#a1a1aa' }} width={70} />
                            <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="Giá trị HĐ" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Đã thu" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Active Projects */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Dự án đang thực hiện</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {PROJECTS.filter(p => p.status !== 'completed').slice(0, 5).map((p) => (
                            <div key={p.id} className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-950 truncate">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.customerName} · {p.designer}</p>
                                </div>
                                <div className="text-right shrink-0 flex items-center gap-2">
                                    <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${p.progress}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-700 w-8 text-right">{p.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Invoice Status Chart */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Phân bổ hóa đơn (theo giá trị)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={invoiceStatusData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={3}>
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
