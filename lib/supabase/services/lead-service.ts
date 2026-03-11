'use server'

import { createClient } from '../server'
import { revalidatePath } from 'next/cache'

export interface Lead {
    id: string
    full_name: string
    company_name: string | null
    phone: string
    email: string | null
    business_type: string | null
    message: string | null
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    source: string
    notes: string | null
    created_at: string
    updated_at: string
}

export async function getLeads(): Promise<Lead[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leads:', error)
        return []
    }
    return data || []
}

export async function createLead(lead: {
    full_name: string
    company_name?: string
    phone: string
    email?: string
    business_type?: string
    message?: string
    source?: string
}): Promise<Lead | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .insert({
            ...lead,
            status: 'new',
            source: lead.source || 'landing_page',
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating lead:', error)
        throw error
    }
    revalidatePath('/leads')
    return data
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating lead:', error)
        throw error
    }
    revalidatePath('/leads')
    return data
}

export async function deleteLead(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lead:', error)
        throw error
    }
    revalidatePath('/leads')
}
