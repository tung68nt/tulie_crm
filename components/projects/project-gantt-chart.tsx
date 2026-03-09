'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, differenceInDays, startOfDay, addDays, isSameDay, isWithinInterval } from 'date-fns'
import { vi } from 'date-fns/locale'
import { LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProjectGanttChartProps {
    tasks: any[]
}

export function ProjectGanttChart({ tasks }: ProjectGanttChartProps) {
    const [viewDate, setViewDate] = useState(startOfDay(new Date()))

    // Display 14 days view
    const daysInView = 21
    const timelineDates = useMemo(() => {
        return Array.from({ length: daysInView }).map((_, i) => addDays(addDays(viewDate, -7), i))
    }, [viewDate])

    const today = startOfDay(new Date())

    const getTaskStyle = (task: any) => {
        const start = task.start_date ? startOfDay(new Date(task.start_date)) : null
        const end = task.end_date ? startOfDay(new Date(task.end_date)) : null

        if (!start || !end) return null

        const viewStart = timelineDates[0]
        const viewEnd = timelineDates[timelineDates.length - 1]

        // Check overlapping
        if (end < viewStart || start > viewEnd) return null

        const dayWidth = 100 / daysInView
        const leftDays = differenceInDays(start < viewStart ? viewStart : start, viewStart)
        const durationDays = differenceInDays(end > viewEnd ? viewEnd : end, start < viewStart ? viewStart : start) + 1

        return {
            left: `${leftDays * dayWidth}%`,
            width: `${durationDays * dayWidth}%`,
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-zinc-900'
            case 'in_progress': return 'bg-zinc-400'
            case 'blocked': return 'bg-zinc-200 border border-zinc-300'
            default: return 'bg-zinc-100 border border-zinc-200'
        }
    }

    return (
        <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="py-6 px-6 border-b border-zinc-50 flex flex-row items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div>
                            <CardTitle className="text-[13px] font-black uppercase tracking-widest text-zinc-950">Lộ trình triển khai (Gantt View)</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-zinc-400 opacity-60">Visual Project Timeline</CardDescription>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setViewDate(addDays(viewDate, -7))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-[11px] font-bold" onClick={() => setViewDate(today)}>
                        HÔM NAY
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setViewDate(addDays(viewDate, 7))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] relative">
                    {/* Gantt Header - Days */}
                    <div className="flex border-b border-zinc-50 bg-zinc-50/50">
                        <div className="w-[200px] shrink-0 p-3 border-r border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            ĐẦU VIỆC
                        </div>
                        <div className="flex-1 flex">
                            {timelineDates.map((date, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-1 p-2 text-center border-r border-zinc-100/50 last:border-r-0",
                                        isSameDay(date, today) && "bg-zinc-100/50"
                                    )}
                                >
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{format(date, 'EEE', { locale: vi })}</p>
                                    <p className={cn(
                                        "text-[11px] font-black",
                                        isSameDay(date, today) ? "text-zinc-950" : "text-zinc-600"
                                    )}>{format(date, 'dd')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today Line */}
                    {timelineDates.some(d => isSameDay(d, today)) && (
                        <div
                            className="absolute top-0 bottom-0 w-[1px] bg-red-400/50 z-20 pointer-events-none"
                            style={{
                                left: `calc(200px + ${(differenceInDays(today, timelineDates[0])) * (100 / daysInView)}%)`,
                            }}
                        >
                            <div className="absolute top-0 left-[-4px] w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                        </div>
                    )}

                    {/* Gantt Rows */}
                    <div className="divide-y divide-zinc-50">
                        {tasks.length === 0 ? (
                            <div className="py-20 text-center text-zinc-400 text-sm italic">
                                Chưa có dữ liệu lịch trình cho các task.
                            </div>
                        ) : tasks.map((task) => {
                            const style = getTaskStyle(task)
                            return (
                                <div key={task.id} className="flex group hover:bg-zinc-50/30 transition-colors">
                                    <div className="w-[200px] shrink-0 p-3 border-r border-zinc-100 flex items-center bg-white z-10">
                                        <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight truncate">{task.title}</p>
                                    </div>
                                    <div className="flex-1 relative h-12 flex items-center px-0.5">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 flex">
                                            {Array.from({ length: daysInView }).map((_, i) => (
                                                <div key={i} className="flex-1 border-r border-zinc-100/30 last:border-r-0" />
                                            ))}
                                        </div>

                                        {/* Task Bar */}
                                        {style && (
                                            <div
                                                className={cn(
                                                    "absolute h-7 rounded-full shadow-sm flex items-center px-4 z-10 transition-all group-hover:shadow-md",
                                                    getStatusColor(task.status)
                                                )}
                                                style={style}
                                            >
                                                <p className={cn(
                                                    "text-[9px] font-black truncate uppercase tracking-widest",
                                                    task.status === 'completed' || task.status === 'active' || task.status === 'in_progress' ? "text-zinc-100" : "text-zinc-600"
                                                )}>
                                                    {task.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
            <div className="p-5 bg-zinc-50/30 border-t border-zinc-100 flex items-center gap-8 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Đang triển khai</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 border border-zinc-300" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Đang vướng</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-50 border border-zinc-100" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Chưa làm</span>
                </div>
            </div>
        </Card>
    )
}
