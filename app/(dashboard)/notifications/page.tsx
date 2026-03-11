import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, CheckCircle, Clock, UserMinus, TrendingDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getSystemAlerts } from '@/lib/supabase/services/alerts-service'
import { AlertItem } from '@/types'

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
            return 'bg-red-500/10 text-red-600 border-red-500/20'
        case 'warning':
            return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
        case 'info':
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }
}

const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return <Badge variant="destructive">Khẩn cấp</Badge>
        case 'warning':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600">Cảnh báo</Badge>
        case 'info':
            return <Badge variant="secondary">Thông tin</Badge>
    }
}

export default async function NotificationsPage() {
    const alerts = await getSystemAlerts()

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Thông báo</h1>
                        <p className="text-muted-foreground">Theo dõi tình trạng hệ thống và các thông báo quan trọng</p>
                    </div>
                </div>
                {alerts.length > 0 && (
                    <Badge variant="outline" className="font-medium">
                        {alerts.length} cảnh báo cần xử lý
                    </Badge>
                )}
            </div>

            {/* System Health Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${alerts.filter(a => a.severity === 'danger').length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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
                            <div className={`p-3 rounded-full ${alerts.filter(a => a.severity === 'warning').length > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
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
                                <p className="text-sm text-muted-foreground">Thông tin</p>
                                <p className="text-2xl font-semibold">{alerts.filter(a => a.severity === 'info').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách cảnh báo</CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-lg font-semibold">Hệ thống hoạt động tốt!</h3>
                            <p className="text-muted-foreground">Không có cảnh báo nào cần xử lý. Tất cả các chỉ số đều trong giới hạn bình thường.</p>
                        </div>
                    ) : (
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
