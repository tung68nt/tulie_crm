import { getContractById } from '@/lib/supabase/services/contract-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import { notFound } from 'next/navigation'
import { ContractForm } from '@/components/contracts/contract-form'

interface EditContractPageProps {
    params: { id: string }
}

export default async function EditContractPage({ params }: any) {
    const { id } = await params
    const [contract, customers, quotations, projects] = await Promise.all([
        getContractById(id),
        getCustomers(),
        getQuotations(),
        getProjects()
    ])

    if (!contract) {
        notFound()
    }

    return (
        <ContractForm
            contract={contract}
            customers={customers}
            quotations={quotations}
            projects={projects}
        />
    )
}
