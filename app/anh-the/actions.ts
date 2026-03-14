'use server'

import { createRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { z } from 'zod'

const EXTRA_PRINT_PRICE = 40000;

const FREE_PRINTS: Record<string, number> = {
  basic: 1,
  standard: 2,
  premium: 4,
}

const PACKAGE_INFO: Record<string, { name: string; price: number }> = {
  basic: { name: 'Gói Cơ bản', price: 79000 },
  standard: { name: 'Gói Tiêu chuẩn', price: 199000 },
  premium: { name: 'Gói Cao cấp', price: 339000 },
}

const orderSchema = z.object({
  customerName: z.string().min(2, 'Tên quá ngắn'),
  customerPhone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  notes: z.string().optional(),
  // JSON string: [{id, qty, note}]
  packages: z.string(),
  printSizeName: z.string().optional(),
  printQuantity: z.coerce.number().default(0),
  photoUrls: z.string().optional(), // JSON string: ["url1", "url2"]
})

export async function submitPhotoOrder(formData: FormData) {
  try {
    const rawData = {
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      notes: formData.get('notes') as string,
      packages: formData.get('packages') as string,
      printSizeName: formData.get('printSizeName') as string,
      printQuantity: formData.get('printQuantity') as string,
      photoUrls: formData.get('photoUrls') as string,
    }

    const val = orderSchema.parse(rawData)
    
    // Parse packages array
    const pkgSelections: { id: string; qty: number; note: string }[] = JSON.parse(val.packages)
    
    if (pkgSelections.every(p => p.qty === 0)) {
      return { success: false, error: 'Vui lòng chọn ít nhất 1 gói dịch vụ.' }
    }

    const items: any[] = []
    let totalFreePrints = 0
    const packageSummary: string[] = []

    for (const sel of pkgSelections) {
      if (sel.qty <= 0) continue
      const info = PACKAGE_INFO[sel.id]
      if (!info) continue
      
      const free = FREE_PRINTS[sel.id] || 0
      totalFreePrints += sel.qty * free

      items.push({
        product_name: `${info.name}${sel.note ? ` — ${sel.note}` : ''}`,
        quantity: sel.qty,
        unit_price: info.price,
        total_price: info.price * sel.qty,
      })
      
      packageSummary.push(`${sel.qty}x ${info.name}`)
    }

    // Print items
    const printQty = val.printQuantity
    const printName = val.printSizeName || ''

    if (printName && printName !== 'Không in' && printQty > 0) {
      const freeIncluded = Math.min(printQty, totalFreePrints)
      const extraPaid = Math.max(0, printQty - totalFreePrints)

      if (freeIncluded > 0) {
        items.push({
          product_name: `In ảnh cứng — ${printName} (Đã bao gồm trong gói)`,
          quantity: freeIncluded,
          unit_price: 0,
          total_price: 0,
        })
      }

      if (extraPaid > 0) {
        items.push({
          product_name: `In ảnh cứng — ${printName} (In thêm)`,
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
    ].filter(Boolean).join('\n') || 'Đơn đặt từ Website (Khách Tự Order)'

    const newOrder = await createRetailOrder({
      customer_name: val.customerName,
      customer_phone: val.customerPhone,
      customer_email: '',
      total_amount: totalAmount,
      paid_amount: 0,
      payment_status: 'pending',
      order_status: 'pending',
      source_system: 'website',
      brand: 'tulie_studio' as any,
      notes: orderNotes,
      metadata: {
        form_type: 'id_photo',
        packages: pkgSelections.filter(p => p.qty > 0),
        photo_urls: photoUrls,
      },
      items,
    })

    return { success: true, orderId: newOrder.id, token: newOrder.public_token }
  } catch (error: any) {
    console.error('Submit photo order error:', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' }
  }
}
