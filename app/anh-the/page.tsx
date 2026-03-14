import { getProducts } from '@/lib/supabase/services/product-service'
import OrderForm from './components/OrderForm'

export default async function IDPhotoOrderPage() {
  // Fetch only studio photo packages (active, sorted by price)
  const allProducts = await getProducts()
  const photoPackages = allProducts
    .filter(p => p.is_active && p.category === 'Studio')
    .sort((a, b) => a.price - b.price)

  return <OrderForm products={photoPackages} />
}
