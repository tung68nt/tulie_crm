'use server'
import { createClient } from '../server'
import { Notification, NotificationType, NotificationSeverity } from '@/types'

// ============================================
// CORE CRUD
// ============================================

export async function getNotifications(userId?: string, limit = 20) {
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
            return []
        }

        // Map DB fields to interface (is_read → read)
        return (data || []).map(mapDbToNotification)
    } catch (err) {
        console.error('Fatal error in getNotifications:', err)
        return []
    }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'> & { severity?: NotificationSeverity }) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: notification.user_id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link || null,
                severity: notification.severity || getSeverityForType(notification.type),
                metadata: notification.metadata || null,
                read: false,
                source: 'crm',
            }])
            .select()

        if (error) {
            console.error('Error creating notification:', error)
            return null
        }

        return data?.[0] ? mapDbToNotification(data[0]) : null
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

        if (error) console.error('Error marking notification as read:', error)
    } catch (err) {
        console.error('Fatal error in markNotificationAsRead:', err)
    }
}

export async function markAllAsRead(userId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false)

        if (error) console.error('Error marking all as read:', error)
    } catch (err) {
        console.error('Fatal error in markAllAsRead:', err)
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
            return 0
        }

        return count || 0
    } catch (err) {
        console.error('Fatal error in getUnreadCount:', err)
        return 0
    }
}

// ============================================
// WORKSPACE NOTIFICATIONS MERGE
// ============================================

export async function getWorkspaceNotifications(userId: string, limit = 10): Promise<Notification[]> {
    try {
        const supabase = await createClient()

        // Query workspace.notifications via raw SQL since cross-schema queries
        // are not natively supported by Supabase client .from()
        const { data, error } = await supabase.rpc('get_workspace_notifications', {
            p_user_id: userId,
            p_limit: limit,
        })

        if (error) {
            // RPC function may not exist yet — that's OK
            return []
        }

        return (data || []).map((ws: any) => ({
            id: `ws-${ws.id}`,
            user_id: ws.user_id,
            type: 'workspace' as NotificationType,
            title: ws.title,
            message: ws.content || '',
            link: ws.related_task_id ? `/workspace/tasks/${ws.related_task_id}` : undefined,
            read: ws.is_read ?? false,
            severity: (ws.type || 'info') as NotificationSeverity,
            source: 'workspace' as const,
            created_at: ws.created_at,
        }))
    } catch {
        return []
    }
}

export async function getMergedNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const [crmNotifs, wsNotifs] = await Promise.all([
        getNotifications(userId, limit),
        getWorkspaceNotifications(userId, limit),
    ])

    // Merge and sort by time descending
    return [...crmNotifs, ...wsNotifs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
}

export async function getMergedUnreadCount(userId: string): Promise<number> {
    try {
        const supabase = await createClient()
        const crmCount = await getUnreadCount(userId)

        // Try workspace unread count
        let wsCount = 0
        try {
            const wsResult = await supabase.schema('workspace')
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            wsCount = wsResult.count || 0
        } catch { /* workspace schema not available */ }

        return crmCount + wsCount
    } catch {
        return 0
    }
}

// ============================================
// EVENT-SPECIFIC NOTIFICATION HELPERS
// ============================================

/** Báo giá được khách hàng xem */
export async function notifyQuotationViewed(quotation: {
    id: string, quotation_number?: string, title?: string,
    customer?: { company_name: string } | null,
    created_by: string
}) {
    const customerName = quotation.customer?.company_name || 'Khách hàng'
    const quoteRef = quotation.quotation_number || quotation.title || quotation.id

    return createNotification({
        user_id: quotation.created_by,
        type: 'quotation_viewed',
        title: 'Báo giá được xem',
        message: `${customerName} vừa xem báo giá ${quoteRef}`,
        link: `/quotations/${quotation.id}`,
        severity: 'info',
        metadata: { quotation_id: quotation.id, customer_name: customerName },
    })
}

/** Báo giá được chấp nhận */
export async function notifyQuotationAccepted(quotation: {
    id: string, quotation_number?: string, title?: string,
    customer?: { company_name: string } | null,
    created_by: string, total_amount?: number
}) {
    const customerName = quotation.customer?.company_name || 'Khách hàng'
    const quoteRef = quotation.quotation_number || quotation.title || ''
    const amount = quotation.total_amount
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.total_amount)
        : ''

    return createNotification({
        user_id: quotation.created_by,
        type: 'quotation_accepted',
        title: '🎉 Báo giá được chấp nhận',
        message: `${customerName} đã chấp nhận báo giá ${quoteRef}${amount ? ` — ${amount}` : ''}`,
        link: `/quotations/${quotation.id}`,
        severity: 'success',
        metadata: { quotation_id: quotation.id, customer_name: customerName, amount: quotation.total_amount },
    })
}

/** Báo giá bị từ chối */
export async function notifyQuotationRejected(quotation: {
    id: string, quotation_number?: string, title?: string,
    customer?: { company_name: string } | null,
    created_by: string
}) {
    const customerName = quotation.customer?.company_name || 'Khách hàng'
    const quoteRef = quotation.quotation_number || quotation.title || ''

    return createNotification({
        user_id: quotation.created_by,
        type: 'quotation_rejected',
        title: 'Báo giá bị từ chối',
        message: `${customerName} đã từ chối báo giá ${quoteRef}`,
        link: `/quotations/${quotation.id}`,
        severity: 'warning',
        metadata: { quotation_id: quotation.id, customer_name: customerName },
    })
}

/** Hợp đồng được ký */
export async function notifyContractSigned(contract: {
    id: string, contract_number?: string, title?: string,
    customer?: { company_name: string } | null,
    created_by: string, total_amount?: number
}) {
    const customerName = contract.customer?.company_name || 'Khách hàng'

    return createNotification({
        user_id: contract.created_by,
        type: 'contract_signed',
        title: '📝 Hợp đồng được ký',
        message: `${customerName} đã ký hợp đồng ${contract.contract_number || contract.title || ''}`,
        link: `/contracts/${contract.id}`,
        severity: 'success',
        metadata: { contract_id: contract.id, customer_name: customerName },
    })
}

/** Nhận thanh toán */
export async function notifyPaymentReceived(
    userId: string,
    amount: number,
    orderCode: string,
    customerName?: string,
    orderId?: string,
) {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

    return createNotification({
        user_id: userId,
        type: 'payment_received',
        title: '💰 Nhận thanh toán',
        message: `${formattedAmount} — ${customerName || orderCode}`,
        link: orderId ? `/studio/orders/${orderId}` : '/finance/transactions',
        severity: 'success',
        metadata: { amount, order_code: orderCode, customer_name: customerName },
    })
}

/** Hóa đơn quá hạn */
export async function notifyInvoiceOverdue(
    userId: string,
    invoice: { id: string, invoice_number: string, total_amount: number, due_date: string },
    customerName?: string,
) {
    const daysOverdue = Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000)
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.total_amount)

    return createNotification({
        user_id: userId,
        type: 'invoice_overdue',
        title: '⚠️ Hóa đơn quá hạn',
        message: `${invoice.invoice_number} — ${formattedAmount} (quá hạn ${daysOverdue} ngày)${customerName ? ` — ${customerName}` : ''}`,
        link: `/invoices/${invoice.id}`,
        severity: 'warning',
        metadata: { invoice_id: invoice.id, days_overdue: daysOverdue, amount: invoice.total_amount },
    })
}

/** Deal thắng */
export async function notifyDealWon(deal: {
    id: string, title: string,
    customer?: { company_name: string } | null,
    assigned_to?: string, created_by: string, budget?: number
}) {
    const userId = deal.assigned_to || deal.created_by
    const customerName = deal.customer?.company_name || ''

    return createNotification({
        user_id: userId,
        type: 'deal_won',
        title: '🏆 Deal thắng!',
        message: `${deal.title}${customerName ? ` — ${customerName}` : ''}`,
        link: `/deals/${deal.id}`,
        severity: 'success',
        metadata: { deal_id: deal.id, customer_name: customerName, budget: deal.budget },
    })
}

/** Deal thua */
export async function notifyDealLost(deal: {
    id: string, title: string,
    customer?: { company_name: string } | null,
    assigned_to?: string, created_by: string
}) {
    const userId = deal.assigned_to || deal.created_by
    const customerName = deal.customer?.company_name || ''

    return createNotification({
        user_id: userId,
        type: 'deal_lost',
        title: 'Deal không thành công',
        message: `${deal.title}${customerName ? ` — ${customerName}` : ''}`,
        link: `/deals/${deal.id}`,
        severity: 'warning',
        metadata: { deal_id: deal.id, customer_name: customerName },
    })
}

/** Task được giao */
export async function notifyTaskAssigned(
    userId: string,
    task: { id: string, title: string },
    assignerName?: string,
) {
    return createNotification({
        user_id: userId,
        type: 'task_assigned',
        title: '📋 Task mới được giao',
        message: `${task.title}${assignerName ? ` — bởi ${assignerName}` : ''}`,
        link: `/workspace/tasks/${task.id}`,
        severity: 'info',
        metadata: { task_id: task.id },
    })
}

// ============================================
// HELPERS
// ============================================

function getSeverityForType(type: NotificationType): NotificationSeverity {
    switch (type) {
        case 'quotation_accepted':
        case 'contract_signed':
        case 'payment_received':
        case 'deal_won':
        case 'task_completed':
            return 'success'
        case 'invoice_overdue':
        case 'quotation_rejected':
        case 'deal_lost':
        case 'task_overdue':
        case 'low_margin':
        case 'cash_flow_alert':
            return 'warning'
        case 'new_customer':
        case 'quotation_viewed':
        case 'quotation_sent':
        case 'task_assigned':
        case 'workspace':
        case 'system':
        default:
            return 'info'
    }
}

function mapDbToNotification(row: any): Notification {
    return {
        id: row.id,
        user_id: row.user_id,
        type: row.type || 'system',
        title: row.title,
        message: row.message || row.content || '',
        link: row.link,
        read: row.read ?? row.is_read ?? false,
        severity: row.severity || getSeverityForType(row.type || 'system'),
        metadata: row.metadata,
        source: row.source || 'crm',
        created_at: row.created_at,
    }
}
