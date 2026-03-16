'use client'

import { WorkspaceWeekOverview } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Milestone } from 'lucide-react'

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

interface WeeklyTimelineProps {
    overview: WorkspaceWeekOverview
}

export default function WeeklyTimeline({ overview }: WeeklyTimelineProps) {
    const { week_tasks, milestone_deadlines } = overview

    // Group tasks by day of week
    const tasksByDay: Record<string, typeof week_tasks> = {}
    week_tasks.forEach(task => {
        if (task.due_date) {
            const date = new Date(task.due_date)
            const key = date.toISOString().split('T')[0]
            if (!tasksByDay[key]) tasksByDay[key] = []
            tasksByDay[key].push(task)
        }
    })

    // Build week days
    const now = new Date()
    const dayOfWeek = now.getDay() || 7
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1 + i)
        return {
            date: d,
            key: d.toISOString().split('T')[0],
            dayName: dayNames[d.getDay()],
            dayNum: d.getDate(),
            isToday: d.toDateString() === now.toDateString(),
        }
    })

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Tuần này ({week_tasks.length} tasks)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map(day => {
                            const dayTasks = tasksByDay[day.key] || []
                            return (
                                <div
                                    key={day.key}
                                    className={`rounded-lg p-2 min-h-[80px] ${
                                        day.isToday
                                            ? 'bg-blue-50 border-2 border-blue-200'
                                            : 'bg-muted/30 border'
                                    }`}
                                >
                                    <div className={`text-center mb-1 ${day.isToday ? 'text-blue-700 font-bold' : 'text-muted-foreground'}`}>
                                        <div className="text-xs">{day.dayName}</div>
                                        <div className="text-sm font-medium">{day.dayNum}</div>
                                    </div>
                                    {dayTasks.length > 0 && (
                                        <div className="space-y-1">
                                            {dayTasks.slice(0, 3).map(task => (
                                                <div
                                                    key={task.id}
                                                    className="text-[11px] leading-tight p-1 rounded bg-white border truncate"
                                                    title={task.title}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <div className="text-[11px] text-muted-foreground text-center">
                                                    +{dayTasks.length - 3} khác
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Milestones */}
            {milestone_deadlines.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Milestone className="h-4 w-4 text-purple-600" />
                            Milestones tuần này ({milestone_deadlines.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {milestone_deadlines.map((ms: any) => (
                            <div key={ms.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{ms.name}</p>
                                    {ms.project?.title && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {ms.project.title}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {ms.due_date && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(ms.due_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {ms.status === 'pending' ? 'Chưa xong' : ms.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
