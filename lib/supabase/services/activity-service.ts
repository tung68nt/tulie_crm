'use server'
import { createClient } from '../server'
import { ActivityLog } from '@/types'

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'status_change'
    | 'view'
    | 'export'
    | 'login'
    | 'permission_change'
    | 'bulk_delete'
    | 'reassign'
    | 'send_email'
    | 'convert'
    | 'accept'
    | 'update_tasks'

export type AuditEntityType =
    | 'customer'
    | 'lead'
    | 'deal'
    | 'quotation'
    | 'contract'
    | 'project'
    | 'invoice'
    | 'retail_order'
    | 'order'
    | 'user'
    | 'template'
    | 'settings'
    | 'work_item'
    | 'ticket'

export interface AuditLogEntry {
    action: AuditAction
    entity_type: AuditEntityType
    entity_id: string
    description: string
    metadata?: {
        old_values?: Record<string, unknown>
        new_values?: Record<string, unknown>
        ip_address?: string
        user_agent?: string
        affected_count?: number
        [key: string]: unknown
    }
}

// ============================================
// CORE LOG FUNCTION
// ============================================

export async function logActivity(entry: AuditLogEntry) {
    try {
        const supabase = await createClient()
        const user = (await supabase.auth.getUser()).data.user

        const { error } = await supabase
            .from('activity_log')
            .insert([{
                user_id: user?.id,
                action: entry.action,
                entity_type: entry.entity_type,
                entity_id: entry.entity_id,
                details: {
                    description: entry.description,
                    ...(entry.metadata || {})
                },
                created_at: new Date().toISOString()
            }])

        if (error) console.error('[AuditLog] Error:', error)
        return !error
    } catch (err) {
        // Audit logging should NEVER break the main flow
        console.error('[AuditLog] Fatal error:', err)
        return false
    }
}

// ============================================
// CONVENIENCE HELPERS
// ============================================

/** Log a destructive action (delete, bulk delete) */
export async function logDestructiveAction(
    entity_type: AuditEntityType,
    entity_id: string,
    action: 'delete' | 'bulk_delete',
    details?: { affected_count?: number; entity_name?: string }
) {
    return logActivity({
        action,
        entity_type,
        entity_id,
        description: `${action === 'bulk_delete' ? 'Xóa hàng loạt' : 'Xóa'} ${entity_type}: ${details?.entity_name || entity_id}`,
        metadata: details ? { affected_count: details.affected_count } : undefined,
    })
}

/** Log a status change */
export async function logStatusChange(
    entity_type: AuditEntityType,
    entity_id: string,
    old_status: string,
    new_status: string,
    entity_name?: string
) {
    return logActivity({
        action: 'status_change',
        entity_type,
        entity_id,
        description: `Đổi trạng thái ${entity_type}: ${entity_name || entity_id} (${old_status} → ${new_status})`,
        metadata: { old_values: { status: old_status }, new_values: { status: new_status } },
    })
}

/** Log a reassignment */
export async function logReassign(
    entity_type: AuditEntityType,
    entity_ids: string[],
    new_assignee_id: string,
) {
    return logActivity({
        action: 'reassign',
        entity_type,
        entity_id: entity_ids[0],
        description: `Chuyển ${entity_ids.length} ${entity_type} cho user ${new_assignee_id}`,
        metadata: { affected_count: entity_ids.length, new_values: { assigned_to: new_assignee_id } },
    })
}

// ============================================
// QUERY FUNCTIONS
// ============================================

export async function getRecentActivities(limit = 10) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('activity_log')
            .select('*, user:users(*)')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('[AuditLog] Error fetching:', error)
            return []
        }

        return data as ActivityLog[]
    } catch (err) {
        console.error('[AuditLog] Fatal error:', err)
        return []
    }
}

export async function getEntityAuditLog(entity_type: string, entity_id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('activity_log')
            .select('*, user:users(id, full_name, email, avatar_url)')
            .eq('entity_type', entity_type)
            .eq('entity_id', entity_id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('[AuditLog] Error fetching entity log:', error)
            return []
        }

        return data
    } catch (err) {
        console.error('[AuditLog] Fatal error:', err)
        return []
    }
}
