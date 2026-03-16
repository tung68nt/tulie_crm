'use client'

import * as React from 'react'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { QuickAddTaskDialog } from './QuickAddTaskDialog'
import { TaskDetailPanel } from './TaskDetailPanel'

const priorityColors: Record<string, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-zinc-400',
}

const statusDots: Record<string, string> = {
    todo: 'border-zinc-300',
    in_progress: 'border-blue-500',
    in_review: 'border-amber-500',
    completed: 'border-emerald-500 bg-emerald-500',
    cancelled: 'border-red-300',
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
}

const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CalendarClientProps {
    tasks: WorkspaceTask[]
    teamMembers: { id: string; full_name: string }[]
}

export function CalendarClient({ tasks, teamMembers }: CalendarClientProps) {
    const now = new Date()
    const [year, setYear] = React.useState(now.getFullYear())
    const [month, setMonth] = React.useState(now.getMonth())
    const [selectedTask, setSelectedTask] = React.useState<WorkspaceTask | null>(null)
    const [panelOpen, setPanelOpen] = React.useState(false)
    const [selectedDay, setSelectedDay] = React.useState<number | null>(null)

    const today = now.getDate()
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Group tasks by day
    const tasksByDay: Record<number, WorkspaceTask[]> = {}
    tasks.forEach(task => {
        if (task.due_date) {
            const d = new Date(task.due_date)
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate()
                if (!tasksByDay[day]) tasksByDay[day] = []
                tasksByDay[day].push(task)
            }
        }
    })

    // Build calendar grid
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    function prevMonth() {
        if (month === 0) { setYear(y => y - 1); setMonth(11) }
        else setMonth(m => m - 1)
        setSelectedDay(null)
    }

    function nextMonth() {
        if (month === 11) { setYear(y => y + 1); setMonth(0) }
        else setMonth(m => m + 1)
        setSelectedDay(null)
    }

    function goToday() {
        setYear(now.getFullYear())
        setMonth(now.getMonth())
        setSelectedDay(null)
    }

    function openTask(task: WorkspaceTask) {
        setSelectedTask(task)
        setPanelOpen(true)
    }

    // Count tasks this month
    const tasksThisMonth = tasks.filter(t => {
        if (!t.due_date) return false
        const d = new Date(t.due_date)
        return d.getFullYear() === year && d.getMonth() === month
    }).length

    // Format due date for quick-add default
    function formatDateForInput(day: number) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    return (
        <>
            <div className="space-y-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[140px] text-center">
                            {monthNames[month]} {year}
                        </span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        {!isCurrentMonth && (
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={goToday}>
                                Hôm nay
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            {tasksThisMonth} task trong tháng
                        </span>
                        <QuickAddTaskDialog teamMembers={teamMembers} />
                    </div>
                </div>

                {/* Calendar Grid */}
                <Card>
                    <CardContent className="p-0">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b">
                            {dayNames.map((d) => (
                                <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar cells */}
                        <div className="grid grid-cols-7">
                            {cells.map((day, i) => {
                                const dayTasks = day ? (tasksByDay[day] || []) : []
                                const isTodayCell = isCurrentMonth && day === today
                                const isSelected = selectedDay === day
                                const isWeekend = i % 7 >= 5

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[110px] border-b border-r p-1.5 transition-colors cursor-pointer ${
                                            day ? (isSelected ? 'bg-blue-50/50' : 'bg-background hover:bg-muted/30') : 'bg-muted/10'
                                        } ${i % 7 === 6 ? 'border-r-0' : ''} ${isWeekend && day ? 'bg-muted/5' : ''}`}
                                        onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                                    >
                                        {day && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full transition-colors ${
                                                        isTodayCell
                                                            ? 'bg-foreground text-background'
                                                            : isSelected
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'text-muted-foreground'
                                                    }`}>
                                                        {day}
                                                    </span>
                                                    {dayTasks.length > 0 && (
                                                        <span className="text-[11px] text-muted-foreground font-medium">
                                                            {dayTasks.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 space-y-0.5">
                                                    {dayTasks.slice(0, 3).map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] truncate cursor-pointer transition-colors ${
                                                                task.status === 'completed'
                                                                    ? 'bg-emerald-50 text-emerald-700 line-through opacity-70'
                                                                    : 'bg-muted/50 hover:bg-muted text-foreground'
                                                            }`}
                                                            onClick={(e) => { e.stopPropagation(); openTask(task) }}
                                                        >
                                                            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-zinc-400'}`} />
                                                            <span className="truncate">{task.title}</span>
                                                        </div>
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <span className="text-[11px] text-muted-foreground px-1 font-medium">
                                                            +{dayTasks.length - 3} khác
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected day detail */}
                {selectedDay && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold">
                                    {selectedDay}/{month + 1}/{year}
                                    {isCurrentMonth && selectedDay === today && (
                                        <span className="text-xs font-normal text-muted-foreground ml-2">Hôm nay</span>
                                    )}
                                </h3>
                                <QuickAddTaskDialog teamMembers={teamMembers} trigger={
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <Plus className="h-3 w-3 mr-1" />
                                        Thêm task ngày này
                                    </Button>
                                } />
                            </div>
                            {(tasksByDay[selectedDay] || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Không có task nào ngày này
                                </p>
                            ) : (
                                <div className="space-y-1.5">
                                    {(tasksByDay[selectedDay] || []).map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => openTask(task)}
                                        >
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-zinc-400'}`} />
                                            <span className={`text-sm flex-1 truncate ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                                {task.title}
                                            </span>
                                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                                task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                task.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                                                task.status === 'in_review' ? 'bg-amber-100 text-amber-700' :
                                                'bg-zinc-100 text-zinc-700'
                                            }`}>
                                                {task.status === 'completed' ? 'Xong' :
                                                 task.status === 'in_progress' ? 'Đang làm' :
                                                 task.status === 'in_review' ? 'Review' : 'Cần làm'}
                                            </span>
                                            {task.assigned_user && (
                                                <div className="h-5 w-5 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-medium text-zinc-600 shrink-0">
                                                    {((task.assigned_user as any).full_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
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
