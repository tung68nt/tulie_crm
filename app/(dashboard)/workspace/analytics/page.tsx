import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { AnalyticsClient } from '@/components/workspace/AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const [tasks, users] = await Promise.all([
        getWorkspaceTasks(),
        getUsers(),
    ])

    const teamMembers = (users || []).filter((u: any) => u.is_active !== false).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || u.email || 'N/A',
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Thống kê năng suất — tổng quan công việc
                </p>
            </div>

            <AnalyticsClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
