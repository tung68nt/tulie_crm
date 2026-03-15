import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { TeamWorkloadClient } from '@/components/workspace/TeamWorkloadClient'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
    const [tasks, users] = await Promise.all([
        getWorkspaceTasks(),
        getUsers(),
    ])

    const teamMembers = (users || []).filter((u: any) => u.is_active !== false).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || u.email || 'N/A',
        role: u.role,
        department: u.department,
        avatar_url: u.avatar_url,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Team</h1>
                <p className="text-muted-foreground">
                    Xem phân bổ công việc — ai đang làm gì
                </p>
            </div>

            <TeamWorkloadClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
