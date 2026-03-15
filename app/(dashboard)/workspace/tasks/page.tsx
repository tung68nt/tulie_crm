import { createClient } from '@/lib/supabase/server'
import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { TaskListClient } from '@/components/workspace/TaskListClient'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
                <p className="text-muted-foreground">
                    Quản lý công việc — danh sách, lọc, tìm kiếm
                </p>
            </div>

            {/* Task List (client component with filters + detail panel) */}
            <TaskListClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
