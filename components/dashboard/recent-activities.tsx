'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatRelativeTime } from '@/lib/utils/format'
import {
    UserPlus,
    FileText,
    FileCheck,
    CreditCard,
    Eye,
    CheckCircle,
    XCircle
} from 'lucide-react'

import { ActivityLog } from '@/types'

interface RecentActivitiesProps {
    data: ActivityLog[]
}

const getActivityIcon = (type: ActivityLog['action']) => {
    switch (type) {
        case 'create':
            return <UserPlus className="h-4 w-4 text-blue-500" />
        case 'update':
            return <FileCheck className="h-4 w-4 text-purple-500" />
        case 'delete':
            return <XCircle className="h-4 w-4 text-red-500" />
        case 'status_change':
            return <CheckCircle className="h-4 w-4 text-green-500" />
        default:
            return <FileText className="h-4 w-4 text-indigo-500" />
    }
}

export function RecentActivities({ data }: RecentActivitiesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-1 px-6 pb-4">
                        {data.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 py-3 border-b last:border-0"
                            >
                                <div className="mt-0.5">
                                    {getActivityIcon(activity.action)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.user?.full_name || 'Hệ thống'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.action} {activity.entity_type} #{activity.entity_id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(activity.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

