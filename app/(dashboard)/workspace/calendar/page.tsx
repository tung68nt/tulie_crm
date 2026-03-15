import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { CalendarClient } from '@/components/workspace/CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
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
                <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
                <p className="text-muted-foreground">
                    Xem task theo lịch — deadline và tiến độ theo ngày
                </p>
            </div>

            <CalendarClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
