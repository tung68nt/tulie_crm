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
export async function generateRetailOrderId(amount: number, date: Date = new Date()): Promise<{ orderNumber: string, stt: number }> {
    const supabase = await createClient()

    // Get year, month, day
    const yy = date.getFullYear().toString().slice(-2)
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    const mmdd = `${mm}${dd}`

    // Get value in thousands (K)
    const kValue = Math.floor(amount / 1000)

    // Get next STT (Sequence in day or global?) 
    // From Lark image, STT seems global or per-year. 790, 791... 
    // Let's get the max STT and +1
    const { data: maxSttData } = await supabase
        .from('retail_orders')
        .select('stt')
        .order('stt', { ascending: false })
        .limit(1)
        .single()

    const nextStt = (maxSttData?.stt || 0) + 1

    return {
        orderNumber: `DH_${yy}_${mmdd}_${nextStt}_${kValue}`,
        stt: nextStt
    }
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
            .select('*, creator:users(*)')
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

        // Auto-generate ID if not provided
        if (!order.order_number) {
            const { orderNumber, stt } = await generateRetailOrderId(order.total_amount || 0)
            order.order_number = orderNumber
            order.stt = stt
        }

        const { data, error } = await supabase
            .from('retail_orders')
            .insert([{
                ...order,
                created_by: user?.id
            }])
            .select()
            .single()

        if (error) throw error

        // Notification
        await sendTelegramNotification(await formatNewRetailOrder(data))

        revalidatePath('/studio')
        return data as RetailOrder
    } catch (err) {
        console.error('Error creating retail order:', err)
        throw err
    }
}

export async function updateRetailOrder(id: string, order: Partial<RetailOrder>) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('retail_orders')
            .update(order)
            .eq('id', id)

        if (error) throw error

        revalidatePath('/studio')
        revalidatePath(`/studio/orders/${id}`)
        return true
    } catch (err) {
        console.error('Error updating retail order:', err)
        throw err
    }
}

// Special function for payments
export async function recordRetailPayment(id: string, amount: number) {
    try {
        const supabase = await createClient()
        const order = await getRetailOrderById(id)
        if (!order) throw new Error('Order not found')

        const newPaidAmount = (order.paid_amount || 0) + amount
        const paymentStatus: RetailPaymentStatus = newPaidAmount >= order.total_amount ? 'paid' : 'partial'

        const { error } = await supabase
            .from('retail_orders')
            .update({
                paid_amount: newPaidAmount,
                payment_status: paymentStatus
            })
            .eq('id', id)

        if (error) throw error

        // Notification
        await sendTelegramNotification(await formatPaymentReceived(order, amount))

        revalidatePath('/studio')
        return true
    } catch (err) {
        console.error('Error recording retail payment:', err)
        throw err
    }
}
