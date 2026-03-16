import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyTodayOverview, getMyWeekOverview, getRevenueProgress, getWorkspaceAlerts, getMonthSummary } from '@/lib/supabase/services/workspace-service'
import TodayTaskList from '@/components/workspace/TodayTaskList'
import WeeklyTimeline from '@/components/workspace/WeeklyTimeline'
import RevenueProgressCard from '@/components/workspace/RevenueProgressCard'
import AlertPanel from '@/components/workspace/AlertPanel'
import MonthSummaryCard from '@/components/workspace/MonthSummaryCard'
import { Loader2, ListTodo, Kanban, Calendar, GanttChart, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    )
}

export default async function WorkspacePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || ''

    const [todayOverview, weekOverview, revenueProgress, alerts, monthSummary] = await Promise.all([
        getMyTodayOverview(userId),
        getMyWeekOverview(userId),
        getRevenueProgress('monthly'),
        getWorkspaceAlerts(userId),
        getMonthSummary(userId),
    ])

    const dangerAlerts = alerts.filter(a => a.severity === 'danger').length
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
                    <p className="text-muted-foreground">
                        Tổng quan công việc cá nhân
                    </p>
                </div>
                {(dangerAlerts > 0 || warningAlerts > 0) && (
                    <div className="flex gap-2">
                        {dangerAlerts > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 h-6 rounded-full text-[11px] font-normal bg-rose-50 text-rose-700">
                                {dangerAlerts} cảnh báo
                            </span>
                        )}
                        {warningAlerts > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 h-6 rounded-full text-[11px] font-normal bg-amber-50 text-amber-700">
                                {warningAlerts} chú ý
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { title: 'Tasks', desc: 'Danh sách công việc', href: '/workspace/tasks', icon: ListTodo, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' },
                    { title: 'Board', desc: 'Kanban board', href: '/workspace/board', icon: Kanban, color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' },
                    { title: 'Calendar', desc: 'Lịch deadline', href: '/workspace/calendar', icon: Calendar, color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-50' },
                    { title: 'Timeline', desc: 'Gantt chart', href: '/workspace/timeline', icon: GanttChart, color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' },
                ].map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className="group flex items-center gap-3 p-3 rounded-xl border bg-background hover:shadow-sm transition-all cursor-pointer">
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${item.color}`}>
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Top row: Revenue + Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={<LoadingFallback />}>
                    <RevenueProgressCard progress={revenueProgress} />
                </Suspense>
                <Suspense fallback={<LoadingFallback />}>
                    <MonthSummaryCard summary={monthSummary} />
                </Suspense>
            </div>

            {/* Alerts Panel */}
            {alerts.length > 0 && (
                <Suspense fallback={<LoadingFallback />}>
                    <AlertPanel alerts={alerts} />
                </Suspense>
            )}

            {/* Today's Tasks */}
            <Suspense fallback={<LoadingFallback />}>
                <TodayTaskList overview={todayOverview} />
            </Suspense>

            {/* Week Overview */}
            <Suspense fallback={<LoadingFallback />}>
                <WeeklyTimeline overview={weekOverview} />
            </Suspense>
        </div>
    )
}
