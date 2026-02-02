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
import { Plus, Users, TrendingUp, Target, Trophy } from 'lucide-react'
import Link from 'next/link'

// Mock data
const teamMembers = [
    {
        id: 'user-1',
        full_name: 'Sarah Nguyen',
        email: 'sarah@tulie.agency',
        role: 'staff' as const,
        avatar_url: null,
        customers: 15,
        contracts: 8,
        revenue: 450000000,
        target: 500000000,
        is_active: true,
    },
    {
        id: 'user-2',
        full_name: 'Mike Tran',
        email: 'mike@tulie.agency',
        role: 'staff' as const,
        avatar_url: null,
        customers: 12,
        contracts: 6,
        revenue: 320000000,
        target: 400000000,
        is_active: true,
    },
    {
        id: 'user-3',
        full_name: 'Anna Le',
        email: 'anna@tulie.agency',
        role: 'accountant' as const,
        avatar_url: null,
        customers: 0,
        contracts: 0,
        revenue: 0,
        target: 0,
        is_active: true,
    },
    {
        id: 'admin',
        full_name: 'Tulie Admin',
        email: 'admin@tulie.agency',
        role: 'admin' as const,
        avatar_url: null,
        customers: 5,
        contracts: 10,
        revenue: 680000000,
        target: 600000000,
        is_active: true,
    },
]

export default function TeamPage() {
    const totalStaff = teamMembers.filter((m) => m.role !== 'accountant').length
    const totalRevenue = teamMembers.reduce((sum, m) => sum + m.revenue, 0)
    const topPerformer = teamMembers.reduce((top, m) =>
        m.revenue > top.revenue ? m : top, teamMembers[0]
    )

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Nhân sự</h1>
                    <p className="text-muted-foreground">
                        Quản lý team và theo dõi hiệu suất làm việc
                    </p>
                </div>
                <Button asChild>
                    <Link href="/team/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm thành viên
                    </Link>
                </Button>
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
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
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
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Trong năm 2026</p>
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
                        <div className="text-2xl font-bold">{topPerformer.full_name}</div>
                        <p className="text-xs text-muted-foreground">{formatCurrency(topPerformer.revenue)}</p>
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
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.avatar_url || undefined} />
                                                    <AvatarFallback className="text-xs bg-foreground text-background">
                                                        {member.full_name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {ROLE_LABELS[member.role]}
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
                                                            className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' :
                                                                    progress >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
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
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
