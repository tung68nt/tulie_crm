import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getProducts } from '@/lib/supabase/services/product-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProductUnits } from '@/lib/supabase/services/settings-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import NewQuotationClient from './new-quotation-client'

export const dynamic = 'force-dynamic'

export default async function NewQuotationPage({
    searchParams
}: {
    searchParams: Promise<{ customer?: string }>
}) {
    const { customer: customerId } = await searchParams
    const [customers, products, units, projects, brandConfig] = await Promise.all([
        getCustomers(),
        getProducts(),
        getProductUnits(),
        getProjects(),
        getBrandConfig()
    ])

    return (
        <NewQuotationClient
            initialCustomers={customers}
            initialProducts={products}
            units={units}
            projects={projects}
            preselectedCustomerId={customerId}
            brandConfig={brandConfig}
        />
    )
}
