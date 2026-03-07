import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import NewContractClient from './new-contract-client'

export default async function NewContractPage() {
    const [customers, quotations] = await Promise.all([
        getCustomers(),
        getQuotations()
    ])

    return (
        <NewContractClient
            initialCustomers={customers}
            initialQuotations={quotations}
        />
    )
}
