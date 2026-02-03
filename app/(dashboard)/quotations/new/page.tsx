import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getProducts } from '@/lib/supabase/services/product-service'
import NewQuotationClient from './new-quotation-client'

export default async function NewQuotationPage() {
    const customers = await getCustomers()
    const products = await getProducts()

    return (
        <NewQuotationClient
            initialCustomers={customers}
            initialProducts={products}
        />
    )
}
