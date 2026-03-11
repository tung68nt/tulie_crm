'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CUSTOMERS, QUOTATIONS, CONTRACTS, PROJECTS, INVOICES, MONTHLY_REVENUE, TEAM, formatCurrency } from '@/lib/demo/mock-data'
import { PieChart as PieChartIcon, Users, FileText, FilePenLine, Rocket, Receipt, UserCheck } from 'lucide-react'
import {
    BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#18181b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export default function DemoReports() {
    const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0)
    const totalExpenses = MONTHLY_REVENUE.reduce((s, m) => s + m.expenses, 0)
    const avgProjectValue = Math.round(CONTRACTS.reduce((s, c) => s + c.value, 0) / CONTRACTS.length)
    const conversionRate = Math.round((CONTRACTS.length / QUOTATIONS.length) * 100)
    const avgMonthlyRevenue = Math.round(totalRevenue / 12)

    const customerTypeData = [
        { name: 'Cá nhân', value: CUSTOMERS.filter(c => c.type === 'Cá nhân').length },
        { name: 'Doanh nghiệp', value: CUSTOMERS.filter(c => c.type === 'Doanh nghiệp').length },
    ]

    const projectStatusData = [
        { name: 'Thiết kế', value: PROJECTS.filter(p => p.status === 'design').length },
        { name: 'Đang thi công', value: PROJECTS.filter(p => p.status === 'in_progress').length },
        { name: 'Hoàn thành', value: PROJECTS.filter(p => p.status === 'completed').length },
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

    // Projects by # per month
    const projectsPerMonth = MONTHLY_REVENUE.map(m => ({ name: m.month, 'Dự án': m.projects }))

    // Designer workload
    const designerWorkload = TEAM.filter(t => t.department === 'Thiết kế').map(d => ({
        name: d.name.split(' ').slice(-2).join(' '),
        'Dự án': PROJECTS.filter(p => p.designer === d.name).length,
        'Giá trị (tỷ)': +(PROJECTS.filter(p => p.designer === d.name).reduce((s, p) => s + p.value, 0) / 1000000000).toFixed(2),
    }))

    // Radar chart data - company health
    const radarData = [
        { metric: 'Doanh thu', score: 85 },
        { metric: 'Lợi nhuận', score: 72 },
        { metric: 'Chuyển đổi', score: conversionRate },
        { metric: 'Công nợ', score: 68 },
        { metric: 'Nhân sự', score: 90 },
        { metric: 'Dự án', score: 78 },
    ]

    // Revenue growth data
    const growthData = MONTHLY_REVENUE.map((m, i) => {
        const prevRev = i > 0 ? MONTHLY_REVENUE[i - 1].revenue : m.revenue
        return {
            name: m.month,
            'Tăng trưởng (%)': Math.round(((m.revenue - prevRev) / prevRev) * 100),
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <PieChartIcon className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Báo cáo</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Phân tích tổng quan hoạt động kinh doanh</p>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {[
                    { label: 'Khách hàng', value: CUSTOMERS.length, icon: Users },
                    { label: 'Báo giá', value: QUOTATIONS.length, icon: FileText },
                    { label: 'Hợp đồng', value: CONTRACTS.length, icon: FilePenLine },
                    { label: 'Dự án', value: PROJECTS.length, icon: Rocket },
                    { label: 'Hóa đơn', value: INVOICES.length, icon: Receipt },
                    { label: 'Nhân sự', value: TEAM.length, icon: UserCheck },
                ].map((kpi, i) => (
                    <Card key={i} className="rounded-xl border-border/50 text-center">
                        <CardContent className="pt-6 pb-4">
                            <kpi.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{kpi.value}</div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">{kpi.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue Growth Chart */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Tăng trưởng doanh thu theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis unit="%" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} formatter={(v) => `${v}%`} />
                            <Bar dataKey="Tăng trưởng (%)" radius={[4, 4, 0, 0]}>
                                {growthData.map((entry, i) => (
                                    <Cell key={i} fill={entry['Tăng trưởng (%)'] >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Company Health Radar */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Sức khỏe doanh nghiệp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                <PolarGrid stroke="#e4e4e7" />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} domain={[0, 100]} />
                                <Radar name="Điểm" dataKey="score" stroke="#18181b" fill="#18181b" fillOpacity={0.15} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Projects per month */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Số dự án theo tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={projectsPerMonth}>
                                <defs>
                                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Area type="monotone" dataKey="Dự án" stroke="#8b5cf6" fill="url(#projGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Customer Type Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Loại khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={customerTypeData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={4}>
                                    {customerTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Project Status Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Trạng thái dự án</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={projectStatusData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={4}>
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#10b981" />
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Invoice Status Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Hóa đơn (theo giá trị)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={invoiceStatusData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={4}>
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Designer Performance Bar */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Hiệu suất Designer</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={designerWorkload} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#3f3f46' }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Dự án" fill="#18181b" radius={[0, 4, 4, 0]} barSize={16} />
                            <Bar dataKey="Giá trị (tỷ)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Business Metrics */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Chỉ số kinh doanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { label: 'Doanh thu trung bình/tháng', value: formatCurrency(avgMonthlyRevenue) },
                        { label: 'Giá trị HĐ trung bình', value: formatCurrency(avgProjectValue) },
                        { label: 'Tỷ lệ chuyển đổi BG → HĐ', value: `${conversionRate}%` },
                        { label: 'Biên lợi nhuận', value: `${Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100)}%` },
                    ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{m.label}</span>
                            <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{m.value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
