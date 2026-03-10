import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * PageHeader — Standard header for all dashboard pages
 *
 * Based on shadcn/ui Dashboard example:
 * - Back button (optional) — ghost icon-button, rounded-full
 * - Title — text-2xl font-bold tracking-tight
 * - Description (optional) — text-sm text-muted-foreground
 * - Actions slot — right-aligned buttons
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Khách hàng"
 *   description="Quản lý danh sách khách hàng"
 *   backHref="/customers"
 * >
 *   <Button>Tạo mới</Button>
 * </PageHeader>
 * ```
 */

interface PageHeaderProps {
    title: string
    description?: string
    backHref?: string
    badge?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    backHref,
    badge,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div className="flex items-start gap-3">
                {backHref && (
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="rounded-full hover:bg-muted/80 mt-0.5 shrink-0"
                    >
                        <Link href={backHref}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {badge}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {children && (
                <div className="flex items-center gap-2 shrink-0">{children}</div>
            )}
        </div>
    )
}
