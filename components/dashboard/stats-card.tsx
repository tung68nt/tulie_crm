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
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                        {isPositive && (
                            <>
                                <ArrowUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-500">+{change.toFixed(1)}%</span>
                            </>
                        )}
                        {isNegative && (
                            <>
                                <ArrowDown className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-500">{change.toFixed(1)}%</span>
                            </>
                        )}
                        {change === 0 && (
                            <span className="text-sm text-muted-foreground">0%</span>
                        )}
                        {changeLabel && (
                            <span className="text-sm text-muted-foreground ml-1">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
