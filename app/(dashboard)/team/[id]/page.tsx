import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils/format'
import { ROLE_LABELS } from '@/lib/constants/roles'
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Calendar,
    Target,
    TrendingUp
} from 'lucide-react'

// Mock data
const mockMember = {
    id: 'user-1',
    full_name: 'Sarah Nguyen',
    email: 'sarah@tulie.agency',
    phone: '0901234567',
    role: 'staff' as const,
    avatar_url: null,
    is_active: true,
    joined_at: '2024-03-15',
    stats: {
        customers: 15,
        contracts: 8,
        quotations: 25,
        revenue: 450000000,
        target: 500000000,
        conversion_rate: 32,
    },
    recent_activities: [
        { id: '1', description: 'Tạo báo giá QT-2026-0142', date: '2026-01-05' },
        { id: '2', description: 'Chốt hợp đồng HD-2026-0089', date: '2026-01-09' },
        { id: '3', description: 'Thêm khách hàng mới ABC Corp', date: '2026-01-03' },
    ],
}

export default function TeamMemberDetailPage() {
    const member = mockMember
    const progress = (member.stats.revenue / member.stats.target) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/team">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-xl bg-foreground text-background">
                                {member.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">{member.full_name}</h1>
                                <Badge variant={member.is_active ? 'default' : 'secondary'}>
                                    {member.is_active ? 'Hoạt động' : 'Tạm dừng'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{ROLE_LABELS[member.role]}</p>
                        </div>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/team/${member.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance */}
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Khách hàng</p>
                                <p className="text-2xl font-bold">{member.stats.customers}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Hợp đồng</p>
                                <p className="text-2xl font-bold">{member.stats.contracts}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Báo giá</p>
                                <p className="text-2xl font-bold">{member.stats.quotations}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</p>
                                <p className="text-2xl font-bold">{member.stats.conversion_rate}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Target Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Tiến độ target năm 2026
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-bold">{formatCurrency(member.stats.revenue)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        / {formatCurrency(member.stats.target)} target
                                    </p>
                                </div>
                                <div className={`text-2xl font-bold ${progress >= 100 ? 'text-green-500' : ''}`}>
                                    {progress.toFixed(0)}%
                                </div>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' :
                                            progress >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Hoạt động gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {member.recent_activities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <p className="font-medium">{activity.description}</p>
                                    <span className="text-sm text-muted-foreground">{activity.date}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin liên hệ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <a href={`mailto:${member.email}`} className="font-medium hover:underline">
                                        {member.email}
                                    </a>
                                </div>
                            </div>
                            {member.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Điện thoại</p>
                                        <a href={`tel:${member.phone}`} className="font-medium hover:underline">
                                            {member.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày gia nhập</p>
                                    <p className="font-medium">{member.joined_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
