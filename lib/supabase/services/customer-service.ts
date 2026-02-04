'use server'
import { createClient } from '../server'
import { Customer } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getCustomers() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*, assigned_user:users(*)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching customers:', error)
            return []
        }

        return data as Customer[]
    } catch (err) {
        console.error('Fatal error in getCustomers:', err)
        return []
    }
}

export async function getCustomerById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*, assigned_user:users(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching customer by id:', error)
            return null
        }

        return data as Customer
    } catch (err) {
        console.error('Fatal error in getCustomerById:', err)
        return null
    }
}

export async function createCustomer(customer: Partial<Customer>) {
    try {
        const supabase = await createClient()

        const userId = customer.created_by || customer.assigned_to
        if (userId) {
            // Use limit(1) instead of single() to avoid unnecessary error throwing
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .limit(1)

            if (!users || users.length === 0) {
                try {
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
                } catch (authErr) {
                    // Error during auth user fetch is not critical for customer creation,
                    // but might indicate a problem with user sync.
                    // console.error('[createCustomer] Error during auth user fetch:', authErr)
                }
            }
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()

        if (error) {
            throw error
        }

        if (data && data.length > 0) {
            revalidatePath('/customers')
            return data[0]
        }

        throw new Error('Không có dữ liệu trả về sau khi tạo khách hàng')
    } catch (err: any) {
        console.error('Error in createCustomer:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo khách hàng')
    }
}
