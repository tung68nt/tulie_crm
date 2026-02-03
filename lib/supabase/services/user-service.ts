'use server'
import { createClient } from '../server'
import { User } from '@/types'

export async function getUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data as User[]
}

export async function getUserById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching user by id:', error)
        return null
    }

    return data as User
}

export async function updateUser(id: string, user: Partial<User>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getTeamMetrics() {
    const supabase = await createClient()

    // In a real app, this would be a complex aggregation or a RPC call
    // For now, let's fetch users and join with contracts/customers
    const { data: users, error } = await supabase
        .from('users')
        .select(`
            id,
            full_name,
            email,
            role,
            avatar_url,
            is_active,
            customers:customers(count),
            contracts:contracts(count, total_amount)
        `)

    if (error) {
        console.error('Error fetching team metrics:', error)
        return []
    }

    return users.map(user => {
        const contractsCount = user.contracts?.length || 0
        const revenue = user.contracts?.reduce((sum: number, c: { total_amount: number }) => sum + (c.total_amount || 0), 0) || 0

        return {
            ...user,
            customers: user.customers?.length || 0, // count is returned as array if not head:true
            contracts: contractsCount,
            revenue: revenue,
            target: 500000000, // Placeholder target
        }
    })
}
