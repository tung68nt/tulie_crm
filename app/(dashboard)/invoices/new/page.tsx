import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import NewInvoiceClient from './new-invoice-client'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
    const [customers, contracts, quotations, projects, brandConfig] = await Promise.all([
        getCustomers(),
        getContracts(),
        getQuotations(),
        getProjects(),
        getBrandConfig()
    ])

    return (
        <NewInvoiceClient
            initialCustomers={customers}
            initialContracts={contracts}
            initialQuotations={quotations}
            initialProjects={projects}
            brandConfig={brandConfig}
        />
    )
}
