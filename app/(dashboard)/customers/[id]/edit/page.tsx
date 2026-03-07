import { getCustomerById } from '@/lib/supabase/services/customer-service'
import { notFound } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'

interface EditCustomerPageProps {
    params: { id: string }
}

export default async function EditCustomerPage({ params }: any) {
    const { id } = await params
    const customer = await getCustomerById(id)

    if (!customer) {
        notFound()
    }

    return <CustomerForm customer={customer} />
}
