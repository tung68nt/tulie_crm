import { Suspense } from 'react'
import { getDeals } from '@/lib/supabase/services/deal-service'
import { DealList } from '@/components/deals/deal-list'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default async function StudioDealsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Cơ hội Studio</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý phễu khách hàng cá nhân & Studio.
                        </p>
                    </div>
                </div>
                <Button asChild className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <Link href="/deals/new?brand=studio">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo cơ hội mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<DealSkeleton />}>
                <DealDataWrapper />
            </Suspense>
        </div>
    )
}

async function DealDataWrapper() {
    // Filter deals specifically for 'studio' brand
    const deals = await getDeals(undefined, 'studio')
    return <DealList initialData={deals} />
}

function DealSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="border rounded-md">
                <div className="h-12 border-b bg-muted/50" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
