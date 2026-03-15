'use client'

import * as React from 'react'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react'

const statusColors: Record<string, string> = {
    todo: 'bg-zinc-400',
    in_progress: 'bg-blue-500',
    in_review: 'bg-amber-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-300',
}

const statusLabels: Record<string, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    in_review: 'Đang review',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ',
}

const priorityLabels: Record<string, string> = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
}

const categoryLabels: Record<string, string> = {
    internal: 'Nội bộ',
    follow_up: 'Theo dõi',
    client_request: 'Yêu cầu KH',
    admin: 'Hành chính',
}

interface AnalyticsClientProps {
    tasks: WorkspaceTask[]
    teamMembers: { id: string; full_name: string }[]
}

export function AnalyticsClient({ tasks, teamMembers }: AnalyticsClientProps) {
    const now = new Date()

    // Core metrics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    const overdueTasks = activeTasks.filter(t => t.due_date && new Date(t.due_date) < now)

    // This month vs last month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const completedThisMonth = completedTasks.filter(t => t.completed_at && new Date(t.completed_at) >= thisMonth).length
    const completedLastMonth = completedTasks.filter(t => {
        if (!t.completed_at) return false
        const d = new Date(t.completed_at)
        return d >= lastMonth && d < thisMonth
    }).length
    const monthTrend = completedLastMonth > 0
        ? Math.round(((completedThisMonth - completedLastMonth) / completedLastMonth) * 100)
        : completedThisMonth > 0 ? 100 : 0

    // Average completion time (days)
    const completionTimes = completedTasks
        .filter(t => t.completed_at && t.created_at)
        .map(t => (new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const avgCompletionDays = completionTimes.length > 0
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length * 10) / 10
        : 0

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

    // Status distribution
    const statusCounts = tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const statusTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0)

    // Priority distribution
    const priorityCounts = activeTasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Category distribution
    const categoryCounts = tasks.reduce((acc, t) => {
        const cat = t.category || 'internal'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Weekly completion trend (last 8 weeks)
    const weeklyData: { label: string; count: number }[] = []
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const count = completedTasks.filter(t => {
            if (!t.completed_at) return false
            const d = new Date(t.completed_at)
            return d >= weekStart && d < weekEnd
        }).length

        weeklyData.push({
            label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
            count,
        })
    }
    const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1)

    // Top performers (by completed tasks)
    const memberStats = teamMembers.map(member => {
        const memberCompleted = completedTasks.filter(t => t.assigned_to === member.id).length
        const memberActive = activeTasks.filter(t => t.assigned_to === member.id).length
        return { ...member, completed: memberCompleted, active: memberActive, total: memberCompleted + memberActive }
    })
        .filter(m => m.total > 0)
        .sort((a, b) => b.completed - a.completed)

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Tổng task</span>
                        </div>
                        <p className="text-2xl font-bold">{totalTasks}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{activeTasks.length} đang hoạt động</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">Hoàn thành</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{completionRate}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{completedTasks.length}/{totalTasks} tasks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground">TB hoàn thành</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{avgCompletionDays}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">ngày / task</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {monthTrend >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                            <span className="text-xs text-muted-foreground">Tháng này</span>
                        </div>
                        <p className="text-2xl font-bold">{completedThisMonth}</p>
                        <p className={`text-[10px] mt-1 font-medium ${monthTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {monthTrend >= 0 ? '+' : ''}{monthTrend}% so với tháng trước
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Distribution */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Phân bổ trạng thái</h3>
                        {/* Stacked bar */}
                        <div className="h-6 rounded-full overflow-hidden flex mb-3">
                            {Object.entries(statusCounts).filter(([k]) => k !== 'cancelled').map(([status, count]) => (
                                <div
                                    key={status}
                                    className={`h-full ${statusColors[status] || 'bg-zinc-300'} transition-all`}
                                    style={{ width: `${(count / statusTotal) * 100}%` }}
                                    title={`${statusLabels[status]}: ${count}`}
                                />
                            ))}
                        </div>
                        <div className="space-y-2">
                            {Object.entries(statusCounts).filter(([k]) => k !== 'cancelled').map(([status, count]) => (
                                <div key={status} className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
                                    <span className="text-xs flex-1">{statusLabels[status]}</span>
                                    <span className="text-xs font-semibold">{count}</span>
                                    <span className="text-[10px] text-muted-foreground w-10 text-right">
                                        {Math.round((count / statusTotal) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Mức ưu tiên (task hoạt động)</h3>
                        <div className="space-y-3">
                            {['urgent', 'high', 'medium', 'low'].map(priority => {
                                const count = priorityCounts[priority] || 0
                                const percent = activeTasks.length > 0 ? (count / activeTasks.length) * 100 : 0
                                return (
                                    <div key={priority} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>{priorityLabels[priority]}</span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    priority === 'urgent' || priority === 'high' ? 'bg-red-500' :
                                                    priority === 'medium' ? 'bg-blue-500' : 'bg-zinc-400'
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Trend */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Hoàn thành theo tuần (8 tuần gần nhất)</h3>
                        <div className="flex items-end gap-1 h-[120px]">
                            {weeklyData.map((week, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[9px] text-muted-foreground font-medium">{week.count}</span>
                                    <div
                                        className={`w-full rounded-t transition-all ${
                                            i === weeklyData.length - 1 ? 'bg-blue-500' : 'bg-blue-200'
                                        }`}
                                        style={{ height: `${Math.max((week.count / maxWeekly) * 90, 4)}%` }}
                                    />
                                    <span className="text-[8px] text-muted-foreground">{week.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Phân loại công việc</h3>
                        <div className="space-y-3">
                            {Object.entries(categoryCounts).sort(([,a], [,b]) => b - a).map(([cat, count]) => {
                                const percent = totalTasks > 0 ? (count / totalTasks) * 100 : 0
                                return (
                                    <div key={cat} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>{categoryLabels[cat] || cat}</span>
                                            <span className="font-semibold">{count} <span className="text-muted-foreground font-normal">({Math.round(percent)}%)</span></span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            {memberStats.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Bảng xếp hạng</h3>
                        <div className="space-y-2">
                            {memberStats.slice(0, 10).map((member, i) => (
                                <div key={member.id} className="flex items-center gap-3 py-1.5">
                                    <span className={`text-sm font-bold w-6 text-center ${
                                        i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'
                                    }`}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </span>
                                    <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-semibold text-zinc-600 shrink-0">
                                        {member.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium flex-1">{member.full_name}</span>
                                    <Badge variant="secondary" className="text-[10px]">{member.completed} xong</Badge>
                                    <Badge variant="outline" className="text-[10px]">{member.active} đang làm</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overdue Alert */}
            {overdueTasks.length > 0 && (
                <Card className="border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <h3 className="text-sm font-semibold text-red-700">{overdueTasks.length} task quá hạn</h3>
                        </div>
                        <div className="space-y-1">
                            {overdueTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center gap-2 py-1 text-xs">
                                    <span className="flex-1 truncate font-medium">{task.title}</span>
                                    <span className="text-red-600 shrink-0">
                                        {task.due_date && new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                    <span className="text-muted-foreground shrink-0">
                                        {(task.assigned_user as any)?.full_name || 'Chưa giao'}
                                    </span>
                                </div>
                            ))}
                            {overdueTasks.length > 5 && (
                                <p className="text-[10px] text-muted-foreground">+{overdueTasks.length - 5} task khác</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
