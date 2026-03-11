import { RetailOrderForm } from '@/components/studio/order-form'
import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditRetailOrderPage({ params }: any) {
    const { id } = await params
    const order = await getRetailOrderById(id)

    if (!order) notFound()

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href={`/studio`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Chỉnh sửa đơn hàng
                    </h1>
                    <p className="text-muted-foreground text-sm">Cập nhật thông tin đơn hàng {order.order_number}</p>
                </div>
            </div>

            <RetailOrderForm initialData={order} isEdit={true} />
        </div>
    )
}
