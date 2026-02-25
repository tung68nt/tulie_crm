'use server'
import { createClient } from '../server'
import { Contact } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getContactsByCustomerId(customerId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getContactsByCustomerId] Error:', error)
            return []
        }

        return data as Contact[]
    } catch (err) {
        console.error('[getContactsByCustomerId] Fatal error:', err)
        return []
    }
}

export async function createContact(contact: Partial<Contact>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contacts')
            .insert([contact])
            .select()

        if (error) {
            console.error('[createContact] Error:', error)
            throw error
        }

        if (data && data.length > 0) {
            revalidatePath(`/customers/${contact.customer_id}`)
            return data[0] as Contact
        }

        throw new Error('Không có dữ liệu trả về sau khi tạo liên hệ')
    } catch (err: any) {
        console.error('[createContact] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo liên hệ')
    }
}

export async function updateContact(id: string, contact: Partial<Contact>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contacts')
            .update(contact)
            .eq('id', id)
            .select()

        if (error) {
            console.error('[updateContact] Error:', error)
            throw error
        }

        if (data && data.length > 0) {
            revalidatePath(`/customers/${data[0].customer_id}`)
            return data[0] as Contact
        }

        throw new Error('Không có dữ liệu trả về sau khi cập nhật liên hệ')
    } catch (err: any) {
        console.error('[updateContact] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật liên hệ')
    }
}

export async function deleteContact(id: string, customerId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[deleteContact] Error:', error)
            throw error
        }

        revalidatePath(`/customers/${customerId}`)
        return true
    } catch (err: any) {
        console.error('[deleteContact] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa liên hệ')
    }
}
