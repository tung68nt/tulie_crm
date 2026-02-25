import { getProductById } from '@/lib/supabase/services/product-service'
import { getProductCategories, getProductUnits } from '@/lib/supabase/services/settings-service'
import { notFound } from 'next/navigation'
import ProductEditClient from './product-edit-client'

export const dynamic = 'force-dynamic'

interface EditProductPageProps {
    params: { id: string }
}

export default async function EditProductPage({ params }: any) {
    const { id } = await params

    const [product, categories, units] = await Promise.all([
        getProductById(id),
        getProductCategories(),
        getProductUnits()
    ])

    if (!product) {
        notFound()
    }

    return (
        <ProductEditClient
            product={product}
            categories={categories}
            units={units}
        />
    )
}
