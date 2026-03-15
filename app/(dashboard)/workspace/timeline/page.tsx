import { createClient } from '@/lib/supabase/server'
import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { Card, CardContent } from '@/components/ui/card'
import { GanttChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
    todo: 'bg-zinc-300',
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

export default async function TimelinePage() {
    const tasks = await getWorkspaceTasks()

    // Sort tasks by due_date, tasks without due_date at the end
    const sortedTasks = [...tasks]
        .filter(t => t.status !== 'cancelled')
        .sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })

    const now = new Date()

    // Calculate timeline range: from 2 weeks ago to 4 weeks from now
    const timelineStart = new Date(now)
    timelineStart.setDate(timelineStart.getDate() - 14)
    const timelineEnd = new Date(now)
    timelineEnd.setDate(timelineEnd.getDate() + 28)
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))

    // Generate week labels
    const weeks: { label: string; startDay: number; days: number }[] = []
    const tempDate = new Date(timelineStart)
    while (tempDate < timelineEnd) {
        const weekStart = new Date(tempDate)
        const dayOfWeek = weekStart.getDay() || 7
        const monday = new Date(weekStart)
        monday.setDate(monday.getDate() - dayOfWeek + 1)

        const label = `${monday.getDate()}/${monday.getMonth() + 1}`
        const startDay = Math.max(0, Math.ceil((monday.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)))
        weeks.push({ label, startDay, days: 7 })

        tempDate.setDate(tempDate.getDate() + 7)
    }

    const todayPosition = Math.ceil((now.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const todayPercent = (todayPosition / totalDays) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
                    <p className="text-muted-foreground">
                        Xem tiến độ task theo dòng thời gian — 2 tuần trước → 4 tuần sau
                    </p>
                </div>
            </div>

            {sortedTasks.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <GanttChart className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">Chưa có task nào</h3>
                        <p className="text-sm text-muted-foreground">Tạo task với deadline để hiển thị trên timeline</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Week Headers */}
                            <div className="flex border-b relative" style={{ height: '36px' }}>
                                <div className="w-[200px] shrink-0 px-3 flex items-center text-xs font-semibold text-muted-foreground border-r">
                                    Task
                                </div>
                                <div className="flex-1 relative">
                                    {weeks.map((week, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground border-r"
                                            style={{
                                                left: `${(week.startDay / totalDays) * 100}%`,
                                                width: `${(week.days / totalDays) * 100}%`,
                                            }}
                                        >
                                            Tuần {week.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Task Rows */}
                            {sortedTasks.map((task) => {
                                const taskDate = task.due_date ? new Date(task.due_date) : null
                                const createdDate = task.created_at ? new Date(task.created_at) : now

                                const barStart = Math.max(0, Math.ceil((createdDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)))
                                const barEnd = taskDate
                                    ? Math.ceil((taskDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                                    : barStart + 7

                                const barStartPercent = Math.max(0, (barStart / totalDays) * 100)
                                const barWidthPercent = Math.max(2, ((barEnd - barStart) / totalDays) * 100)

                                const isOverdue = taskDate && taskDate < now && task.status !== 'completed'

                                return (
                                    <div key={task.id} className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors" style={{ height: '40px' }}>
                                        <div className="w-[200px] shrink-0 px-3 flex items-center gap-2 border-r">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${statusColors[task.status] || 'bg-zinc-400'}`} />
                                            <span className="text-xs font-medium truncate">{task.title}</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            {/* Today marker */}
                                            <div
                                                className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                                                style={{ left: `${todayPercent}%` }}
                                            />
                                            {/* Task bar */}
                                            <div
                                                className={`absolute top-2 h-5 rounded-full ${
                                                    isOverdue
                                                        ? 'bg-red-200 border border-red-400'
                                                        : statusColors[task.status] || 'bg-zinc-300'
                                                } ${task.status === 'completed' ? 'opacity-50' : 'opacity-80'}`}
                                                style={{
                                                    left: `${barStartPercent}%`,
                                                    width: `${Math.min(barWidthPercent, 100 - barStartPercent)}%`,
                                                    minWidth: '20px',
                                                }}
                                                title={`${task.title} — ${statusLabels[task.status] || task.status}`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {Object.entries(statusColors).filter(([k]) => k !== 'cancelled').map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span>{statusLabels[status]}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                    <div className="h-full w-px bg-red-400 h-3" />
                    <span>Hôm nay</span>
                </div>
            </div>
        </div>
    )
}
