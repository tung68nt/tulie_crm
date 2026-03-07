'use server'

import { createClient } from '../server'
import { Vendor } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getVendors() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching vendors:', error)
            return []
        }

        return data as Vendor[]
    } catch (err) {
        console.error('Fatal error in getVendors:', err)
        return []
    }
}

export async function getVendorById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching vendor by id:', error)
            return null
        }

        return data as Vendor
    } catch (err) {
        console.error('Fatal error in getVendorById:', err)
        return null
    }
}

export async function createVendor(vendor: Partial<Vendor>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('vendors')
            .insert([vendor])
            .select()
            .single()

        if (error) {
            console.error('Error creating vendor:', error)
            throw error
        }

        revalidatePath('/team/vendors') // Example path
        return data
    } catch (err: any) {
        console.error('Fatal error in createVendor:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo nhà cung cấp')
    }
}
