'use client'

import { RevenueProgress } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target } from 'lucide-react'

interface RevenueProgressCardProps {
    progress: RevenueProgress
}

export default function RevenueProgressCard({ progress }: RevenueProgressCardProps) {
    const { target, actual, percentage, period_label } = progress
    const targetAmount = target?.target_amount || 0

    const getProgressColor = () => {
        if (percentage >= 100) return 'bg-emerald-500'
        if (percentage >= 75) return 'bg-blue-500'
        if (percentage >= 50) return 'bg-amber-500'
        return 'bg-rose-500'
    }

    const getProgressBg = () => {
        if (percentage >= 100) return 'bg-emerald-100'
        if (percentage >= 75) return 'bg-blue-100'
        if (percentage >= 50) return 'bg-amber-100'
        return 'bg-rose-100'
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Doanh thu — {period_label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Amount */}
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold">
                            {(actual / 1000000).toFixed(1)}M
                        </span>
                        {targetAmount > 0 && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {(targetAmount / 1000000).toFixed(1)}M
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {targetAmount > 0 ? (
                        <>
                            <div className={`w-full h-3 rounded-full ${getProgressBg()}`}>
                                <div
                                    className={`h-3 rounded-full transition-all ${getProgressColor()}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{percentage}% mục tiêu</span>
                                <span>
                                    Còn {((targetAmount - actual) / 1000000).toFixed(1)}M
                                </span>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Chưa đặt mục tiêu doanh thu cho {period_label}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
