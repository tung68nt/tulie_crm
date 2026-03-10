import { cn } from '@/lib/utils'

/**
 * EmptyState — Standard empty/no-data display
 *
 * Based on shadcn/ui patterns — clean, centered, with optional icon and action.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={FileX}
 *   title="Chưa có dữ liệu"
 *   description="Bắt đầu bằng cách tạo mục đầu tiên."
 * >
 *   <Button>Tạo mới</Button>
 * </EmptyState>
 * ```
 */

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>
    title: string
    description?: string
    children?: React.ReactNode
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 text-center border rounded-xl',
                className
            )}
        >
            {Icon && (
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
            )}
            {children && <div className="mt-4">{children}</div>}
        </div>
    )
}
