'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, CheckCircle2, AlertTriangle, Rocket } from 'lucide-react'
import type { TeamOverview } from '@/lib/supabase/services/team-performance-service'

interface TeamStatsCardsProps {
    overview: TeamOverview
}

const stats = [
    { key: 'total_members', label: 'Thành viên', icon: Users, color: 'text-blue-600' },
    { key: 'active_projects', label: 'Dự án đang làm', icon: Rocket, color: 'text-purple-600' },
    { key: 'completed_tasks', label: 'Tasks hoàn thành', icon: CheckCircle2, color: 'text-green-600' },
    { key: 'overdue_tasks', label: 'Tasks quá hạn', icon: AlertTriangle, color: 'text-red-600' },
] as const

export default function TeamStatsCards({ overview }: TeamStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(stat => {
                const Icon = stat.icon
                const value = overview[stat.key]
                return (
                    <Card key={stat.key}>
                        <CardContent className="pt-4 pb-3 px-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                                <span className="text-xs text-muted-foreground">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-bold">{value}</p>
                            {stat.key === 'completed_tasks' && (
                                <p className="text-xs text-muted-foreground">
                                    {overview.overall_completion_rate}% tổng tasks
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
