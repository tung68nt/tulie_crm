import { getProducts } from '@/lib/supabase/services/product-service'
import OrderForm from './components/OrderForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dịch vụ Ảnh thẻ Online - Tulie Studio',
  description: 'Chụp ảnh thẻ online chuyên nghiệp tại Tulie Studio. Đặt gói ảnh thẻ, thanh toán tiện lợi, nhận ảnh nhanh chóng. Liên hệ: 0979 684 731',
  openGraph: {
    title: 'Dịch vụ Ảnh thẻ Online - Tulie Studio',
    description: 'Chụp ảnh thẻ online chuyên nghiệp tại Tulie Studio. Đặt gói ảnh thẻ, thanh toán tiện lợi, nhận ảnh nhanh chóng.',
    type: 'website',
  },
}

export default async function IDPhotoOrderPage() {
  // Fetch only studio photo packages (active, sorted by price)
  const allProducts = await getProducts()
  const photoPackages = allProducts
    .filter(p => p.is_active && p.category === 'Studio')
    .sort((a, b) => a.price - b.price)

  return <OrderForm products={photoPackages} />
}
