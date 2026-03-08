'use server'

import { createClient } from '../server'
import { Deal, DealStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity-service'

export async function getDeals(customerId?: string, brand?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('deals')
            .select('*, customer:customers(id, company_name), assigned_user:users!assigned_to(*)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (brand) {
            query = query.eq('brand', brand)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching deals:', error)
            return []
        }

        return data as Deal[]
    } catch (err) {
        console.error('Fatal error in getDeals:', err)
        return []
    }
}

export async function getDealById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('deals')
            .select('*, customer:customers(*), assigned_user:users!assigned_to(*), creator:users!created_by(*), quotations(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching deal by id:', error)
            return null
        }

        return data as Deal
    } catch (err) {
        console.error('Fatal error in getDealById:', err)
        return null
    }
}

export async function createDeal(deal: Partial<Deal>) {
    try {
        const supabase = await createClient()

        // Get current user id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data, error } = await supabase
            .from('deals')
            .insert([{
                ...deal,
                created_by: user.id
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating deal:', error)
            throw error
        }

        revalidatePath('/deals')

        await logActivity({
            action: 'create',
            entity_type: 'deal',
            entity_id: data.id,
            description: `Tạo cơ hội mới: ${data.title}`
        })

        return data as Deal
    } catch (err) {
        console.error('Service error creating deal:', err)
        throw err
    }
}

export async function updateDeal(id: string, deal: Partial<Deal>) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('deals')
            .update(deal)
            .eq('id', id)

        if (error) {
            console.error('Error updating deal:', error)
            throw error
        }

        await logActivity({
            action: 'update',
            entity_type: 'deal',
            entity_id: id,
            description: `Cập nhật cơ hội: ${deal.title || id}`,
            metadata: deal
        })

        revalidatePath('/deals')
        revalidatePath(`/deals/${id}`)
        return true
    } catch (err) {
        console.error('Service error updating deal:', err)
        throw err
    }
}

export async function updateDealStatus(id: string, status: DealStatus) {
    return updateDeal(id, { status })
}

export async function deleteDeal(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting deal:', error)
            throw error
        }

        revalidatePath('/deals')
        return true
    } catch (err) {
        console.error('Service error deleting deal:', err)
        throw err
    }
}
