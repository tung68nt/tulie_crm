import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * LoadingState — Standard loading skeletons
 *
 * Provides consistent loading patterns for different content types.
 *
 * Usage:
 * ```tsx
 * <PageSkeleton />           // Full page loading
 * <CardSkeleton />           // Single card loading
 * <StatCardsSkeleton />      // Dashboard stat cards
 * <TableSkeleton rows={5} /> // Table loading
 * ```
 */

export function PageSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex flex-col gap-6', className)}>
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>
            {/* Content skeleton */}
            <CardSkeleton />
            <CardSkeleton />
        </div>
    )
}

export function CardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn(className)}>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    )
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-40 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function TableSkeleton({
    rows = 5,
    cols = 4,
    className,
}: {
    rows?: number
    cols?: number
    className?: string
}) {
    return (
        <div className={cn('border rounded-xl overflow-hidden', className)}>
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4" style={{ width: `${100 / cols}%` }} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-4 p-4 border-b last:border-0">
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <Skeleton
                            key={colIdx}
                            className="h-4"
                            style={{ width: `${Math.random() * 40 + 30}%` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
