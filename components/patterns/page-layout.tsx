import { cn } from '@/lib/utils'

/**
 * PageLayout — Standard content wrapper for all dashboard pages
 *
 * Ensures consistent vertical spacing and bottom padding.
 * All dashboard page content should be wrapped in this component.
 *
 * Usage:
 * ```tsx
 * <PageLayout>
 *   <PageHeader title="Dashboard" />
 *   <StatCards />
 *   <DataTable />
 * </PageLayout>
 * ```
 */

interface PageLayoutProps {
    children: React.ReactNode
    className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
    return (
        <div className={cn('flex flex-col gap-6 pb-20', className)}>
            {children}
        </div>
    )
}
