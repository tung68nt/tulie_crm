import { createClient } from '../server'
import { ActivityLog } from '@/types'

export async function getRecentActivities(limit = 10) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('activity_log')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching activities:', error)
        return []
    }

    return data as ActivityLog[]
}
