import { createClient } from '@/lib/supabase/server'
import { getWorkspaceTasks } from '@/lib/supabase/services/workspace-service'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-zinc-400',
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Monday-first
}

export default async function CalendarPage() {
    const tasks = await getWorkspaceTasks()

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const today = now.getDate()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

    // Group tasks by day
    const tasksByDay: Record<number, typeof tasks> = {}
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">
                        Xem task theo lịch — deadline và tiến độ theo ngày
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold min-w-[140px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
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
                            const isToday = day === today

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[100px] border-b border-r p-1.5 ${
                                        day ? 'bg-background' : 'bg-muted/20'
                                    } ${i % 7 === 6 ? 'border-r-0' : ''}`}
                                >
                                    {day && (
                                        <>
                                            <span className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                                isToday
                                                    ? 'bg-foreground text-background'
                                                    : 'text-muted-foreground'
                                            }`}>
                                                {day}
                                            </span>
                                            <div className="mt-1 space-y-0.5">
                                                {dayTasks.slice(0, 3).map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] bg-muted/50 hover:bg-muted truncate cursor-pointer transition-colors"
                                                    >
                                                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-zinc-400'}`} />
                                                        <span className="truncate">{task.title}</span>
                                                    </div>
                                                ))}
                                                {dayTasks.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground px-1">
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
        </div>
    )
}
