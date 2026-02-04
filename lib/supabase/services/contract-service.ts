'use server'

import { createClient } from '../server'
import { Contract, ContractMilestone } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getContracts(customerId?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('contracts')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching contracts:', error)
            return []
        }

        return data as Contract[]
    } catch (err) {
        console.error('Fatal error in getContracts:', err)
        return []
    }
}

export async function getContractById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contracts')
            .select('*, customer:customers(*), creator:users(*), milestones:contract_milestones(*), quotation:quotations(id, quote_number)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching contract by id:', error)
            return null
        }

        return data as Contract
    } catch (err) {
        console.error('Fatal error in getContractById:', err)
        return null
    }
}

export async function createContract(contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]) {
    const supabase = await createClient()

    // 1. Insert contract
    const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert([contract])
        .select()
        .single()

    if (contractError) {
        console.error('Error creating contract:', contractError)
        throw contractError
    }

    // 2. Insert milestones
    if (milestones && milestones.length > 0) {
        const contractMilestones = milestones.map(m => ({
            ...m,
            contract_id: contractData.id
        }))

        const { error: milestoneError } = await supabase
            .from('contract_milestones')
            .insert(contractMilestones)

        if (milestoneError) {
            console.error('Error creating milestones:', milestoneError)
            throw milestoneError
        }
    }

    revalidatePath('/contracts')
    return contractData
}

export async function updateContract(id: string, contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]) {
    try {
        const supabase = await createClient()

        // 1. Update contract
        const { error: contractError } = await supabase
            .from('contracts')
            .update(contract)
            .eq('id', id)

        if (contractError) {
            console.error('Error updating contract:', contractError)
            throw contractError
        }

        // 2. Refresh milestones
        const { error: deleteError } = await supabase
            .from('contract_milestones')
            .delete()
            .eq('contract_id', id)

        if (deleteError) {
            console.error('Error deleting old milestones:', deleteError)
            throw deleteError
        }

        if (milestones && milestones.length > 0) {
            const contractMilestones = milestones.map(m => ({
                ...m,
                id: undefined,
                contract_id: id
            }))

            const { error: milestoneError } = await supabase
                .from('contract_milestones')
                .insert(contractMilestones)

            if (milestoneError) {
                console.error('Error inserting new milestones:', milestoneError)
                throw milestoneError
            }
        }

        revalidatePath('/contracts')
        revalidatePath(`/contracts/${id}`)
        return true
    } catch (err: any) {
        console.error('Fatal error in updateContract:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật hợp đồng')
    }
}

export async function deleteContract(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting contract:', error)
            throw error
        }

        revalidatePath('/contracts')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContract:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa hợp đồng')
    }
}

export async function deleteContracts(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('contracts')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting contracts:', error)
            throw error
        }

        revalidatePath('/contracts')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContracts:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều hợp đồng')
    }
}
