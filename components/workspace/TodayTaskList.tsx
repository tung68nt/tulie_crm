'use client'

import { WorkspaceDayOverview } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertTriangle, CheckCircle2, Clock, CalendarDays } from 'lucide-react'

const priorityLabels: Record<string, string> = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
}

const statusLabels: Record<string, string> = {
    in_progress: 'Đang làm',
    in_review: 'Review',
    todo: 'Chưa làm',
}

interface TodayTaskListProps {
    overview: WorkspaceDayOverview
}

export default function TodayTaskList({ overview }: TodayTaskListProps) {
    const { today_tasks, overdue_tasks, upcoming_deadlines } = overview
    const totalTasks = today_tasks.length + overdue_tasks.length

    return (
        <div className="space-y-4">
            {/* Overdue Tasks */}
            {overdue_tasks.length > 0 && (
                <Card className="border-rose-200 bg-rose-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-rose-700">
                            <AlertTriangle className="h-4 w-4" />
                            Quá hạn ({overdue_tasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {overdue_tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-rose-100">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                    {task.due_date && (
                                        <p className="text-xs text-rose-600 mt-0.5">
                                            Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                                <StatusBadge status={task.priority} entityType="ticket_priority" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Today's Tasks */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Việc hôm nay ({today_tasks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {today_tasks.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                            <p className="text-sm">Không có task hôm nay. Tuyệt vời!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {today_tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{task.title}</p>
                                        {task.project && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Dự án: {(task.project as any).title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={task.priority} entityType="ticket_priority" />
                                        <StatusBadge status={task.status} entityType="project" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            {upcoming_deadlines.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-amber-600" />
                            Sắp đến hạn ({upcoming_deadlines.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {upcoming_deadlines.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                    {task.due_date && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                                <StatusBadge status={task.priority} entityType="ticket_priority" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {totalTasks === 0 && upcoming_deadlines.length === 0 && (
                <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="py-8 text-center">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                        <p className="font-medium text-emerald-800">Không có task nào đang chờ</p>
                        <p className="text-sm text-emerald-600 mt-1">Hãy tạo task mới hoặc kiểm tra dự án</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
