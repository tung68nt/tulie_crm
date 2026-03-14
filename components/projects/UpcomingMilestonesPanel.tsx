'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Milestone } from 'lucide-react'
import Link from 'next/link'

interface UpcomingMilestonesPanelProps {
    milestones: any[]
}

export default function UpcomingMilestonesPanel({ milestones }: UpcomingMilestonesPanelProps) {
    const getDaysUntil = (dueDate: string) => {
        const diff = new Date(dueDate).getTime() - Date.now()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Milestone className="h-4 w-4 text-purple-600" />
                    Milestones sắp đến hạn
                    {milestones.length > 0 && (
                        <Badge variant="secondary">{milestones.length}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {milestones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Không có milestone nào trong 30 ngày tới
                    </p>
                ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {milestones.map((ms: any) => {
                            const days = getDaysUntil(ms.due_date)
                            const isUrgent = days <= 3
                            return (
                                <Link
                                    key={ms.id}
                                    href={ms.project?.id ? `/projects/${ms.project.id}` : '/projects'}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:opacity-80 ${
                                        isUrgent ? 'bg-red-50/50 border-red-100' : 'bg-purple-50/30 border-purple-100'
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{ms.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ms.project?.title || ''}
                                            {ms.amount > 0 && ` — ${(ms.amount).toLocaleString('vi-VN')}₫`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className={`text-xs ${isUrgent ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                            {days <= 0 ? 'Hôm nay' : `${days} ngày`}
                                        </span>
                                        <Badge variant="outline" className={`text-xs ${
                                            ms.type === 'payment' ? 'border-green-300 text-green-700' :
                                            ms.type === 'delivery' ? 'border-blue-300 text-blue-700' :
                                            'border-gray-300'
                                        }`}>
                                            {ms.type === 'payment' ? 'Thanh toán' : ms.type === 'delivery' ? 'Bàn giao' : 'Công việc'}
                                        </Badge>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
