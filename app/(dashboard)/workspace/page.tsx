import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getMyTodayOverview, getMyWeekOverview, getRevenueProgress, getWorkspaceAlerts, getMonthSummary } from '@/lib/supabase/services/workspace-service'
import TodayTaskList from '@/components/workspace/TodayTaskList'
import WeeklyTimeline from '@/components/workspace/WeeklyTimeline'
import RevenueProgressCard from '@/components/workspace/RevenueProgressCard'
import AlertPanel from '@/components/workspace/AlertPanel'
import MonthSummaryCard from '@/components/workspace/MonthSummaryCard'
import { Loader2 } from 'lucide-react'

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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {dangerAlerts} cảnh báo
                            </span>
                        )}
                        {warningAlerts > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {warningAlerts} chú ý
                            </span>
                        )}
                    </div>
                )}
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
