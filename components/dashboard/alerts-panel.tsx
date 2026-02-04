import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    AlertTriangle,
    Clock,
    UserMinus,
    TrendingDown,
    ChevronRight,
    CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { getSystemAlerts, AlertItem } from '@/lib/supabase/services/alerts-service'

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

export async function AlertsPanel() {
    const alerts = await getSystemAlerts()

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Cảnh báo hệ thống
                </CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider px-2" asChild>
                    <Link href="/notifications">Xem tất cả</Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                    <div className="space-y-2 px-6 pb-4">
                        {alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                                <p className="text-sm font-medium">Hệ thống hoạt động tốt</p>
                                <p className="text-xs text-muted-foreground">Không có cảnh báo nào cần xử lý</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={alert.link}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getSeverityColors(alert.severity)}`}
                                >
                                    <div className="shrink-0 h-8 w-8 rounded-full bg-background/50 flex items-center justify-center border border-current opacity-20">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">
                                            {alert.title}
                                        </p>
                                        <p className="text-[11px] opacity-70 truncate mt-0.5">
                                            {alert.message}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-3 w-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
