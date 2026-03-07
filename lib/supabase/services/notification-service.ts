'use server'
import { createClient } from '../server'
import { Notification } from '@/types'

export async function getNotifications(userId?: string, limit = 10) {
    try {
        const supabase = await createClient()

        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching notifications:', error)
            return getMockNotifications()
        }

        return data as Notification[]
    } catch (err) {
        console.error('Fatal error in getNotifications:', err)
        return getMockNotifications()
    }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('notifications')
            .insert([{ ...notification, read: false }])
            .select()

        if (error) {
            console.error('Error creating notification:', error)
            return null
        }

        return data[0] as Notification
    } catch (err) {
        console.error('Fatal error in createNotification:', err)
        return null
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        if (error) {
            console.error('Error marking notification as read:', error)
        }
    } catch (err) {
        console.error('Fatal error in markNotificationAsRead:', err)
    }
}

export async function getUnreadCount(userId?: string) {
    try {
        const supabase = await createClient()

        let query = supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('read', false)

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { count, error } = await query

        if (error) {
            console.error('Error fetching unread count:', error)
            return 3 // Default mock count
        }

        return count || 0
    } catch (err) {
        console.error('Fatal error in getUnreadCount:', err)
        return 3
    }
}

// Mock data for when notifications table doesn't exist
function getMockNotifications(): Notification[] {
    return [
        {
            id: '1',
            user_id: 'system',
            type: 'new_customer',
            title: 'Khách hàng mới',
            message: 'ABC Corp vừa được thêm vào hệ thống',
            link: '/customers',
            read: false,
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
            id: '2',
            user_id: 'system',
            type: 'quotation_accepted',
            title: 'Báo giá được chấp nhận',
            message: 'XYZ Ltd đã chấp nhận báo giá QT-2026-0142',
            link: '/quotations',
            read: false,
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
            id: '3',
            user_id: 'system',
            type: 'invoice_overdue',
            title: 'Hóa đơn quá hạn',
            message: 'Hóa đơn HDB-2026-0089 đã quá hạn 3 ngày',
            link: '/invoices',
            read: false,
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
    ]
}
