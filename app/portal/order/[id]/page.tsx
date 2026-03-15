import { getRetailOrderByToken, getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RetailOrderPortalContent from './portal-client'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const brand = await getBrandConfig()
    // Try token first, then direct ID
    const order = await getRetailOrderByToken(id) || await getRetailOrderById(id)
    const orderNum = order?.order_number || ''
    return {
        title: orderNum
            ? `Đơn hàng ${orderNum} - ${brand.brand_name || 'Tulie'}`
            : `Đơn hàng - ${brand.brand_name || 'Tulie'}`,
        description: `Theo dõi tiến độ đơn hàng ${orderNum} của bạn`,
    }
}

export default async function RetailOrderPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // Support both public_token and direct UUID lookup
    const order = await getRetailOrderByToken(id) || await getRetailOrderById(id)

    if (!order) notFound()

    const brandConfig = await getBrandConfig()

    return <RetailOrderPortalContent order={order} brandConfig={brandConfig} />
}
