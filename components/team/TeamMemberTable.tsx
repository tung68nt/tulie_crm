'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRoleDisplayName } from '@/lib/security/permissions'
import { ROLE_COLORS } from '@/lib/constants/roles'
import type { TeamMemberPerformance } from '@/lib/supabase/services/team-performance-service'
import type { UserRole } from '@/types'

interface TeamMemberTableProps {
    members: TeamMemberPerformance[]
}

export default function TeamMemberTable({ members }: TeamMemberTableProps) {
    const getProgressColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500'
        if (rate >= 50) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Hiệu suất từng thành viên</CardTitle>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có dữ liệu
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 font-medium">Thành viên</th>
                                    <th className="pb-2 font-medium text-center">Tasks</th>
                                    <th className="pb-2 font-medium text-center">Hoàn thành</th>
                                    <th className="pb-2 font-medium text-center">Quá hạn</th>
                                    <th className="pb-2 font-medium text-center">Dự án</th>
                                    <th className="pb-2 font-medium">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => (
                                    <tr key={member.user.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="py-2.5 pr-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                    {member.user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{member.user.full_name}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] h-4 px-1 ${ROLE_COLORS[member.user.role as UserRole] || ''}`}
                                                    >
                                                        {getRoleDisplayName(member.user.role as UserRole)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 text-center">{member.tasks_total}</td>
                                        <td className="py-2.5 text-center text-green-700 font-medium">{member.tasks_completed}</td>
                                        <td className="py-2.5 text-center">
                                            {member.tasks_overdue > 0 ? (
                                                <span className="text-red-700 font-medium">{member.tasks_overdue}</span>
                                            ) : (
                                                <span className="text-muted-foreground">0</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 text-center">{member.projects_active}</td>
                                        <td className="py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 rounded-full bg-gray-100">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(member.completion_rate)}`}
                                                        style={{ width: `${Math.min(member.completion_rate, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium w-8">{member.completion_rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
