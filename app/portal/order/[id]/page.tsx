import { getRetailOrderByToken, getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig, getBankAccounts } from '@/lib/supabase/services/settings-service'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import RetailOrderPortalContent from './portal-client'
import { createClient } from '@/lib/supabase/server'

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

// Flexible lookup: try public_token (TEXT match), then public_token (cast), then id
async function findOrder(id: string) {
    // 1. Standard service lookup (by public_token then by id)
    const order = await getRetailOrderByToken(id) || await getRetailOrderById(id)
    if (order) return order

    // 2. Direct fallback query with explicit text cast for type mismatch scenarios
    try {
        const supabase = await createClient()
        const { data } = await supabase
            .from('retail_orders')
            .select('*, items:retail_order_items(*)')
            .or(`public_token.eq.${id},id.eq.${id}`)
            .limit(1)
            .maybeSingle()
        return data
    } catch {
        return null
    }
}

export default async function RetailOrderPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [order, brandConfig, bankAccounts] = await Promise.all([
        findOrder(id),
        getBrandConfig(),
        getBankAccounts()
    ])

    if (!order) notFound()

    // Find bank account configured as default for Studio B2C
    const defaultB2CBank = bankAccounts.find((b: any) => (b.default_for || []).includes('retail_order'))
    const bankInfo = order.metadata?.bank_info || (defaultB2CBank ? {
        bank_name: defaultB2CBank.bank_name,
        account_no: defaultB2CBank.account_no,
        account_name: defaultB2CBank.account_name
    } : null)

    return <RetailOrderPortalContent order={order} brandConfig={brandConfig} token={order.public_token || id} bankInfo={bankInfo} />
}
