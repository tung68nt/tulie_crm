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

      // Group sizes for summary
      const sizeSummary = viSizes.join(', ')

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
