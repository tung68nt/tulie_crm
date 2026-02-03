'use server'
import { createClient } from '../server'
import { Contract, ContractMilestone } from '@/types'

// ... (lines 4-25 unchanged)

export async function getContractById(id: string) {
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

    return contractData
}
