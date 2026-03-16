import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/format'
import { ROLE_LABELS } from '@/lib/constants/roles'
import { Plus, Users, TrendingUp, Trophy, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { getTeamMetrics } from '@/lib/supabase/services/user-service'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
    const teamMembers = await getTeamMetrics()

    const totalStaff = teamMembers.filter((m) => m.role !== 'accountant').length
    const totalRevenue = teamMembers.reduce((sum, m) => sum + m.revenue, 0)

    const topPerformer = teamMembers.length > 0
        ? teamMembers.reduce((top, m) => m.revenue > top.revenue ? m : top, teamMembers[0])
        : null

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Nhân sự</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý team và theo dõi hiệu suất làm việc
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/team/roles">
                            Phân quyền
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/team/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm thành viên
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng thành viên
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground">{totalStaff} nhân viên kinh doanh</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Doanh thu team
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Tổng doanh thu hợp đồng</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Top performer
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{topPerformer?.full_name || '-'}</div>
                        <p className="text-xs text-muted-foreground">{topPerformer ? formatCurrency(topPerformer.revenue) : '-'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Team Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thành viên</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thành viên</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead className="text-center">Khách hàng</TableHead>
                                <TableHead className="text-center">Hợp đồng</TableHead>
                                <TableHead>Doanh thu</TableHead>
                                <TableHead>Tiến độ target</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembers.map((member) => {
                                const progress = member.target > 0
                                    ? Math.min((member.revenue / member.target) * 100, 100)
                                    : 0

                                return (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Link href={`/team/${member.id}`} className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.avatar_url || undefined} />
                                                    <AvatarFallback className="text-xs bg-foreground text-background">
                                                        {member.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] || member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{member.customers}</TableCell>
                                        <TableCell className="text-center">{member.contracts}</TableCell>
                                        <TableCell className="font-medium">
                                            {member.revenue > 0 ? formatCurrency(member.revenue) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {member.target > 0 ? (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>{progress.toFixed(0)}%</span>
                                                        <span className="text-muted-foreground">
                                                            {formatCurrency(member.target)}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' :
                                                                progress >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                                                                }`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.is_active ? 'default' : 'secondary'}>
                                                {member.is_active ? 'Hoạt động' : 'Tạm dừng'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {teamMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Chưa có thành viên nào
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
