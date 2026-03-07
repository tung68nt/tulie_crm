import { Suspense } from 'react'
import { getRetailOrders } from '@/lib/supabase/services/retail-order-service'
import { RetailOrderList } from '@/components/studio/order-list'
import { Button } from '@/components/ui/button'
import { Plus, Camera } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default async function StudioPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Studio (B2C)</h1>
                        <p className="text-muted-foreground font-normal">Quản lý đơn hàng chụp ảnh cá nhân & Studio.</p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/studio/new">
                        <Plus className="mr-2 h-4 w-4" /> Tạo đơn mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<OrderListSkeleton />}>
                <OrderListWrapper />
            </Suspense>
        </div>
    )
}

async function OrderListWrapper() {
    const orders = await getRetailOrders()
    return <RetailOrderList initialData={orders} />
}

function OrderListSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-10 w-48" />
            </div>
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}
