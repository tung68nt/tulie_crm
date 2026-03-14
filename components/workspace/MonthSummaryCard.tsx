'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, CheckCircle2, Loader2, ListTodo } from 'lucide-react'

interface MonthSummaryCardProps {
    summary: {
        total: number
        completed: number
        in_progress: number
        todo: number
        completion_rate: number
    }
}

export default function MonthSummaryCard({ summary }: MonthSummaryCardProps) {
    const { total, completed, in_progress, todo, completion_rate } = summary

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Tháng này
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Completion Rate */}
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold">{completion_rate}%</span>
                        <span className="text-sm text-muted-foreground">{total} tasks</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-gray-100 flex overflow-hidden">
                        {completed > 0 && (
                            <div
                                className="h-3 bg-green-500 transition-all"
                                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            />
                        )}
                        {in_progress > 0 && (
                            <div
                                className="h-3 bg-blue-500 transition-all"
                                style={{ width: `${total > 0 ? (in_progress / total) * 100 : 0}%` }}
                            />
                        )}
                        {todo > 0 && (
                            <div
                                className="h-3 bg-gray-300 transition-all"
                                style={{ width: `${total > 0 ? (todo / total) * 100 : 0}%` }}
                            />
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {completed} xong
                        </span>
                        <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 text-blue-500" />
                            {in_progress} đang làm
                        </span>
                        <span className="flex items-center gap-1">
                            <ListTodo className="h-3 w-3 text-gray-400" />
                            {todo} chưa làm
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
