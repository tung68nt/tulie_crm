'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROJECTS, INVOICES, formatCurrency } from '@/lib/demo/mock-data'
import { ArrowLeft, Calendar, User, TrendingUp } from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    design: { label: 'Thiết kế', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    in_progress: { label: 'Đang thi công', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
}

const PHASE_COLORS = ['#18181b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const project = PROJECTS.find(p => p.id === id)

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Không tìm thấy dự án</p>
                <Link href="/demo/projects"><Button variant="outline">← Quay lại</Button></Link>
            </div>
        )
    }

    const st = STATUS_MAP[project.status] || STATUS_MAP.in_progress
    const projectInvoices = INVOICES.filter(i => i.customer === project.customer)

    const phases = [
        { name: 'Khảo sát & Tư vấn', pct: 10 },
        { name: 'Thiết kế 3D', pct: 25 },
        { name: 'Duyệt & Báo giá', pct: 10 },
        { name: 'Thi công', pct: 45 },
        { name: 'Bàn giao', pct: 10 },
    ]

    const currentPhaseIdx = project.progress < 10 ? 0 : project.progress < 35 ? 1 : project.progress < 45 ? 2 : project.progress < 90 ? 3 : 4

    const budgetData = [
        { name: 'Đã sử dụng', value: Math.round(project.value * (project.progress / 100)) },
        { name: 'Còn lại', value: Math.round(project.value * ((100 - project.progress) / 100)) },
    ]

    return (
        <div className="space-y-6">
            <Link href="/demo/projects">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-zinc-950 dark:hover:text-zinc-50 -ml-3">
                    <ArrowLeft className="h-4 w-4" /> Dự án
                </Button>
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{project.name}</h1>
                    <Link href={`/demo/customers/${project.customer}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {project.customerName}
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${st.color}`}>{st.label}</Badge>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Giá trị</p>
                    <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(project.value)}</p>
                </div>
            </div>

            {/* Key info cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: 'Tiến độ', value: `${project.progress}%`, icon: TrendingUp },
                    { label: 'Designer', value: project.designer, icon: User },
                    { label: 'Bắt đầu', value: project.startDate, icon: Calendar },
                    { label: 'Kết thúc', value: project.endDate, icon: Calendar },
                ].map((s, i) => (
                    <Card key={i} className="rounded-xl border-border/50">
                        <CardContent className="pt-5 pb-4 flex items-center gap-3">
                            <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">{s.label}</p>
                                <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Progress bar */}
            <Card className="rounded-xl border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg font-bold tracking-tight">Tiến độ chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                        <div className={`h-full rounded-full transition-all ${project.progress === 100 ? 'bg-emerald-500' : 'bg-zinc-900 dark:bg-zinc-300'}`} style={{ width: `${project.progress}%` }} />
                    </div>
                    <div className="space-y-3">
                        {phases.map((phase, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full shrink-0 ${i < currentPhaseIdx ? 'bg-emerald-500' : i === currentPhaseIdx ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                <span className={`text-sm font-medium flex-1 ${i <= currentPhaseIdx ? 'text-zinc-950 dark:text-zinc-50' : 'text-muted-foreground'}`}>{phase.name}</span>
                                <span className="text-xs text-muted-foreground">{phase.pct}%</span>
                                <Badge className={`text-[10px] font-semibold border-none px-2 py-0.5 rounded-md ${i < currentPhaseIdx ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : i === currentPhaseIdx ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                    {i < currentPhaseIdx ? 'Xong' : i === currentPhaseIdx ? 'Đang TH' : 'Chờ'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Budget Pie */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Ngân sách</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={budgetData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                                    <Cell fill="#18181b" />
                                    <Cell fill="#e4e4e7" />
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #d4d4d8', fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Invoices */}
                <Card className="rounded-xl border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold tracking-tight">Hóa đơn liên quan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {projectInvoices.length === 0 && <p className="text-sm text-muted-foreground">Chưa có hóa đơn</p>}
                        {projectInvoices.map(inv => (
                            <Link key={inv.id} href={`/demo/invoices/${inv.id}`} className="block">
                                <div className="flex items-center gap-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg px-2 -mx-2 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">{inv.description}</p>
                                        <p className="text-xs text-muted-foreground">{inv.dueDate}</p>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(inv.amount)}</p>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
