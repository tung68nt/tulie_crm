'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CUSTOMERS, QUOTATIONS, CONTRACTS, PROJECTS, INVOICES, formatCurrency } from '@/lib/demo/mock-data'
import { ArrowLeft, Phone, Mail, Building2 } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

export default function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const customer = CUSTOMERS.find(c => c.id === id)

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Không tìm thấy khách hàng</p>
                <Link href="/demo/customers"><Button variant="outline">← Quay lại</Button></Link>
            </div>
        )
    }

    const customerQuotations = QUOTATIONS.filter(q => q.customer === id)
    const customerContracts = CONTRACTS.filter(c => c.customer === id)
    const customerProjects = PROJECTS.filter(p => p.customer === id)
    const customerInvoices = INVOICES.filter(i => i.customer === id)

    const invoiceData = [
        { name: 'Đã TT', value: customerInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) },
        { name: 'Chờ TT', value: customerInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0) },
        { name: 'Quá hạn', value: customerInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0) },
    ].filter(d => d.value > 0)

    return (
        <div className="space-y-6">
            <Link href="/demo/customers">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-zinc-950 dark:hover:text-zinc-50 -ml-3">
                    <ArrowLeft className="h-4 w-4" /> Khách hàng
                </Button>
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-zinc-600 dark:text-zinc-300">{customer.name.split(' ').slice(-1)[0][0]}</span>
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{customer.name}</h1>
                    <p className="text-sm text-muted-foreground">{customer.company}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${customer.type === 'Doanh nghiệp' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                            {customer.type}
                        </Badge>
                        <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {customer.status === 'active' ? 'Đang hoạt động' : 'Hoàn thành'}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Giá trị tích lũy</p>
                    <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(customer.totalValue)}</p>
                </div>
            </div>

            {/* Contact */}
            <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-4">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-4">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-4">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{customer.company}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: 'Báo giá', value: customerQuotations.length },
                    { label: 'Hợp đồng', value: customerContracts.length },
                    { label: 'Dự án', value: customerProjects.length },
                    { label: 'Hóa đơn', value: customerInvoices.length },
                ].map((s, i) => (
                    <Card key={i} className="rounded-xl border-border/50 text-center">
                        <CardContent className="pt-5 pb-4">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{s.value}</div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-1">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Invoice pie chart */}
                {invoiceData.length > 0 && (
                    <Card className="rounded-xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold tracking-tight">Phân bổ hóa đơn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={invoiceData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" paddingAngle={3}>
                                        {invoiceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Projects list */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Dự án</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {customerProjects.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dự án</p>}
                        {customerProjects.map(p => (
                            <Link key={p.id} href={`/demo/projects/${p.id}`} className="block">
                                <div className="flex items-center gap-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 -mx-2 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.designer}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-zinc-900 dark:bg-zinc-300 rounded-full" style={{ width: `${p.progress}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 w-8 text-right">{p.progress}%</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Invoices table */}
            {customerInvoices.length > 0 && (
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Hóa đơn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border/50">
                            {customerInvoices.map(inv => (
                                <Link key={inv.id} href={`/demo/invoices/${inv.id}`} className="block">
                                    <div className="flex items-center gap-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 -mx-2 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{inv.description}</p>
                                            <p className="text-xs text-muted-foreground">Hạn: {inv.dueDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(inv.amount)}</p>
                                            <Badge className={`text-[10px] font-semibold border-none px-2 py-0.5 rounded-md ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : inv.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                                {inv.status === 'paid' ? 'Đã TT' : inv.status === 'overdue' ? 'Quá hạn' : 'Chờ TT'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
