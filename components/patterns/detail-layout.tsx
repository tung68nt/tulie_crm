import { cn } from '@/lib/utils'

/**
 * DetailLayout — Standard layout for detail/edit pages
 *
 * 2-column layout on desktop: main content (2/3) + sidebar (1/3)
 * Single column on mobile.
 *
 * Usage:
 * ```tsx
 * <DetailLayout>
 *   <DetailLayout.Main>
 *     <Card>...main content...</Card>
 *   </DetailLayout.Main>
 *   <DetailLayout.Sidebar>
 *     <Card>...sidebar info...</Card>
 *   </DetailLayout.Sidebar>
 * </DetailLayout>
 * ```
 */

interface DetailLayoutProps {
    children: React.ReactNode
    className?: string
}

export function DetailLayout({ children, className }: DetailLayoutProps) {
    return (
        <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
            {children}
        </div>
    )
}

function DetailMain({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('lg:col-span-2 space-y-6', className)}>
            {children}
        </div>
    )
}

function DetailSidebar({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('space-y-6', className)}>
            {children}
        </div>
    )
}

DetailLayout.Main = DetailMain
DetailLayout.Sidebar = DetailSidebar
