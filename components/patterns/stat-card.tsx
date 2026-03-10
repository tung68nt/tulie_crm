import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * StatCard — Dashboard stat card following shadcn/ui Dashboard example
 *
 * Structure (from shadcn screenshot):
 * ┌─────────────────────────────────────┐
 * │ Card Title           Trend (+12.5%) │
 * │ $1,250.00                           │ ← stat value
 * │ Trending up this month              │ ← description
 * │ Visitors for the last 6 months      │ ← footer text
 * └─────────────────────────────────────┘
 *
 * Usage:
 * ```tsx
 * <StatCard
 *   title="Tổng doanh thu"
 *   value="1.250.000.000 ₫"
 *   trend="+12.5%"
 *   trendUp
 *   description="Tăng trưởng so với tháng trước"
 *   footer="Dữ liệu 6 tháng gần nhất"
 * />
 * ```
 */

interface StatCardProps {
    title: string
    value: string | number
    trend?: string
    trendUp?: boolean
    description?: string
    footer?: string
    icon?: React.ReactNode
    className?: string
}

export function StatCard({
    title,
    value,
    trend,
    trendUp,
    description,
    footer,
    icon,
    className,
}: StatCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">
                        {title}
                    </CardDescription>
                    {trend && (
                        <span
                            className={cn(
                                'text-xs font-medium',
                                trendUp ? 'text-foreground' : 'text-muted-foreground'
                            )}
                        >
                            {trend}
                        </span>
                    )}
                    {icon && !trend && (
                        <div className="text-muted-foreground">{icon}</div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {footer && (
                    <p className="text-xs text-muted-foreground mt-1">{footer}</p>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * StatGrid — Grid container for stat cards
 *
 * Usage:
 * ```tsx
 * <StatGrid>
 *   <StatCard title="Revenue" value="$1,250" />
 *   <StatCard title="Users" value="1,234" />
 *   <StatCard title="Active" value="45,678" />
 *   <StatCard title="Growth" value="4.5%" />
 * </StatGrid>
 * ```
 */

export function StatGrid({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
            {children}
        </div>
    )
}
