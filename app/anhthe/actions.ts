'use server'

import { createPublicRetailOrder, updatePublicRetailOrder } from '@/lib/supabase/services/retail-order-service'
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
  viLabels: z.string().optional().nullable().transform(v => v ?? undefined),
  printQuantity: z.coerce.number().default(0),
  photoUrls: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingName: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingPhone: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingAddress: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingRegion: z.string().optional().nullable().transform(v => v ?? undefined),
  shippingFee: z.coerce.number().default(0),
  discountType: z.string().optional().nullable().transform(v => v ?? undefined),
  discountValue: z.string().optional().nullable().transform(v => v ?? undefined),
  discountAmount: z.coerce.number().default(0),
  draftId: z.string().optional().nullable().transform(v => v ?? undefined),
})

export async function submitPhotoOrder(formData: FormData) {
  try {
    const rawData = {
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      notes: formData.get('notes') ?? undefined,
      packages: formData.get('packages') as string,
      viSizes: formData.get('viSizes') ?? undefined,
      viLabels: formData.get('viLabels') ?? undefined,
      printQuantity: formData.get('printQuantity') as string,
      photoUrls: formData.get('photoUrls') ?? undefined,
      shippingName: formData.get('shippingName') ?? undefined,
      shippingPhone: formData.get('shippingPhone') ?? undefined,
      shippingAddress: formData.get('shippingAddress') ?? undefined,
      shippingRegion: formData.get('shippingRegion') ?? undefined,
      shippingFee: formData.get('shippingFee') as string ?? '0',
      discountType: formData.get('discountType') ?? undefined,
      discountValue: formData.get('discountValue') ?? undefined,
      discountAmount: formData.get('discountAmount') as string ?? '0',
      draftId: formData.get('draftId') ?? undefined,
    }

    const val = orderSchema.parse(rawData)
    
    // Parse packages — id is now real product UUID from DB
    const pkgSelections: { id: string; qty: number; note: string }[] = JSON.parse(val.packages)
    
    if (pkgSelections.every(p => p.qty === 0) && val.printQuantity === 0) {
      return { success: false, error: 'Vui lòng chọn ít nhất 1 gói dịch vụ hoặc dịch vụ in ấn.' }
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
    const viLabels: string[] = val.viLabels ? JSON.parse(val.viLabels) : []

    if (printQty > 0 && viSizes.length > 0) {
      const freeIncluded = Math.min(printQty, totalFreePrints)
      const extraPaid = Math.max(0, printQty - totalFreePrints)

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

      if (freeIncluded > 0) {
        items.push({
          product_name: `In ảnh cứng (Đã bao gồm trong gói)`,
          quantity: freeIncluded,
          unit_price: 0,
          total_price: 0,
        })
      }

      if (extraPaid > 0) {
        const printLabel = totalFreePrints > 0 ? 'In ảnh cứng (In thêm)' : 'In ảnh cứng'
        items.push({
          product_name: printLabel,
          quantity: extraPaid,
          unit_price: EXTRA_PRINT_PRICE,
          total_price: extraPaid * EXTRA_PRINT_PRICE,
        })
      }
    }

    // Parse photo URLs if present
    const photoUrls: string[] = val.photoUrls ? JSON.parse(val.photoUrls) : []

    // Shipping fee item
    const shippingFee = val.shippingFee || 0
    if (shippingFee > 0) {
      items.push({
        product_name: `Phí vận chuyển (${val.shippingRegion === 'hanoi' ? 'Hà Nội' : 'Tỉnh/Thành khác'})`,
        quantity: 1,
        unit_price: shippingFee,
        total_price: shippingFee,
      })
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

    // Discount item (negative line item)
    const discountAmount = val.discountAmount || 0
    if (discountAmount > 0) {
      const discountLabel = val.discountType === 'percent'
        ? `Giảm giá (${val.discountValue}%)`
        : 'Giảm giá'
      items.push({
        product_name: discountLabel,
        quantity: 1,
        unit_price: -discountAmount,
        total_price: -discountAmount,
      })
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount)

    const orderNotes = [
      val.notes ? `Link Drive/Ghi chú: ${val.notes}` : null,
      packageSummary.length > 0 ? `Gói: ${packageSummary.join(', ')}` : null,
      viSizes.length > 0 ? `In vỉ: ${viSizes.map((s: string, i: number) => {
        const label = viLabels[i] || ''
        const sizeName = ({'mix':'Mix','2x3':'2×3cm','3x4':'3×4cm','4x6':'4×6cm','3.5x4.5':'3.5×4.5cm','3.3x4.8':'3.3×4.8cm','4.5x4.5':'4.5×4.5cm','5x5':'5×5cm'} as any)[s] || s
        return `Vỉ ${i + 1}${label ? ` (${label})` : ''}: ${sizeName}`
      }).join(', ')}` : null,
      photoUrls.length > 0 ? `Ảnh đã upload: ${photoUrls.length} ảnh` : null,
      val.shippingName ? `Ship đến: ${val.shippingName} - ${val.shippingPhone} - ${val.shippingAddress}` : null,
      shippingFee > 0 ? `Phí ship: ${new Intl.NumberFormat('vi-VN').format(shippingFee)}đ (${val.shippingRegion === 'hanoi' ? 'Hà Nội' : 'Tỉnh khác'})` : (val.shippingName ? 'Miễn phí vận chuyển' : null),
      discountAmount > 0 ? `Giảm giá: -${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ${val.discountType === 'percent' ? ` (${val.discountValue}%)` : ''}` : null,
    ].filter(Boolean).join('\n') || 'Đơn đặt từ Website (Khách Tự Order)'

    const publicToken = crypto.randomUUID()

    const orderPayload = {
      customer_name: val.customerName,
      customer_phone: val.customerPhone,
      customer_email: '',
      total_amount: finalAmount,
      paid_amount: 0,
      payment_status: 'pending' as const,
      order_status: 'pending' as const,
      source_system: 'website',
      brand: 'studio' as const,
      notes: orderNotes,
      public_token: publicToken,
      metadata: {
        form_type: 'id_photo',
        packages: pkgSelections.filter(p => p.qty > 0),
        vi_sizes: viSizes,
        vi_labels: viLabels,
        photo_urls: photoUrls,
        shipping: val.shippingName ? {
          name: val.shippingName,
          phone: val.shippingPhone,
          address: val.shippingAddress,
          region: val.shippingRegion,
          fee: shippingFee,
        } : null,
      },
      items,
    }

    // If we have a draftId, update the draft to pending; otherwise create new
    if (val.draftId) {
      await updatePublicRetailOrder(val.draftId, orderPayload)
      return { success: true, orderId: val.draftId, token: publicToken }
    } else {
      const newOrder = await createPublicRetailOrder(orderPayload)
      return { success: true, orderId: newOrder.id, token: publicToken }
    }
  } catch (error: any) {
    console.error('Submit photo order error:', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' }
  }
}
