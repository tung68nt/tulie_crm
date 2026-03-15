import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { BoardClient } from '@/components/workspace/BoardClient'
import { QuickAddTaskDialog } from '@/components/workspace/QuickAddTaskDialog'

export const dynamic = 'force-dynamic'

export default async function BoardPage() {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Board</h1>
                    <p className="text-muted-foreground">
                        Kanban board — kéo thả task giữa các cột trạng thái
                    </p>
                </div>
                <QuickAddTaskDialog teamMembers={teamMembers} />
            </div>

            {/* Kanban Board (client component with drag & drop + detail panel) */}
            <BoardClient tasks={tasks} teamMembers={teamMembers} />
        </div>
    )
}
