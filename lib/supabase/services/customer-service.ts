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
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()

        if (error) {
            console.error('Database error in createCustomer:', error)
            throw error
        }

        if (!data || data.length === 0) {
            throw new Error('Không thể tạo khách hàng, không có dữ liệu trả về')
        }

        return data[0]
    } catch (err: any) {
        console.error('Fatal error in createCustomer:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo khách hàng')
    }
}
