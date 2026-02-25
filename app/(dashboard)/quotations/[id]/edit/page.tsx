import { getQuotationById } from '@/lib/supabase/services/quotation-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getProducts } from '@/lib/supabase/services/product-service'
import { getProductUnits } from '@/lib/supabase/services/settings-service'
import { notFound } from 'next/navigation'
import { QuotationForm } from '@/components/quotations/quotation-form'

interface EditQuotationPageProps {
    params: { id: string }
}

export default async function EditQuotationPage({ params }: any) {
    const { id } = await params
    const [quotation, customers, products, units] = await Promise.all([
        getQuotationById(id),
        getCustomers(),
        getProducts(),
        getProductUnits()
    ])

    if (!quotation) {
        notFound()
    }

    return (
        <QuotationForm
            quotation={quotation}
            customers={customers}
            products={products}
            units={units}
        />
    )
}
