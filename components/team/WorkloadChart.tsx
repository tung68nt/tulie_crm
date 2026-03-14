'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface WorkloadItem {
    user_id: string
    full_name: string
    role: string
    active_tasks: number
}

interface WorkloadChartProps {
    workload: WorkloadItem[]
}

export default function WorkloadChart({ workload }: WorkloadChartProps) {
    const maxTasks = Math.max(...workload.map(w => w.active_tasks), 1)

    const getBarColor = (tasks: number) => {
        if (tasks > 10) return 'bg-red-500' // overloaded
        if (tasks > 5) return 'bg-amber-500' // busy
        if (tasks > 0) return 'bg-blue-500' // healthy
        return 'bg-gray-300' // idle
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Khối lượng công việc
                </CardTitle>
            </CardHeader>
            <CardContent>
                {workload.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
                ) : (
                    <div className="space-y-3">
                        {workload.map(item => (
                            <div key={item.user_id}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium truncate max-w-[150px]">{item.full_name}</span>
                                    <span className="text-xs text-muted-foreground">{item.active_tasks} tasks</span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-gray-100">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${getBarColor(item.active_tasks)}`}
                                        style={{ width: `${Math.min((item.active_tasks / maxTasks) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 pt-2 border-t text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-blue-500" /> Bình thường
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-amber-500" /> Bận
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-500" /> Quá tải
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
