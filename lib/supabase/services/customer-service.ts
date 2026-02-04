'use server'
import { createClient } from '../server'
import { Customer } from '@/types'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-service'

export async function getCustomers() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*, assigned_user:users!assigned_to(*)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getCustomers] Error fetching customers:', error)
            return []
        }

        return data as Customer[]
    } catch (err) {
        console.error('[getCustomers] Fatal error:', err)
        return []
    }
}

export async function getCustomerById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*, assigned_user:users!assigned_to(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('[getCustomerById] Error fetching customer by id:', error)
            return null
        }

        return data as Customer
    } catch (err) {
        console.error('[getCustomerById] Fatal error:', err)
        return null
    }
}

export async function createCustomer(customer: Partial<Customer>) {
    try {
        const supabase = await createClient()

        const userId = customer.created_by || customer.assigned_to
        if (userId) {
            // Check if user exists in public.users
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single()

            if (!existingUser) {
                // Try to get auth user to sync
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (authUser && authUser.id === userId) {
                    await supabase.from('users').upsert([{
                        id: authUser.id,
                        email: authUser.email,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        role: 'staff',
                        is_active: true
                    }], { onConflict: 'id' })
                }
            }
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()

        if (error) {
            console.error('[createCustomer] Insert error:', error)
            throw error
        }

        if (data && data.length > 0) {
            revalidatePath('/customers')

            // Create a notification for the person assigned to the customer
            if (data[0].assigned_to) {
                try {
                    await createNotification({
                        user_id: data[0].assigned_to,
                        type: 'new_customer',
                        title: 'Khách hàng mới',
                        message: `${data[0].company_name} vừa được thêm vào hệ thống`,
                        link: `/customers/${data[0].id}`
                    })
                } catch (notifErr) {
                    console.error('[createCustomer] Notification error:', notifErr)
                }
            }

            return data[0]
        }

        throw new Error('Không có dữ liệu trả về sau khi tạo khách hàng')
    } catch (err: any) {
        console.error('[createCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo khách hàng')
    }
}
