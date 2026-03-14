'use client'

import { WorkspaceDayOverview } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Clock, CalendarDays } from 'lucide-react'

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
}

const priorityLabels: Record<string, string> = {
    urgent: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
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
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            Quá hạn ({overdue_tasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {overdue_tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-red-100">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                    {task.due_date && (
                                        <p className="text-xs text-red-600 mt-0.5">
                                            Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="outline" className={priorityColors[task.priority]}>
                                    {priorityLabels[task.priority]}
                                </Badge>
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
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
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
                                        <Badge variant="outline" className={priorityColors[task.priority]}>
                                            {priorityLabels[task.priority]}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {task.status === 'in_progress' ? 'Đang làm' :
                                             task.status === 'in_review' ? 'Review' : 'Chưa làm'}
                                        </Badge>
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
                                <Badge variant="outline" className={priorityColors[task.priority]}>
                                    {priorityLabels[task.priority]}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {totalTasks === 0 && upcoming_deadlines.length === 0 && (
                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="py-8 text-center">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
                        <p className="font-medium text-green-800">Không có task nào đang chờ</p>
                        <p className="text-sm text-green-600 mt-1">Hãy tạo task mới hoặc kiểm tra dự án</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
