import { getRetailOrderByToken } from '@/lib/supabase/services/retail-order-service'
import { notFound } from 'next/navigation'
import OrderPortalClient from './order-portal-client'

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props) {
    const { token } = await params
    const order = await getRetailOrderByToken(token)

    if (!order) return { title: 'Không tìm thấy đơn hàng' }

    return {
        title: `Đơn hàng: ${order.order_number} - Tulie Studio`,
        description: `Theo dõi tiến độ đơn hàng ${order.order_number} tại Tulie Studio`,
    }
}

export default async function RetailOrderPortalPage({ params }: Props) {
    const { token } = await params
    const order = await getRetailOrderByToken(token)

    if (!order) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <OrderPortalClient order={order} />
        </div>
    )
}
