'use server'

import { createRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { getProductById } from '@/lib/supabase/services/product-service'
import { z } from 'zod'

const EXTRA_PRINT_PRICE = 40000;

// Free prints by price tier (in thousands)
const FREE_PRINTS_BY_PRICE: Record<number, number> = {
  79: 1,
  199: 2,
  339: 4,
}

const orderSchema = z.object({
  customerName: z.string().min(2, 'Tên quá ngắn'),
  customerPhone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  notes: z.string().optional().nullable().transform(v => v ?? undefined),
  packages: z.string(),
  viSizes: z.string().optional().nullable().transform(v => v ?? undefined),
  printQuantity: z.coerce.number().default(0),
  photoUrls: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingName: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingPhone: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingAddress: z.string().optional().nullable().transform(v => v ?? undefined),
})

export async function submitPhotoOrder(formData: FormData) {
  try {
    const rawData = {
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      notes: formData.get('notes') ?? undefined,
      packages: formData.get('packages') as string,
      viSizes: formData.get('viSizes') ?? undefined,
      printQuantity: formData.get('printQuantity') as string,
      photoUrls: formData.get('photoUrls') ?? undefined,
      shippingName: formData.get('shippingName') ?? undefined,
      shippingPhone: formData.get('shippingPhone') ?? undefined,
      shippingAddress: formData.get('shippingAddress') ?? undefined,
    }

    const val = orderSchema.parse(rawData)
    
    // Parse packages — id is now real product UUID from DB
    const pkgSelections: { id: string; qty: number; note: string }[] = JSON.parse(val.packages)
    
    if (pkgSelections.every(p => p.qty === 0)) {
      return { success: false, error: 'Vui lòng chọn ít nhất 1 gói dịch vụ.' }
    }

    const items: any[] = []
    let totalFreePrints = 0
    const packageSummary: string[] = []

    for (const sel of pkgSelections) {
      if (sel.qty <= 0) continue
      
      // Fetch real product from DB
      const product = await getProductById(sel.id)
      if (!product) continue
      
      const priceKey = Math.floor(product.price / 1000)
      const free = FREE_PRINTS_BY_PRICE[priceKey] || 0
      totalFreePrints += sel.qty * free

      items.push({
        product_id: product.id,
        product_name: `${product.name}${sel.note ? ` — ${sel.note}` : ''}`,
        quantity: sel.qty,
        unit_price: product.price,
        total_price: product.price * sel.qty,
      })
      
      packageSummary.push(`${sel.qty}x ${product.name}`)
    }

    // Print items
    const printQty = val.printQuantity
    const viSizes: string[] = val.viSizes ? JSON.parse(val.viSizes) : []

    if (printQty > 0 && viSizes.length > 0) {
      const freeIncluded = Math.min(printQty, totalFreePrints)
      const extraPaid = Math.max(0, printQty - totalFreePrints)

      // Map size IDs to readable names for notes
      const SIZE_NAMES: Record<string, string> = {
        'mix': 'Mix (3×4×6 + 5×3×4 + 3×2×3)',
        '2x3': '2×3 cm',
        '3x4': '3×4 cm',
        '4x6': '4×6 cm',
        '3.5x4.5': '3.5×4.5 cm',
        '3.3x4.8': '3.3×4.8 cm',
        '4.5x4.5': '4.5×4.5 cm',
        '5x5': '5×5 cm',
      }
      const sizeSummary = viSizes.map((s, i) => `Vỉ ${i + 1}: ${SIZE_NAMES[s] || s}`).join(', ')

      if (freeIncluded > 0) {
        items.push({
          product_name: `In ảnh cứng (Đã bao gồm trong gói)`,
          quantity: freeIncluded,
          unit_price: 0,
          total_price: 0,
        })
      }

      if (extraPaid > 0) {
        items.push({
          product_name: `In ảnh cứng (In thêm)`,
          quantity: extraPaid,
          unit_price: EXTRA_PRINT_PRICE,
          total_price: extraPaid * EXTRA_PRINT_PRICE,
        })
      }
    }

    // Parse photo URLs if present
    const photoUrls: string[] = val.photoUrls ? JSON.parse(val.photoUrls) : []

    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

    const orderNotes = [
      val.notes ? `Link Drive/Ghi chú: ${val.notes}` : null,
      packageSummary.length > 0 ? `Gói: ${packageSummary.join(', ')}` : null,
      viSizes.length > 0 ? `In vỉ: ${viSizes.map((s: string, i: number) => `Vỉ ${i + 1}: ${({'mix':'Mix','2x3':'2×3cm','3x4':'3×4cm','4x6':'4×6cm','3.5x4.5':'3.5×4.5cm','3.3x4.8':'3.3×4.8cm','4.5x4.5':'4.5×4.5cm','5x5':'5×5cm'} as any)[s] || s}`).join(', ')}` : null,
      photoUrls.length > 0 ? `Ảnh đã upload: ${photoUrls.length} ảnh` : null,
      val.shippingName ? `Ship đến: ${val.shippingName} - ${val.shippingPhone} - ${val.shippingAddress}` : null,
    ].filter(Boolean).join('\n') || 'Đơn đặt từ Website (Khách Tự Order)'

    // Generate public_token explicitly so we can use it for redirect
    // (DB default may not be returned by .select() in unauthenticated context)
    const publicToken = crypto.randomUUID()

    const newOrder = await createRetailOrder({
      customer_name: val.customerName,
      customer_phone: val.customerPhone,
      customer_email: '',
      total_amount: totalAmount,
      paid_amount: 0,
      payment_status: 'pending',
      order_status: 'pending',
      source_system: 'website',
      brand: 'studio',
      notes: orderNotes,
      public_token: publicToken,
      metadata: {
        form_type: 'id_photo',
        packages: pkgSelections.filter(p => p.qty > 0),
        vi_sizes: viSizes,
        photo_urls: photoUrls,
        shipping: val.shippingName ? {
          name: val.shippingName,
          phone: val.shippingPhone,
          address: val.shippingAddress,
        } : null,
      },
      items,
    })

    return { success: true, orderId: newOrder.id, token: publicToken }
  } catch (error: any) {
    console.error('Submit photo order error:', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' }
  }
}
