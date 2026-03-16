'use client'

import { WorkspaceAlert } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, FileWarning, FolderSearch, Receipt, Milestone } from 'lucide-react'
import Link from 'next/link'

const alertIcons: Record<string, typeof AlertTriangle> = {
    overdue_task: AlertTriangle,
    stale_proposal: FileWarning,
    unchecked_project: FolderSearch,
    pending_invoice: Receipt,
    missed_milestone: Milestone,
}

const severityStyles: Record<string, string> = {
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
}

interface AlertPanelProps {
    alerts: WorkspaceAlert[]
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Cảnh báo & Nhắc nhở ({alerts.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {alerts.map(alert => {
                        const Icon = alertIcons[alert.type] || AlertTriangle
                        return (
                            <Link
                                key={alert.id}
                                href={alert.link || '#'}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:opacity-80 ${severityStyles[alert.severity]}`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium">{alert.title}</p>
                                    <p className="text-xs opacity-80 truncate">{alert.message}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
