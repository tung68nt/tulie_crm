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

interface Activity {
    id: string
    type: 'customer_added' | 'quotation_sent' | 'quotation_viewed' | 'quotation_accepted' | 'quotation_rejected' | 'contract_signed' | 'payment_received'
    title: string
    description: string
    created_at: string
}

const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'quotation_accepted',
        title: 'Báo giá được chấp nhận',
        description: 'ABC Corp đã chấp nhận báo giá QT-2026-0142',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: '2',
        type: 'customer_added',
        title: 'Khách hàng mới',
        description: 'XYZ Limited được thêm bởi Nguyễn Văn A',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: '3',
        type: 'payment_received',
        title: 'Đã nhận thanh toán',
        description: 'Nhận 50.000.000đ từ DEF Industries',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
        id: '4',
        type: 'contract_signed',
        title: 'Hợp đồng ký kết',
        description: 'HD-2026-0089 được ký với GHI Company',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: '5',
        type: 'quotation_viewed',
        title: 'Báo giá được xem',
        description: 'JKL Partners đã xem báo giá QT-2026-0156',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
]

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'customer_added':
            return <UserPlus className="h-4 w-4 text-blue-500" />
        case 'quotation_sent':
            return <FileText className="h-4 w-4 text-indigo-500" />
        case 'quotation_viewed':
            return <Eye className="h-4 w-4 text-cyan-500" />
        case 'quotation_accepted':
            return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'quotation_rejected':
            return <XCircle className="h-4 w-4 text-red-500" />
        case 'contract_signed':
            return <FileCheck className="h-4 w-4 text-purple-500" />
        case 'payment_received':
            return <CreditCard className="h-4 w-4 text-green-500" />
    }
}

export function RecentActivities() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-1 px-6 pb-4">
                        {mockActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 py-3 border-b last:border-0"
                            >
                                <div className="mt-0.5">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.description}
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
