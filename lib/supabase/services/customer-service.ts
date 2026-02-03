import { createClient } from '../server'
import { Customer } from '@/types'

export async function getCustomers() {
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
}

export async function getCustomerById(id: string) {
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
}

export async function createCustomer(customer: Partial<Customer>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()

    if (error) throw error
    return data[0]
}
