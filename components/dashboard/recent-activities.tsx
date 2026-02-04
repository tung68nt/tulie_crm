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
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 text-card-foreground">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-0 px-6 pb-4">
                        {data.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 py-3.5 border-b last:border-0 group transition-all"
                            >
                                <div className="mt-1 h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                                    {getActivityIcon(activity.action)}
                                </div>
                                <div className="flex-1 space-y-0.5 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-foreground">
                                            {activity.user?.full_name || 'Hệ thống'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            {formatRelativeTime(activity.created_at)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium truncate">
                                        <span className="capitalize">{activity.action}</span> {activity.entity_type} <span className="font-mono text-[10px] bg-muted px-1 rounded">#{activity.entity_id}</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 font-medium group-hover:hidden">
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

