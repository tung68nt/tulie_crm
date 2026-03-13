import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils/format'
import { ROLE_LABELS } from '@/lib/constants/roles'
import { getUserById } from '@/lib/supabase/services/user-service'
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Calendar,
    Target,
    TrendingUp,
    User as UserIcon
} from 'lucide-react'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function TeamMemberDetailPage({ params }: PageProps) {
    const { id } = await params
    const member = await getUserById(id)

    if (!member) {
        notFound()
    }

    // placeholder stats for simulation
    const stats = {
        customers: 0,
        contracts: 0,
        quotations: 0,
        revenue: 0,
        target: 500000000,
        conversion_rate: 0,
    }

    const progress = (stats.revenue / stats.target) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/team">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={member.avatar_url || ''} />
                            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                {member.full_name?.split(' ').map(n => n[0]).join('') || <UserIcon className="h-8 w-8" />}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
                                <Badge variant={member.is_active ? 'default' : 'secondary'} className="rounded-full px-3">
                                    {member.is_active ? 'Hoạt động' : 'Tạm dừng'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground font-medium">{ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] || member.role}</p>
                        </div>
                    </div>
                </div>
                <Button variant="outline" asChild className="rounded-xl">
                    <Link href={`/team/${member.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Metrics */}
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Card className="rounded-xl shadow-sm border-zinc-200">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Khách hàng</p>
                                <p className="text-2xl font-bold">{stats.customers}</p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border-zinc-200">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hợp đồng</p>
                                <p className="text-2xl font-bold">{stats.contracts}</p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border-zinc-200">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Báo giá</p>
                                <p className="text-2xl font-bold">{stats.quotations}</p>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl shadow-sm border-zinc-200">
                            <CardContent className="pt-6">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tỷ lệ chốt</p>
                                <p className="text-2xl font-bold">{stats.conversion_rate}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Target Progress */}
                    <Card className="rounded-xl shadow-sm border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Target className="h-5 w-5 text-primary" />
                                Mục tiêu doanh số năm 2026
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.revenue)}</p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Đã đạt được / {formatCurrency(stats.target)} mục tiêu
                                    </p>
                                </div>
                                <div className={`text-2xl font-bold tabular-nums ${progress >= 100 ? 'text-emerald-600' : 'text-primary'}`}>
                                    {progress.toFixed(0)}%
                                </div>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-3 rounded-full bg-zinc-100" />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                Doanh số được tính dựa trên các hợp đồng đã ký và duyệt thanh toán.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card className="rounded-xl shadow-sm border-zinc-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Hoạt động gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-50">
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Chưa có hoạt động nào được ghi nhận gần đây.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card className="rounded-xl shadow-sm border-zinc-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Thông tin liên hệ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-md bg-muted/50">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                                    <a href={`mailto:${member.email}`} className="text-sm font-bold hover:underline underline-offset-4 text-zinc-900 break-all">
                                        {member.email}
                                    </a>
                                </div>
                            </div>
                            {member.phone && (
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 rounded-md bg-muted/50">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Điện thoại</p>
                                        <a href={`tel:${member.phone}`} className="text-sm font-bold hover:underline underline-offset-4 text-zinc-900">
                                            {member.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-1.5 rounded-md bg-muted/50">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày gia nhập</p>
                                    <p className="text-sm font-bold text-zinc-900">
                                        {member.created_at ? new Date(member.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
