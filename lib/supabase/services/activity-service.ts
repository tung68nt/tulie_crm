'use server'
import { createClient } from '../server'
import { ActivityLog } from '@/types'

export async function logActivity({
    action,
    entity_type,
    entity_id,
    description,
    metadata
}: {
    action: string,
    entity_type: string,
    entity_id: string,
    description: string,
    metadata?: any
}) {
    try {
        const supabase = await createClient()
        const user = (await supabase.auth.getUser()).data.user

        const { error } = await supabase
            .from('activity_log')
            .insert([{
                user_id: user?.id,
                action,
                entity_type,
                entity_id,
                description,
                metadata,
                created_at: new Date().toISOString()
            }])

        if (error) console.error('Error logging activity:', error)
        return !error
    } catch (err) {
        console.error('Fatal error in logActivity:', err)
        return false
    }
}

export async function getRecentActivities(limit = 10) {
    try {
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
    } catch (err) {
        console.error('Fatal error in getRecentActivities:', err)
        return []
    }
}
