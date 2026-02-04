'use server'
import { createClient } from '../server'
import { Customer } from '@/types'

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
    console.log('[createCustomer] Starting process for:', customer.company_name)
    try {
        const supabase = await createClient()

        const userId = customer.created_by || customer.assigned_to
        if (userId) {
            console.log('[createCustomer] Checking user ID:', userId)
            // Use limit(1) instead of single() to avoid unnecessary error throwing
            const { data: users, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .limit(1)

            if (checkError) {
                console.warn('[createCustomer] Warning checking user existence:', checkError.message)
            }

            if (!users || users.length === 0) {
                console.log('[createCustomer] User profile missing, attempting to create it...')
                try {
                    const { data: { user: authUser } } = await supabase.auth.getUser()
                    if (authUser && authUser.id === userId) {
                        const { error: insError } = await supabase.from('users').upsert([{
                            id: authUser.id,
                            email: authUser.email,
                            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                            role: 'staff',
                            is_active: true
                        }], { onConflict: 'id' })

                        if (insError) console.error('[createCustomer] Failed to sync user profile:', insError)
                        else console.log('[createCustomer] User profile synced successfully')
                    }
                } catch (authErr) {
                    console.error('[createCustomer] Error during auth user fetch:', authErr)
                }
            }
        }

        console.log('[createCustomer] Inserting customer record...')
        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()

        if (error) {
            console.error('[createCustomer] Database insert error:', error)
            throw error
        }

        if (!data || data.length === 0) {
            console.error('[createCustomer] Empty data returned from insert')
            throw new Error('Không có dữ liệu trả về sau khi tạo khách hàng')
        }

        console.log('[createCustomer] Success!')
        return data[0]
    } catch (err: any) {
        console.error('[createCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo khách hàng')
    }
}
