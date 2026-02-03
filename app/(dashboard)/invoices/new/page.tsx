import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import NewInvoiceClient from './new-invoice-client'
import { getQuotations } from '@/lib/supabase/services/quotation-service'

export default async function NewInvoicePage() {
    const [customers, contracts, quotations] = await Promise.all([
        getCustomers(),
        getContracts(),
        getQuotations()
    ])

    return (
        <NewInvoiceClient
            initialCustomers={customers}
            initialContracts={contracts}
            initialQuotations={quotations}
        />
    )
}
