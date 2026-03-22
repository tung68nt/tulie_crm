'use server'

import { createWorkspaceClient } from '../workspace-client'
import { createClient } from '../server'

// ============================================
// Types for the upgraded workspace
// ============================================

export interface WsTask {
    id: string
    title: string
    description?: string | null
    status: 'backlog' | 'ready' | 'doing' | 'in_review' | 'done' | 'quarantine' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    eisenhower_quadrant?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null
    estimated_effort_hours?: number | null
    actual_effort_hours?: number | null
    assigned_to?: string | null
    created_by?: string | null
    due_date?: string | null
    start_date?: string | null
    completed_at?: string | null
    project_id?: string | null
    cycle_id?: string | null
    crm_project_id?: string | null
    crm_work_item_id?: string | null
    crm_customer_name?: string | null
    crm_order_code?: string | null
    sort_order: number
    category?: string | null
    metadata?: Record<string, any>
    tags?: WsTag[]
    created_at: string
    updated_at: string
}

export interface WsProject {
    id: string
    crm_project_id?: string | null
    name: string
    description?: string | null
    color: string
    status: 'active' | 'completed' | 'archived' | 'on_hold'
    owner_id?: string | null
    task_count: number
    done_count: number
    created_at: string
    updated_at: string
}

export interface WsCycle {
    id: string
    name: string
    description?: string | null
    start_date: string
    end_date: string
    status: 'planning' | 'active' | 'completed' | 'cancelled'
    goals: Array<{ title: string; progress: number }>
    created_by?: string | null
    created_at: string
    updated_at: string
}

export interface WsTag {
    id: string
    name: string
    color: string
}

export interface WsNotification {
    id: string
    user_id: string
    title: string
    content?: string | null
    type: 'info' | 'warning' | 'success' | 'error'
    related_task_id?: string | null
    is_read: boolean
    created_at: string
}

// ============================================
// TASKS — CRUD + Queries
// ============================================

export async function getWsTasks(filters?: {
    status?: string
    assigned_to?: string
    project_id?: string
    cycle_id?: string
    eisenhower?: string
    priority?: string
}) {
    try {
        const ws = await createWorkspaceClient()
        let query = ws
            .from('tasks')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
        if (filters?.project_id) query = query.eq('project_id', filters.project_id)
        if (filters?.cycle_id) query = query.eq('cycle_id', filters.cycle_id)
        if (filters?.eisenhower) query = query.eq('eisenhower_quadrant', filters.eisenhower)
        if (filters?.priority) query = query.eq('priority', filters.priority)

        const { data, error } = await query
        if (error) throw error
        return (data || []) as WsTask[]
    } catch (err) {
        console.error('Error fetching workspace tasks:', err)
        return []
    }
}

export async function getWsTask(id: string) {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw error
        return data as WsTask
    } catch (err) {
        console.error('Error fetching task:', err)
        return null
    }
}

export async function createWsTask(task: Partial<WsTask>) {
    try {
        const ws = await createWorkspaceClient()
        const crm = await createClient()
        const { data: { user } } = await crm.auth.getUser()

        const { data, error } = await ws
            .from('tasks')
            .insert({
                ...task,
                created_by: user?.id,
                assigned_to: task.assigned_to || user?.id,
            })
            .select()
            .single()
        if (error) throw error
        return data as WsTask
    } catch (err) {
        console.error('Error creating task:', err)
        throw err
    }
}

export async function updateWsTask(id: string, updates: Partial<WsTask>) {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data as WsTask
    } catch (err) {
        console.error('Error updating task:', err)
        throw err
    }
}

export async function deleteWsTask(id: string) {
    try {
        const ws = await createWorkspaceClient()
        const { error } = await ws.from('tasks').delete().eq('id', id)
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting task:', err)
        throw err
    }
}

export async function updateWsTaskStatus(id: string, status: WsTask['status']) {
    const updates: Partial<WsTask> = { status }
    if (status === 'done') updates.completed_at = new Date().toISOString()
    if (status === 'doing') updates.start_date = new Date().toISOString()
    return updateWsTask(id, updates)
}

export async function reorderWsTasks(orderedIds: string[]) {
    try {
        const ws = await createWorkspaceClient()
        const updates = orderedIds.map((id, index) =>
            ws.from('tasks').update({ sort_order: index }).eq('id', id)
        )
        await Promise.all(updates)
        return true
    } catch (err) {
        console.error('Error reordering tasks:', err)
        throw err
    }
}

// ============================================
// BOARD — Tasks grouped by status
// ============================================

export async function getWsBoardData(filters?: {
    project_id?: string
    cycle_id?: string
    assigned_to?: string
}) {
    const tasks = await getWsTasks(filters)
    const columns: Record<WsTask['status'], WsTask[]> = {
        backlog: [],
        ready: [],
        doing: [],
        in_review: [],
        done: [],
        quarantine: [],
        cancelled: [],
    }
    tasks.forEach(t => {
        if (columns[t.status]) columns[t.status].push(t)
    })
    return columns
}

// ============================================
// EISENHOWER MATRIX — Tasks grouped by quadrant
// ============================================

export async function getEisenhowerData(userId?: string) {
    try {
        const ws = await createWorkspaceClient()
        let query = ws
            .from('tasks')
            .select('*')
            .not('status', 'in', '("done","cancelled")')
            .not('eisenhower_quadrant', 'is', null)
            .order('sort_order', { ascending: true })

        if (userId) query = query.eq('assigned_to', userId)

        const { data, error } = await query
        if (error) throw error

        const matrix = { Q1: [] as WsTask[], Q2: [] as WsTask[], Q3: [] as WsTask[], Q4: [] as WsTask[] }
        data?.forEach(t => {
            if (t.eisenhower_quadrant && matrix[t.eisenhower_quadrant as keyof typeof matrix]) {
                matrix[t.eisenhower_quadrant as keyof typeof matrix].push(t as WsTask)
            }
        })
        return matrix
    } catch (err) {
        console.error('Error fetching Eisenhower data:', err)
        return { Q1: [], Q2: [], Q3: [], Q4: [] }
    }
}

// ============================================
// WIP LIMITS — Check doing tasks vs limit
// ============================================

export async function getWipStatus(userId: string, wipLimit: number = 3) {
    try {
        const ws = await createWorkspaceClient()
        const { count, error } = await ws
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', userId)
            .eq('status', 'doing')

        if (error) throw error
        return {
            current: count || 0,
            limit: wipLimit,
            exceeded: (count || 0) >= wipLimit,
        }
    } catch (err) {
        console.error('Error checking WIP:', err)
        return { current: 0, limit: wipLimit, exceeded: false }
    }
}

// ============================================
// QUARANTINE ZONE — Tasks needing triage
// ============================================

export async function getQuarantineTasks() {
    return getWsTasks({ status: 'quarantine' })
}

// ============================================
// PROJECTS
// ============================================

export async function getWsProjects(status?: string) {
    try {
        const ws = await createWorkspaceClient()
        let query = ws.from('projects').select('*').order('created_at', { ascending: false })
        if (status) query = query.eq('status', status)

        const { data, error } = await query
        if (error) throw error
        return (data || []) as WsProject[]
    } catch (err) {
        console.error('Error fetching projects:', err)
        return []
    }
}

export async function createWsProject(project: Partial<WsProject>) {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('projects')
            .insert(project)
            .select()
            .single()
        if (error) throw error
        return data as WsProject
    } catch (err) {
        console.error('Error creating project:', err)
        throw err
    }
}

// ============================================
// CYCLES (Sprint management)
// ============================================

export async function getWsCycles(status?: string) {
    try {
        const ws = await createWorkspaceClient()
        let query = ws.from('cycles').select('*').order('start_date', { ascending: false })
        if (status) query = query.eq('status', status)

        const { data, error } = await query
        if (error) throw error
        return (data || []) as WsCycle[]
    } catch (err) {
        console.error('Error fetching cycles:', err)
        return []
    }
}

export async function getActiveCycle() {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('cycles')
            .select('*')
            .eq('status', 'active')
            .limit(1)
            .single()
        if (error && error.code !== 'PGRST116') throw error
        return data as WsCycle | null
    } catch (err) {
        console.error('Error fetching active cycle:', err)
        return null
    }
}

export async function createWsCycle(cycle: Partial<WsCycle>) {
    try {
        const ws = await createWorkspaceClient()
        const crm = await createClient()
        const { data: { user } } = await crm.auth.getUser()

        const { data, error } = await ws
            .from('cycles')
            .insert({ ...cycle, created_by: user?.id })
            .select()
            .single()
        if (error) throw error
        return data as WsCycle
    } catch (err) {
        console.error('Error creating cycle:', err)
        throw err
    }
}

export async function updateWsCycle(id: string, updates: Partial<WsCycle>) {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('cycles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data as WsCycle
    } catch (err) {
        console.error('Error updating cycle:', err)
        throw err
    }
}

// ============================================
// TAGS
// ============================================

export async function getWsTags() {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws.from('tags').select('*').order('name')
        if (error) throw error
        return (data || []) as WsTag[]
    } catch (err) {
        console.error('Error fetching tags:', err)
        return []
    }
}

export async function addTagToTask(taskId: string, tagId: string) {
    try {
        const ws = await createWorkspaceClient()
        const { error } = await ws
            .from('task_tags')
            .insert({ task_id: taskId, tag_id: tagId })
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error adding tag:', err)
        throw err
    }
}

export async function removeTagFromTask(taskId: string, tagId: string) {
    try {
        const ws = await createWorkspaceClient()
        const { error } = await ws
            .from('task_tags')
            .delete()
            .eq('task_id', taskId)
            .eq('tag_id', tagId)
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error removing tag:', err)
        throw err
    }
}

// ============================================
// TASK COMMENTS (workspace schema)
// ============================================

export async function getWsTaskComments(taskId: string) {
    try {
        const ws = await createWorkspaceClient()
        const { data, error } = await ws
            .from('task_comments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true })
        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching comments:', err)
        return []
    }
}

export async function createWsTaskComment(taskId: string, content: string) {
    try {
        const ws = await createWorkspaceClient()
        const crm = await createClient()
        const { data: { user } } = await crm.auth.getUser()

        const { data, error } = await ws
            .from('task_comments')
            .insert({ task_id: taskId, user_id: user?.id, content })
            .select()
            .single()
        if (error) throw error
        return data
    } catch (err) {
        console.error('Error creating comment:', err)
        throw err
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function getWsNotifications(userId: string, unreadOnly = true) {
    try {
        const ws = await createWorkspaceClient()
        let query = ws
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (unreadOnly) query = query.eq('is_read', false)

        const { data, error } = await query
        if (error) throw error
        return (data || []) as WsNotification[]
    } catch (err) {
        console.error('Error fetching notifications:', err)
        return []
    }
}

export async function markNotificationRead(id: string) {
    try {
        const ws = await createWorkspaceClient()
        const { error } = await ws
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error marking notification read:', err)
        return false
    }
}

// ============================================
// DASHBOARD STATS (upgraded)
// ============================================

export async function getWsDashboardStats(userId?: string) {
    try {
        const ws = await createWorkspaceClient()
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        let baseQuery = ws.from('tasks').select('id, status, eisenhower_quadrant, due_date')
        if (userId) baseQuery = baseQuery.eq('assigned_to', userId)

        const { data: allTasks, error } = await baseQuery
        if (error) throw error
        const tasks = allTasks || []

        const doing = tasks.filter(t => t.status === 'doing').length
        const ready = tasks.filter(t => t.status === 'ready').length
        const quarantine = tasks.filter(t => t.status === 'quarantine').length
        const done = tasks.filter(t => t.status === 'done').length
        const overdue = tasks.filter(t =>
            t.due_date && new Date(t.due_date) < now &&
            !['done', 'cancelled'].includes(t.status)
        ).length
        const total = tasks.length

        // Active cycle
        const cycle = await getActiveCycle()

        return {
            doing,
            ready,
            quarantine,
            done,
            overdue,
            total,
            active_cycle: cycle,
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        return { doing: 0, ready: 0, quarantine: 0, done: 0, overdue: 0, total: 0, active_cycle: null }
    }
}

// ============================================
// DATA MIGRATION: public.workspace_tasks → workspace.tasks
// (Run once, then switch CRM pages to new service)
// ============================================

export async function migrateOldWorkspaceTasks() {
    try {
        const crm = await createClient()
        const ws = await createWorkspaceClient()

        // 1. Fetch all old tasks
        const { data: oldTasks, error: fetchErr } = await crm
            .from('workspace_tasks')
            .select('*')

        if (fetchErr) throw fetchErr
        if (!oldTasks?.length) return { migrated: 0 }

        // 2. Map status
        const statusMap: Record<string, WsTask['status']> = {
            todo: 'backlog',
            in_progress: 'doing',
            in_review: 'in_review',
            completed: 'done',
            cancelled: 'cancelled',
        }

        // 3. Insert into workspace.tasks
        const newTasks = oldTasks.map(t => ({
            title: t.title,
            description: t.description,
            status: statusMap[t.status] || 'backlog',
            priority: t.priority || 'medium',
            assigned_to: t.assigned_to,
            created_by: t.created_by,
            due_date: t.due_date,
            start_date: t.start_date,
            completed_at: t.completed_at,
            crm_project_id: t.project_id,
            category: t.category,
            metadata: t.metadata || {},
        }))

        const { data, error: insertErr } = await ws
            .from('tasks')
            .insert(newTasks)
            .select('id')

        if (insertErr) throw insertErr
        return { migrated: data?.length || 0 }
    } catch (err) {
        console.error('Migration error:', err)
        throw err
    }
}
