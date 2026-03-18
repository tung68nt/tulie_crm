'use server'

import { createClient } from '../server'
import { RetailOrder, RetailOrderStatus, RetailPaymentStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import {
    sendTelegramNotification,
    formatNewRetailOrder,
    formatPaymentReceived
} from './telegram-service'

// Helper to generate Retail Order ID: DH_YY_MMDD_STT_VALUE_IN_K
export async function generateRetailOrderId(amount: number, orderDate?: string): Promise<{ orderNumber: string, stt: number }> {
    const supabase = await createClient()

    // Use the provided order_date or fallback to today
    const date = orderDate ? new Date(orderDate) : new Date()
    const yy = date.getFullYear().toString().slice(-2)
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    const mmdd = `${mm}${dd}`

    // Price: total / 1000, drop trailing zeros (179000 => 179, 79000 => 79)
    const kValue = Math.floor(amount / 1000)

    // STT: global sequential number, continuing from legacy system (~810+)
    // Get the max STT from existing records, or start from 810 if empty
    const { data: maxSttData } = await supabase
        .from('retail_orders')
        .select('stt')
        .order('stt', { ascending: false })
        .limit(1)
        .maybeSingle()

    const nextStt = maxSttData?.stt ? maxSttData.stt + 1 : 810

    return {
        orderNumber: `DH_${yy}_${mmdd}_${nextStt}_${kValue}`,
        stt: nextStt
    }
}

// Get the next STT number for order ID preview
export async function getNextStt(): Promise<number> {
    const supabase = await createClient()
    const { data: maxSttData } = await supabase
        .from('retail_orders')
        .select('stt')
        .order('stt', { ascending: false })
        .limit(1)
        .maybeSingle()

    return maxSttData?.stt ? maxSttData.stt + 1 : 810
}


export async function getRetailOrders() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('retail_orders')
            .select('*, creator:users(*)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as RetailOrder[]
    } catch (err) {
        console.error('Error in getRetailOrders:', err)
        return []
    }
}

export async function getRetailOrderById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('retail_orders')
            .select('*, creator:users(*), items:retail_order_items(*)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as RetailOrder
    } catch (err) {
        console.error('Error in getRetailOrderById:', err)
        return null
    }
}

export async function createRetailOrder(order: Partial<RetailOrder>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // items are passed in order.items
        const { items, use_deposit, ...orderData } = order as any

        // Auto-generate ID if not provided
        if (!orderData.order_number) {
            const { orderNumber, stt } = await generateRetailOrderId(orderData.total_amount || 0, orderData.order_date)
            orderData.order_number = orderNumber
            orderData.stt = stt
        }

        if (orderData.delivery_date === '') {
            orderData.delivery_date = null
        }
        if (orderData.order_date === '') {
            orderData.order_date = null
        }

        const { data: insertedOrder, error: orderError } = await supabase
            .from('retail_orders')
            .insert([{
                ...orderData,
                created_by: user?.id
            }])
            .select()
            .single()

        if (orderError) throw orderError

        // Insert items if any
        if (items && items.length > 0) {
            const orderItems = items.map((item: any, index: number) => ({
                order_id: insertedOrder.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price || (item.quantity * item.unit_price),
                sort_order: index
            }))

            const { error: itemsError } = await supabase
                .from('retail_order_items')
                .insert(orderItems)

            if (itemsError) {
                console.error('Error inserting order items:', itemsError)
                // Don't throw - order was created. Items can be added manually.
            }
        }

        // Non-blocking: send Telegram notification (don't fail the order if this errors)
        try {
            await sendTelegramNotification(await formatNewRetailOrder(insertedOrder), 'notify_new_retail_order')
        } catch (notifErr) {
            console.error('Telegram notification failed (order still created):', notifErr)
        }

        revalidatePath('/studio')
        return insertedOrder as RetailOrder
    } catch (err) {
        console.error('Error creating retail order:', err)
        throw err
    }
}

export async function updateRetailOrder(id: string, order: Partial<RetailOrder>) {
    try {
        const supabase = await createClient()

        const { items, ...updateData } = order as any
        if (updateData.delivery_date === '') {
            updateData.delivery_date = null
        }
        if (updateData.order_date === '') {
            updateData.order_date = null
        }
        // Remove non-DB fields
        delete updateData.use_deposit

        // Auto-update order_number suffix when total_amount changes
        if (updateData.total_amount !== undefined) {
            const { data: current } = await supabase
                .from('retail_orders')
                .select('order_number, total_amount')
                .eq('id', id)
                .single()

            if (current?.order_number && current.total_amount !== updateData.total_amount) {
                const parts = current.order_number.split('_')
                // Format: DH_YY_MMDD_STT_VALUE → replace last part with new kValue
                if (parts.length >= 5) {
                    const newKValue = Math.floor(updateData.total_amount / 1000)
                    parts[parts.length - 1] = String(newKValue)
                    updateData.order_number = parts.join('_')
                }
            }
        }

        const { error } = await supabase
            .from('retail_orders')
            .update(updateData)
            .eq('id', id)

        if (error) throw error

        // Upsert items: delete all existing, then insert new ones
        if (items && Array.isArray(items)) {
            // Delete existing items
            await supabase
                .from('retail_order_items')
                .delete()
                .eq('order_id', id)

            // Insert new items
            if (items.length > 0) {
                const orderItems = items.map((item: any, index: number) => ({
                    order_id: id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price || (item.quantity * item.unit_price),
                    sort_order: index
                }))

                const { error: itemsError } = await supabase
                    .from('retail_order_items')
                    .insert(orderItems)

                if (itemsError) {
                    console.error('Error upserting order items:', itemsError)
                }
            }
        }

        // Auto-cleanup photos when order is completed
        if (updateData.order_status === 'completed') {
            cleanupOrderPhotos(id).catch(err => console.error('Photo cleanup failed:', err))
        }

        revalidatePath('/studio')
        revalidatePath(`/studio/${id}`)
        revalidatePath(`/studio/${id}/edit`)
        return true
    } catch (err) {
        console.error('Error updating retail order:', err)
        throw err
    }
}

// Delete uploaded photos from Supabase Storage when order is done
export async function cleanupOrderPhotos(orderId: string) {
    try {
        const supabase = await createClient()
        const order = await getRetailOrderById(orderId)
        if (!order) return

        const photoUrls: string[] = (order as any).metadata?.photo_urls || []
        if (photoUrls.length === 0) return

        // Extract storage paths from URLs (format: .../id-photos/orders/timestamp_random.ext)
        const paths = photoUrls
            .map(url => {
                const match = url.match(/id-photos\/(.+)$/)
                return match ? match[1] : null
            })
            .filter(Boolean) as string[]

        if (paths.length > 0) {
            const { error } = await supabase.storage.from('id-photos').remove(paths)
            if (error) console.error('Error deleting photos:', error)

            // Clear photo_urls from metadata
            const metadata = { ...(order as any).metadata, photo_urls: [] }
            await supabase.from('retail_orders').update({ metadata }).eq('id', orderId)
            console.log(`Cleaned up ${paths.length} photos for order ${orderId}`)
        }
    } catch (err) {
        console.error('Error cleaning up order photos:', err)
    }
}

// Special function for payments
export async function recordRetailPayment(id: string, amount: number) {
    try {
        // Use admin client — this is called from webhook context (no auth cookies)
        const { createAdminClient } = await import('../admin')
        const supabase = createAdminClient()

        const { data: order, error: fetchError } = await supabase
            .from('retail_orders')
            .select('id, order_number, customer_name, customer_phone, total_amount, paid_amount, payment_status')
            .eq('id', id)
            .single()

        if (fetchError || !order) throw new Error('Order not found')

        // Skip if already fully paid (prevent double-charge)
        if (order.payment_status === 'paid') {
            console.log(`[recordRetailPayment] Order ${order.order_number} already paid — skipping`)
            return true
        }

        const newPaidAmount = (order.paid_amount || 0) + amount
        // Cap: do not allow paid_amount to exceed total_amount
        const cappedPaidAmount = Math.min(newPaidAmount, order.total_amount)
        const paymentStatus: RetailPaymentStatus = cappedPaidAmount >= order.total_amount ? 'paid' : 'partial'

        if (newPaidAmount > order.total_amount) {
            console.warn(`[recordRetailPayment] Overpayment prevented: ${newPaidAmount} > ${order.total_amount} for ${order.order_number}. Capped to ${cappedPaidAmount}`)
        }

        const { error } = await supabase
            .from('retail_orders')
            .update({
                paid_amount: cappedPaidAmount,
                payment_status: paymentStatus
            })
            .eq('id', id)

        if (error) throw error

        // Non-blocking: send Telegram notification
        try {
            await sendTelegramNotification(await formatPaymentReceived(order, amount), 'notify_retail_payment')
        } catch (notifErr) {
            console.error('Telegram notification failed (payment still recorded):', notifErr)
        }

        revalidatePath('/studio')
        return true
    } catch (err) {
        console.error('Error recording retail payment:', err)
        throw err
    }
}

/**
 * Recalculate order payment from actual matched transactions.
 * Use this to fix orders with incorrect paid_amount (e.g., double-charge from manual + webhook).
 */
export async function recalculateOrderPayment(orderId: string): Promise<{
    previousPaid: number
    actualPaid: number
    delta: number
    totalAmount: number
    newStatus: RetailPaymentStatus
}> {
    const { createAdminClient } = await import('../admin')
    const supabase = createAdminClient()

    // Get order
    const { data: order, error: fetchError } = await supabase
        .from('retail_orders')
        .select('id, order_number, total_amount, paid_amount, payment_status')
        .eq('id', orderId)
        .single()

    if (fetchError || !order) throw new Error('Order not found')

    // Sum all matched transactions from payment_transactions
    const { data: txs } = await supabase
        .from('payment_transactions')
        .select('amount_in')
        .eq('matched_order_id', orderId)

    const actualPaid = (txs || []).reduce((sum, tx) => sum + (tx.amount_in || 0), 0)
    const previousPaid = order.paid_amount || 0
    const delta = actualPaid - previousPaid
    const newStatus: RetailPaymentStatus = actualPaid >= order.total_amount ? 'paid' : actualPaid > 0 ? 'partial' : 'pending'

    // Update order with correct values
    const { error } = await supabase
        .from('retail_orders')
        .update({
            paid_amount: actualPaid,
            payment_status: newStatus
        })
        .eq('id', orderId)

    if (error) throw error

    console.log(`[recalculateOrderPayment] ${order.order_number}: ${previousPaid} → ${actualPaid} (delta: ${delta})`)

    revalidatePath('/studio')
    revalidatePath(`/studio/${orderId}`)
    return { previousPaid, actualPaid, delta, totalAmount: order.total_amount, newStatus }
}

export async function getRetailOrderByToken(token: string) {
    try {
        // Use admin client to bypass RLS — portal is public-facing,
        // security is via unguessable public_token (UUID)
        const { createAdminClient } = await import('../admin')
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('retail_orders')
            .select('*, items:retail_order_items(*)')
            .eq('public_token', token)
            .single()

        if (error) throw error
        return data as RetailOrder
    } catch (err) {
        console.error('Error fetching retail order by token:', err)
        return null
    }
}

export async function cancelRetailOrder(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('retail_orders')
            .update({ order_status: 'cancelled' })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/studio')
        revalidatePath(`/studio/${id}`)
        return true
    } catch (err) {
        console.error('Error cancelling retail order:', err)
        throw err
    }
}

export async function deleteRetailOrders(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('retail_orders')
            .delete()
            .in('id', ids)

        if (error) throw error

        revalidatePath('/studio')
        return true
    } catch (err) {
        console.error('Error deleting retail orders:', err)
        throw err
    }
}
