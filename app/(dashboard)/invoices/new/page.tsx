import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import NewInvoiceClient from './new-invoice-client'
import { getQuotations } from '@/lib/supabase/services/quotation-service'

import { getBrandConfig } from '@/lib/supabase/services/settings-service'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
    const [customers, contracts, quotations, brandConfig] = await Promise.all([
        getCustomers(),
        getContracts(),
        getQuotations(),
        getBrandConfig()
    ])

    return (
        <NewInvoiceClient
            initialCustomers={customers}
            initialContracts={contracts}
            initialQuotations={quotations}
            brandConfig={brandConfig}
        />
    )
}
