import { getContractById } from '@/lib/supabase/services/contract-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { notFound } from 'next/navigation'
import { ContractForm } from '@/components/contracts/contract-form'

interface EditContractPageProps {
    params: { id: string }
}

export default async function EditContractPage({ params }: any) {
    const { id } = await params
    const [contract, customers, quotations] = await Promise.all([
        getContractById(id),
        getCustomers(),
        getQuotations()
    ])

    if (!contract) {
        notFound()
    }

    return (
        <ContractForm
            contract={contract}
            customers={customers}
            quotations={quotations}
        />
    )
}
