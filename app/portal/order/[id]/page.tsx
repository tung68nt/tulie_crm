import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { notFound } from 'next/navigation'
import RetailOrderPortalContent from './portal-client'

export default async function RetailOrderPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getRetailOrderById(id)

    if (!order) notFound()

    const brandConfig = await getBrandConfig()

    return <RetailOrderPortalContent order={order} brandConfig={brandConfig} />
}
