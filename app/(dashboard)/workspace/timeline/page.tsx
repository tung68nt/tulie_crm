import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { TimelineClient } from '@/components/workspace/TimelineClient'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
    const [tasks, users] = await Promise.all([
        getWorkspaceTasks(),
        getUsers(),
    ])

    const teamMembers = (users || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || u.email || 'N/A',
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
                <p className="text-muted-foreground">
                    Xem tiến độ task theo dòng thời gian — scroll và zoom
                </p>
            </div>

            <TimelineClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
