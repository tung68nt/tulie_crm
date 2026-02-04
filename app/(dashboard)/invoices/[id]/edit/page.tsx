import { getInvoiceById } from '@/lib/supabase/services/invoice-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getVendors } from '@/lib/supabase/services/vendor-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { notFound } from 'next/navigation'
import { InvoiceForm } from '@/components/invoices/invoice-form'

interface EditInvoicePageProps {
    params: { id: string }
}

export default async function EditInvoicePage({ params }: any) {
    const { id } = await params
    const [invoice, customers, vendors, contracts] = await Promise.all([
        getInvoiceById(id),
        getCustomers(),
        getVendors(),
        getContracts()
    ])

    if (!invoice) {
        notFound()
    }

    return (
        <InvoiceForm
            invoice={invoice}
            customers={customers}
            vendors={vendors}
            contracts={contracts}
        />
    )
}
