'use client'

import * as React from 'react'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GanttChart, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { QuickAddTaskDialog } from './QuickAddTaskDialog'
import { TaskDetailPanel } from './TaskDetailPanel'

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

const priorityLabels: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    medium: '🔵',
    low: '⚪',
}

type ZoomLevel = 'week' | 'month' | 'quarter'

interface TimelineClientProps {
    tasks: WorkspaceTask[]
    teamMembers: { id: string; full_name: string }[]
}

export function TimelineClient({ tasks, teamMembers }: TimelineClientProps) {
    const [selectedTask, setSelectedTask] = React.useState<WorkspaceTask | null>(null)
    const [panelOpen, setPanelOpen] = React.useState(false)
    const [zoom, setZoom] = React.useState<ZoomLevel>('month')
    const [offset, setOffset] = React.useState(0) // weeks offset from today

    const now = new Date()

    // Configure timeline range based on zoom
    const zoomConfig = {
        week: { pastDays: 7, futureDays: 14, label: '3 tuần' },
        month: { pastDays: 14, futureDays: 28, label: '6 tuần' },
        quarter: { pastDays: 30, futureDays: 60, label: '3 tháng' },
    }
    const config = zoomConfig[zoom]

    const timelineStart = new Date(now)
    timelineStart.setDate(timelineStart.getDate() - config.pastDays + (offset * 7))
    const timelineEnd = new Date(now)
    timelineEnd.setDate(timelineEnd.getDate() + config.futureDays + (offset * 7))
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))

    // Sort and filter tasks
    const sortedTasks = [...tasks]
        .filter(t => t.status !== 'cancelled')
        .sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })

    // Generate day markers for header
    const dayMarkers: { date: Date; dayOfWeek: number; isMonday: boolean; label: string }[] = []
    for (let i = 0; i < totalDays; i++) {
        const d = new Date(timelineStart)
        d.setDate(d.getDate() + i)
        const dayOfWeek = d.getDay()
        const isMonday = dayOfWeek === 1
        dayMarkers.push({
            date: d,
            dayOfWeek,
            isMonday,
            label: isMonday ? `${d.getDate()}/${d.getMonth() + 1}` : '',
        })
    }

    const todayPosition = Math.ceil((now.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const todayPercent = (todayPosition / totalDays) * 100

    function openTask(task: WorkspaceTask) {
        setSelectedTask(task)
        setPanelOpen(true)
    }

    function scrollLeft() { setOffset(o => o - 1) }
    function scrollRight() { setOffset(o => o + 1) }
    function goToday() { setOffset(0) }

    const zoomLevels: ZoomLevel[] = ['week', 'month', 'quarter']
    function zoomIn() {
        const idx = zoomLevels.indexOf(zoom)
        if (idx > 0) setZoom(zoomLevels[idx - 1])
    }
    function zoomOut() {
        const idx = zoomLevels.indexOf(zoom)
        if (idx < zoomLevels.length - 1) setZoom(zoomLevels[idx + 1])
    }

    return (
        <>
            <div className="space-y-4">
                {/* Controls */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={scrollLeft}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {offset !== 0 && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={goToday}>
                                Hôm nay
                            </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={scrollRight}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border rounded-lg p-0.5">
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={zoomIn}
                                disabled={zoom === 'week'}
                            >
                                <ZoomIn className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-medium px-2 text-muted-foreground min-w-[60px] text-center">
                                {config.label}
                            </span>
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={zoomOut}
                                disabled={zoom === 'quarter'}
                            >
                                <ZoomOut className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <QuickAddTaskDialog teamMembers={teamMembers} />
                    </div>
                </div>

                {sortedTasks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <GanttChart className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-1">Chưa có task nào</h3>
                            <p className="text-sm text-muted-foreground mb-4">Tạo task với deadline để hiển thị trên timeline</p>
                            <QuickAddTaskDialog teamMembers={teamMembers} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Week / Day Headers */}
                                <div className="flex border-b relative" style={{ height: '36px' }}>
                                    <div className="w-[220px] shrink-0 px-3 flex items-center text-xs font-semibold text-muted-foreground border-r bg-background sticky left-0 z-20">
                                        Task
                                    </div>
                                    <div className="flex-1 relative flex">
                                        {dayMarkers.map((marker, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 flex items-end justify-center pb-1 text-[9px] font-medium border-r ${
                                                    marker.isMonday
                                                        ? 'text-foreground border-r-zinc-300'
                                                        : 'text-muted-foreground/40 border-r-zinc-100'
                                                } ${marker.dayOfWeek === 0 || marker.dayOfWeek === 6 ? 'bg-muted/20' : ''}`}
                                            >
                                                {marker.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Task Rows */}
                                {sortedTasks.map((task) => {
                                    const taskDate = task.due_date ? new Date(task.due_date) : null
                                    const startDate = task.start_date ? new Date(task.start_date) : (task.created_at ? new Date(task.created_at) : now)

                                    const barStart = Math.max(0, Math.ceil((startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)))
                                    const barEnd = taskDate
                                        ? Math.ceil((taskDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                                        : barStart + 5

                                    const barStartPercent = Math.max(0, (barStart / totalDays) * 100)
                                    const barWidthPercent = Math.max(1.5, ((Math.max(barEnd - barStart, 1)) / totalDays) * 100)

                                    const isOverdue = taskDate && taskDate < now && task.status !== 'completed'

                                    return (
                                        <div
                                            key={task.id}
                                            className="flex border-b last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer group"
                                            style={{ height: '38px' }}
                                            onClick={() => openTask(task)}
                                        >
                                            <div className="w-[220px] shrink-0 px-3 flex items-center gap-2 border-r bg-background sticky left-0 z-20">
                                                <div className={`h-2 w-2 rounded-full shrink-0 ${statusColors[task.status] || 'bg-zinc-400'}`} />
                                                <span className="text-[11px] font-medium truncate flex-1">{task.title}</span>
                                                {task.priority && (
                                                    <span className="text-[10px] shrink-0">{priorityLabels[task.priority] || ''}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 relative">
                                                {/* Today marker */}
                                                {todayPercent >= 0 && todayPercent <= 100 && (
                                                    <div
                                                        className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                                                        style={{ left: `${todayPercent}%` }}
                                                    />
                                                )}
                                                {/* Task bar */}
                                                <div
                                                    className={`absolute top-2 h-[18px] rounded-md transition-all group-hover:brightness-110 ${
                                                        isOverdue
                                                            ? 'bg-red-200 border border-red-400'
                                                            : statusColors[task.status] || 'bg-zinc-300'
                                                    } ${task.status === 'completed' ? 'opacity-40' : 'opacity-80'}`}
                                                    style={{
                                                        left: `${barStartPercent}%`,
                                                        width: `${Math.min(barWidthPercent, 100 - barStartPercent)}%`,
                                                        minWidth: '12px',
                                                    }}
                                                    title={`${task.title} — ${statusLabels[task.status] || task.status}${taskDate ? ` | Due: ${taskDate.toLocaleDateString('vi-VN')}` : ''}`}
                                                >
                                                    {/* Task title on bar if wide enough */}
                                                    {barWidthPercent > 8 && (
                                                        <span className="absolute inset-0 flex items-center px-1.5 text-[9px] font-medium text-white truncate">
                                                            {task.title}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Assignee dot */}
                                                {task.assigned_user && barStartPercent + barWidthPercent < 95 && (
                                                    <div
                                                        className="absolute top-2.5 h-4 w-4 rounded-full bg-zinc-200 flex items-center justify-center text-[7px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{ left: `${Math.min(barStartPercent + barWidthPercent + 0.5, 98)}%` }}
                                                    >
                                                        {((task.assigned_user as any).full_name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    {Object.entries(statusColors).filter(([k]) => k !== 'cancelled').map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <div className={`h-2.5 w-2.5 rounded-md ${color}`} />
                            <span>{statusLabels[status]}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-3 h-px bg-red-400" />
                        <span>Hôm nay</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-6 rounded-md bg-red-200 border border-red-400" />
                        <span>Quá hạn</span>
                    </div>
                </div>
            </div>

            {/* Task Detail Panel */}
            <TaskDetailPanel
                task={selectedTask}
                open={panelOpen}
                onOpenChange={setPanelOpen}
                teamMembers={teamMembers}
            />
        </>
    )
}
