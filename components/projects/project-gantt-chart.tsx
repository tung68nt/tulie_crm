'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, differenceInDays, startOfDay, addDays, isSameDay, isWithinInterval, differenceInMilliseconds } from 'date-fns'
import { vi } from 'date-fns/locale'
import { LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
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

    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const today = startOfDay(now)

    const todayLinePosition = useMemo(() => {
        const index = timelineDates.findIndex(d => isSameDay(d, now))
        if (index === -1) return null
        
        const h = now.getHours()
        const m = now.getMinutes()
        const s = now.getSeconds()
        const fraction = (h * 3600 + m * 60 + s) / 86400
        
        return ((index + fraction) / daysInView) * 100
    }, [now, timelineDates, daysInView])

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
            case 'completed': return 'bg-emerald-500'
            case 'in_progress': return 'bg-blue-500'
            case 'blocked': return 'bg-red-500'
            default: return 'bg-zinc-400'
        }
    }

    return (
        <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-xl">
            <div className="p-6 border-b border-zinc-100 flex flex-row items-center justify-between bg-white/50 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-zinc-900" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Lộ trình triển khai (Gantt View)</h3>
                            <p className="text-[11px] font-medium text-muted-foreground">Visual Project Timeline</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setViewDate(addDays(viewDate, -7))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold" onClick={() => setViewDate(today)}>
                        Hôm nay
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => setViewDate(addDays(viewDate, 7))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <CardContent className="p-0 overflow-auto custom-scrollbar max-h-[650px]">
                <div className="min-w-[1200px] relative">
                    {/* Gantt Header - Days */}
                    <div className="flex border-b border-zinc-100 bg-zinc-50 sticky top-0 z-40">
                        <div className="w-[240px] shrink-0 p-3 border-r border-zinc-100 text-[11px] font-semibold text-muted-foreground flex items-center bg-zinc-50 sticky left-0 z-50">
                            Đầu việc
                        </div>
                        <div className="flex-1 flex relative bg-zinc-50">
                            {/* Today Line - Moved inside the flex-1 date container to fix alignment */}
                            {todayLinePosition !== null && (
                                <div
                                    className="absolute top-0 bottom-[-1000px] w-[1px] bg-red-400 z-50 pointer-events-none"
                                    style={{
                                        left: `${todayLinePosition}%`,
                                    }}
                                >
                                    <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 rounded-full bg-red-500 shadow-md border-[2px] border-white ring-2 ring-red-500/20" />
                                </div>
                            )}

                            {timelineDates.map((date, i) => {
                                const dayOfWeek = format(date, 'i');
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex-1 p-2 text-center border-r border-zinc-100/50 last:border-r-0 flex flex-col items-center justify-center min-h-[55px] min-w-[45px] gap-0.5",
                                            isSameDay(date, today) && "bg-zinc-100/30 font-bold"
                                        )}
                                    >
                                        <p className="text-[10px] font-semibold text-muted-foreground tracking-tight whitespace-nowrap">
                                            {dayOfWeek === '7' ? 'CN' : `Thứ ${Number(dayOfWeek) + 1}`}
                                        </p>
                                        <p className={cn(
                                            "text-[12px] font-bold leading-none",
                                            isSameDay(date, today) ? "text-red-500" : "text-zinc-600"
                                        )}>
                                            {format(date, 'dd')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {/* Gantt Rows */}
                    <div className="divide-y divide-zinc-50 bg-white">
                        {tasks.length === 0 ? (
                            <div className="py-20 text-center text-zinc-400 text-sm italic">
                                Chưa có dữ liệu lịch trình cho các task.
                            </div>
                        ) : tasks.map((task) => {
                            const style = getTaskStyle(task)
                            return (
                                <div key={task.id} className="flex group hover:bg-zinc-50/30 transition-colors">
                                    <div className="w-[240px] shrink-0 p-3 border-r border-zinc-100 flex items-center bg-white sticky left-0 z-30 group-hover:bg-zinc-50/30 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                        <p className="text-[11px] font-semibold text-zinc-900 leading-tight">{task.title}</p>
                                    </div>
                                    <div className="flex-1 relative h-12 flex items-center px-0.5">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 flex">
                                            {Array.from({ length: daysInView }).map((_, i) => (
                                                <div key={i} className="flex-1 border-r border-zinc-100/30 last:border-r-0 min-w-[45px]" />
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
                                                    "text-[9px] font-semibold truncate tracking-tight",
                                                    task.status === 'completed' || task.status === 'active' || task.status === 'in_progress' ? "text-white" : "text-zinc-100"
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
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-zinc-500">Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-semibold text-zinc-500">Đang triển khai</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[11px] font-semibold text-zinc-500">Đang vướng</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    <span className="text-[11px] font-semibold text-zinc-500">Chưa làm</span>
                </div>
            </div>
        </Card>
    )
}
