'use server'
import { createClient } from '../server'
import { Customer } from '@/types'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-service'
import { logActivity } from './activity-service'

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

            await logActivity({
                action: 'create',
                entity_type: 'customer',
                entity_id: data[0].id,
                description: `Thêm khách hàng mới: ${data[0].company_name}`
            })

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

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .update(customer)
            .eq('id', id)
            .select()

        if (error) {
            console.error('[updateCustomer] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        revalidatePath(`/customers/${id}`)

        await logActivity({
            action: 'update',
            entity_type: 'customer',
            entity_id: id,
            description: `Cập nhật thông tin khách hàng: ${data[0].company_name}`
        })
        return data[0] as Customer
    } catch (err: any) {
        console.error('[updateCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật khách hàng')
    }
}

export async function deleteCustomer(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[deleteCustomer] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        return true
    } catch (err: any) {
        console.error('[deleteCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa khách hàng')
    }
}

export async function deleteCustomers(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('[deleteCustomers] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        return true
    } catch (err: any) {
        console.error('[deleteCustomers] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều khách hàng')
    }
}

export async function updateCustomersStatus(ids: string[], status: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .update({ status })
            .in('id', ids)

        if (error) {
            console.error('[updateCustomersStatus] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        return true
    } catch (err: any) {
        console.error('[updateCustomersStatus] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật trạng thái nhiều khách hàng')
    }
}

export async function reassignCustomers(ids: string[], userId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .update({ assigned_to: userId })
            .in('id', ids)

        if (error) {
            console.error('[reassignCustomers] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        return true
    } catch (err: any) {
        console.error('[reassignCustomers] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi chuyển người phụ trách nhiều khách hàng')
    }
}
