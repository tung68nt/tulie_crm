import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: React.ReactNode
    className?: string
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    className,
}: StatsCardProps) {
    const isPositive = change && change > 0
    const isNegative = change && change < 0

    return (
        <Card className={cn('overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/70">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {change !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold transition-colors",
                            isPositive ? "bg-green-500/10 text-green-600" :
                                isNegative ? "bg-red-500/10 text-red-600" :
                                    "bg-muted text-muted-foreground"
                        )}>
                            {isPositive && <ArrowUp className="h-3 w-3" />}
                            {isNegative && <ArrowDown className="h-3 w-3" />}
                            {Math.abs(change).toFixed(1)}%
                        </div>
                        {changeLabel && (
                            <span className="text-xs text-muted-foreground font-medium">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
