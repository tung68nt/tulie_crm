import { cn } from '@/lib/utils'

/**
 * LoadingSpinner — Standard CSS border spinner
 *
 * Design system standard: border-3, animate-spin 0.6s
 * MUST be used instead of Loader2 icon for all loading states.
 *
 * Usage:
 * ```tsx
 * <LoadingSpinner />                    // Default 24px
 * <LoadingSpinner size="sm" />          // 16px — inline/button
 * <LoadingSpinner size="lg" />          // 32px — page loading
 * <LoadingSpinner label="Đang tải..." /> // With label
 * ```
 */

const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-[3px]',
    lg: 'h-8 w-8 border-[3px]',
} as const

export function LoadingSpinner({
    size = 'md',
    className,
    label,
}: {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    label?: string
}) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)} role="status">
            <span
                className={cn(
                    sizeMap[size],
                    'inline-block rounded-full border-zinc-200 border-t-zinc-900 animate-spin',
                )}
                style={{ animationDuration: '0.6s' }}
            />
            {label && <span className="text-sm text-muted-foreground">{label}</span>}
            <span className="sr-only">{label || 'Đang tải'}</span>
        </span>
    )
}
