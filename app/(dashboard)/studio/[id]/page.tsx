import { Suspense } from 'react'
import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { notFound } from 'next/navigation'
import { OrderDetailHeader } from '@/components/studio/order-detail-header'
import { OrderDetailContent } from '@/components/studio/order-detail-content'
import { Skeleton } from '@/components/ui/skeleton'

export default async function RetailOrderDetailPage({ params }: any) {
    const { id } = await params
    const order = await getRetailOrderById(id)

    if (!order) notFound()

    return (
        <div className="space-y-8 pb-12">
            <OrderDetailHeader order={order} />
            <Suspense fallback={<OrderDetailSkeleton />}>
                <OrderDetailContent order={order} />
            </Suspense>
        </div>
    )
}

function OrderDetailSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[250px] w-full rounded-xl" />
            </div>
        </div>
    )
}
