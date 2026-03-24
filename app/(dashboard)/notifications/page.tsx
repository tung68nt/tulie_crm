import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, CheckCircle, Clock, UserMinus, TrendingDown, ChevronRight, UserPlus, FileText, CheckCircle2, CreditCard, Trophy, XCircle, ClipboardList, Eye, LayoutGrid, BellRing } from 'lucide-react'
import Link from 'next/link'
import { getSystemAlerts } from '@/lib/supabase/services/alerts-service'
import { AlertItem, NotificationType } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { getMergedNotifications, markAllAsRead } from '@/lib/supabase/services/notification-service'
import { MarkAllReadButton } from './mark-all-read-button'

const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
        case 'inactive_customer':
            return <UserMinus className="h-5 w-5" />
        case 'overdue_invoice':
            return <Clock className="h-5 w-5" />
        case 'contract_expiry':
            return <AlertTriangle className="h-5 w-5" />
        case 'low_margin':
            return <TrendingDown className="h-5 w-5" />
    }
}

const getSeverityColors = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return 'bg-rose-500/10 text-rose-600 border-red-500/20'
        case 'warning':
            return 'bg-amber-500/10 text-yellow-600 border-yellow-500/20'
        case 'info':
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }
}

const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return <Badge variant="destructive">Khẩn cấp</Badge>
        case 'warning':
            return <Badge className="bg-amber-500 hover:bg-yellow-600">Cảnh báo</Badge>
        case 'info':
            return <Badge variant="secondary">Thông tin</Badge>
    }
}

const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
        case 'new_customer': return <UserPlus className="h-5 w-5" />
        case 'quotation_accepted': return <CheckCircle2 className="h-5 w-5" />
        case 'quotation_viewed': return <Eye className="h-5 w-5" />
        case 'quotation_rejected': return <XCircle className="h-5 w-5" />
        case 'quotation_sent': return <FileText className="h-5 w-5" />
        case 'invoice_overdue': return <AlertTriangle className="h-5 w-5" />
        case 'contract_signed': return <FileText className="h-5 w-5" />
        case 'payment_received': return <CreditCard className="h-5 w-5" />
        case 'deal_won': return <Trophy className="h-5 w-5" />
        case 'deal_lost': return <XCircle className="h-5 w-5" />
        case 'task_assigned': return <ClipboardList className="h-5 w-5" />
        case 'task_overdue': return <BellRing className="h-5 w-5" />
        case 'task_completed': return <CheckCircle className="h-5 w-5" />
        case 'workspace': return <LayoutGrid className="h-5 w-5" />
        default: return <Bell className="h-5 w-5" />
    }
}

const getNotifSeverityColor = (severity?: string, read?: boolean) => {
    if (read) return 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-zinc-200 dark:border-zinc-800'
    switch (severity) {
        case 'success': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        case 'error': return 'bg-red-500/10 text-red-600 border-red-500/20'
        default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

export default async function NotificationsPage() {
    const [alerts, supabase] = await Promise.all([
        getSystemAlerts(),
        createClient(),
    ])

    const { data: { user } } = await supabase.auth.getUser()
    const notifications = user ? await getMergedNotifications(user.id, 50) : []
    const unreadNotifs = notifications.filter(n => !n.read)

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Thông báo</h1>
                        <p className="text-muted-foreground">Theo dõi hoạt động hệ thống và các sự kiện quan trọng</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(alerts.length > 0 || unreadNotifs.length > 0) && (
                        <Badge variant="outline" className="font-medium">
                            {unreadNotifs.length + alerts.length} cần xử lý
                        </Badge>
                    )}
                    {user && unreadNotifs.length > 0 && (
                        <MarkAllReadButton userId={user.id} />
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${alerts.filter(a => a.severity === 'danger').length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-emerald-600'}`}>
                                {alerts.filter(a => a.severity === 'danger').length > 0 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Khẩn cấp</p>
                                <p className="text-2xl font-semibold">{alerts.filter(a => a.severity === 'danger').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${alerts.filter(a => a.severity === 'warning').length > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-emerald-600'}`}>
                                {alerts.filter(a => a.severity === 'warning').length > 0 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cảnh báo</p>
                                <p className="text-2xl font-semibold">{alerts.filter(a => a.severity === 'warning').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Chưa đọc</p>
                                <p className="text-2xl font-semibold">{unreadNotifs.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                                <p className="text-2xl font-semibold">{notifications.length + alerts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts */}
            {alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Cảnh báo hệ thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={alert.link}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getSeverityColors(alert.severity)}`}
                                >
                                    <div className="shrink-0">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">{alert.title}</p>
                                            {getSeverityBadge(alert.severity)}
                                        </div>
                                        <p className="text-sm opacity-80">{alert.message}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 shrink-0 opacity-50" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Hoạt động gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-lg font-semibold">Không có thông báo mới!</h3>
                            <p className="text-muted-foreground">Tất cả hoạt động đã được xem qua.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.link || '#'}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${getNotifSeverityColor(notification.severity, notification.read)}`}
                                >
                                    <div className="shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`font-semibold text-sm ${notification.read ? 'text-zinc-500' : ''}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                            {notification.source === 'workspace' && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Workspace</Badge>
                                            )}
                                        </div>
                                        <p className={`text-sm ${notification.read ? 'text-muted-foreground/60' : 'opacity-80'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 shrink-0 opacity-50" />
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
