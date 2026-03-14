import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RetailOrderPortalContent from './portal-client'

export async function generateMetadata(): Promise<Metadata> {
    const brand = await getBrandConfig()
    return {
        title: `Đơn hàng - ${brand.brand_name || 'Tulie'}`,
        description: 'Theo dõi tiến độ đơn hàng của bạn',
    }
}

export default async function RetailOrderPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getRetailOrderById(id)

    if (!order) notFound()

    const brandConfig = await getBrandConfig()

    return <RetailOrderPortalContent order={order} brandConfig={brandConfig} />
}
