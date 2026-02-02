'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    AlertTriangle,
    Clock,
    UserMinus,
    TrendingDown,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface AlertItem {
    id: string
    type: 'inactive_customer' | 'overdue_invoice' | 'contract_expiry' | 'low_margin'
    title: string
    message: string
    severity: 'warning' | 'danger' | 'info'
    link: string
}

const mockAlerts: AlertItem[] = [
    {
        id: '1',
        type: 'inactive_customer',
        title: '3 khách hàng không tương tác',
        message: 'Đã hơn 30 ngày chưa liên hệ',
        severity: 'warning',
        link: '/customers?status=inactive',
    },
    {
        id: '2',
        type: 'overdue_invoice',
        title: '2 hóa đơn quá hạn',
        message: 'Tổng giá trị: 45.000.000đ',
        severity: 'danger',
        link: '/invoices?status=overdue',
    },
    {
        id: '3',
        type: 'contract_expiry',
        title: '1 hợp đồng sắp hết hạn',
        message: 'HD-2026-0078 hết hạn trong 7 ngày',
        severity: 'warning',
        link: '/contracts?expiring=true',
    },
    {
        id: '4',
        type: 'low_margin',
        title: '1 deal có margin thấp',
        message: 'QT-2026-0165 chỉ có margin 8%',
        severity: 'info',
        link: '/quotations/qt-2026-0165',
    },
]

const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
        case 'inactive_customer':
            return <UserMinus className="h-4 w-4" />
        case 'overdue_invoice':
            return <Clock className="h-4 w-4" />
        case 'contract_expiry':
            return <AlertTriangle className="h-4 w-4" />
        case 'low_margin':
            return <TrendingDown className="h-4 w-4" />
    }
}

const getSeverityColors = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return 'bg-red-500/10 text-red-500 border-red-500/20'
        case 'warning':
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        case 'info':
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
}

export function AlertsPanel() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Cảnh báo
                </CardTitle>
                <Button variant="ghost" size="sm">
                    Xem tất cả
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-2 px-6 pb-4">
                        {mockAlerts.map((alert) => (
                            <Link
                                key={alert.id}
                                href={alert.link}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-accent ${getSeverityColors(alert.severity)}`}
                            >
                                <div className="shrink-0">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {alert.title}
                                    </p>
                                    <p className="text-xs opacity-80 truncate">
                                        {alert.message}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
