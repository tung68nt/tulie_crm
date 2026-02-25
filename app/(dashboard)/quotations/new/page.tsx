import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getProducts } from '@/lib/supabase/services/product-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProductUnits } from '@/lib/supabase/services/settings-service'
import NewQuotationClient from './new-quotation-client'

export const dynamic = 'force-dynamic'

export default async function NewQuotationPage({
    searchParams
}: {
    searchParams: Promise<{ customer?: string }>
}) {
    const { customer: customerId } = await searchParams
    const [customers, products, units] = await Promise.all([
        getCustomers(),
        getProducts(),
        getProductUnits()
    ])

    return (
        <NewQuotationClient
            initialCustomers={customers}
            initialProducts={products}
            units={units}
            preselectedCustomerId={customerId}
        />
    )
}
