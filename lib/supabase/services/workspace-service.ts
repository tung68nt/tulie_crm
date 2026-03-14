'use server'

import { createClient } from '../server'
import {
    WorkspaceTask,
    WorkspaceAlert,
    RevenueProgress,
    WorkspaceDayOverview,
    WorkspaceWeekOverview,
} from '@/types'

// ============================================
// WORKSPACE TASK CRUD
// ============================================

export async function getWorkspaceTasks(filters?: {
    assigned_to?: string
    status?: string
    project_id?: string
}) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('workspace_tasks')
            .select('*, assigned_user:users!workspace_tasks_assigned_to_fkey(*), creator:users!workspace_tasks_created_by_fkey(*)')
            .order('due_date', { ascending: true, nullsFirst: false })

        if (filters?.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to)
        }
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }
        if (filters?.project_id) {
            query = query.eq('project_id', filters.project_id)
        }

        const { data, error } = await query
        if (error) throw error
        return data as WorkspaceTask[]
    } catch (err) {
        console.error('Error fetching workspace tasks:', err)
        return []
    }
}

export async function createWorkspaceTask(task: Partial<WorkspaceTask>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('workspace_tasks')
            .insert([{
                ...task,
                created_by: user?.id,
                assigned_to: task.assigned_to || user?.id,
            }])
            .select()
            .single()

        if (error) throw error
        return data as WorkspaceTask
    } catch (err) {
        console.error('Error creating workspace task:', err)
        throw err
    }
}

export async function updateWorkspaceTask(id: string, task: Partial<WorkspaceTask>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('workspace_tasks')
            .update(task)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as WorkspaceTask
    } catch (err) {
        console.error('Error updating workspace task:', err)
        throw err
    }
}

export async function deleteWorkspaceTask(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('workspace_tasks')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting workspace task:', err)
        throw err
    }
}

// ============================================
// WORKSPACE DASHBOARD QUERIES
// ============================================

/**
 * Get today's overview: tasks due today, overdue, upcoming
 */
export async function getMyTodayOverview(userId: string): Promise<WorkspaceDayOverview> {
    try {
        const supabase = await createClient()
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
        const threeDaysOut = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3).toISOString()

        // Tasks due today
        const { data: todayTasks } = await supabase
            .from('workspace_tasks')
            .select('*, assigned_user:users!workspace_tasks_assigned_to_fkey(*)')
            .eq('assigned_to', userId)
            .gte('due_date', todayStart)
            .lt('due_date', todayEnd)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('priority', { ascending: false })

        // Overdue tasks
        const { data: overdueTasks } = await supabase
            .from('workspace_tasks')
            .select('*, assigned_user:users!workspace_tasks_assigned_to_fkey(*)')
            .eq('assigned_to', userId)
            .lt('due_date', todayStart)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('due_date', { ascending: true })

        // Upcoming (next 3 days)
        const { data: upcomingTasks } = await supabase
            .from('workspace_tasks')
            .select('*, assigned_user:users!workspace_tasks_assigned_to_fkey(*)')
            .eq('assigned_to', userId)
            .gte('due_date', todayEnd)
            .lt('due_date', threeDaysOut)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('due_date', { ascending: true })

        return {
            today_tasks: (todayTasks || []) as WorkspaceTask[],
            overdue_tasks: (overdueTasks || []) as WorkspaceTask[],
            upcoming_deadlines: (upcomingTasks || []) as WorkspaceTask[],
        }
    } catch (err) {
        console.error('Error fetching today overview:', err)
        return { today_tasks: [], overdue_tasks: [], upcoming_deadlines: [] }
    }
}

/**
 * Get this week's overview with milestones
 */
export async function getMyWeekOverview(userId: string): Promise<WorkspaceWeekOverview> {
    try {
        const supabase = await createClient()
        const now = new Date()
        const dayOfWeek = now.getDay() || 7 // Monday = 1
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1).toISOString()
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek) + 1).toISOString()

        // Tasks due this week
        const { data: weekTasks } = await supabase
            .from('workspace_tasks')
            .select('*, assigned_user:users!workspace_tasks_assigned_to_fkey(*)')
            .eq('assigned_to', userId)
            .gte('due_date', weekStart)
            .lt('due_date', weekEnd)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('due_date', { ascending: true })

        // Milestones due this week (from projects I'm assigned to)
        const { data: milestones } = await supabase
            .from('contract_milestones')
            .select('*, project:projects!project_id(*)')
            .gte('due_date', weekStart)
            .lt('due_date', weekEnd)
            .neq('status', 'completed')

        return {
            week_tasks: (weekTasks || []) as WorkspaceTask[],
            milestone_deadlines: (milestones || []) as any[],
        }
    } catch (err) {
        console.error('Error fetching week overview:', err)
        return { week_tasks: [], milestone_deadlines: [] }
    }
}

/**
 * Get revenue progress vs target for current period
 */
export async function getRevenueProgress(period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<RevenueProgress> {
    try {
        const supabase = await createClient()
        const now = new Date()

        let periodStart: Date
        let periodEnd: Date
        let periodLabel: string

        if (period === 'monthly') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            periodLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
        } else if (period === 'quarterly') {
            const quarter = Math.floor(now.getMonth() / 3)
            periodStart = new Date(now.getFullYear(), quarter * 3, 1)
            periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
            periodLabel = `Q${quarter + 1}/${now.getFullYear()}`
        } else {
            periodStart = new Date(now.getFullYear(), 0, 1)
            periodEnd = new Date(now.getFullYear(), 11, 31)
            periodLabel = `Năm ${now.getFullYear()}`
        }

        // Get revenue target
        const { data: target } = await supabase
            .from('revenue_targets')
            .select('*')
            .eq('period_type', period)
            .gte('period_start', periodStart.toISOString().split('T')[0])
            .lte('period_end', periodEnd.toISOString().split('T')[0])
            .single()

        // Get actual revenue from paid invoices in period
        const { data: invoices } = await supabase
            .from('invoices')
            .select('paid_amount')
            .eq('type', 'output')
            .gte('issue_date', periodStart.toISOString())
            .lte('issue_date', periodEnd.toISOString())

        const actualRevenue = invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0
        const targetAmount = target?.target_amount || 0
        const percentage = targetAmount > 0 ? Math.round((actualRevenue / targetAmount) * 100) : 0

        return {
            target: target || null,
            actual: actualRevenue,
            percentage,
            period_label: periodLabel,
        }
    } catch (err) {
        console.error('Error fetching revenue progress:', err)
        return { target: null, actual: 0, percentage: 0, period_label: '' }
    }
}

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================

/**
 * Get workspace alerts: overdue tasks, stale proposals, unchecked projects, pending invoices
 */
export async function getWorkspaceAlerts(userId?: string): Promise<WorkspaceAlert[]> {
    try {
        const supabase = await createClient()
        const alerts: WorkspaceAlert[] = []
        const now = new Date()
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

        // 1. Overdue workspace tasks
        let overdueQuery = supabase
            .from('workspace_tasks')
            .select('id, title, due_date')
            .lt('due_date', now.toISOString())
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .limit(10)

        if (userId) {
            overdueQuery = overdueQuery.eq('assigned_to', userId)
        }

        const { data: overdueTasks } = await overdueQuery

        overdueTasks?.forEach(task => {
            alerts.push({
                id: `overdue-${task.id}`,
                type: 'overdue_task',
                severity: 'danger',
                title: 'Task quá hạn',
                message: task.title,
                link: `/workspace`,
                entity_id: task.id,
                created_at: task.due_date,
            })
        })

        // 2. Stale proposals (quotations sent > 3 days, no response)
        const { data: staleQuotations } = await supabase
            .from('quotations')
            .select('id, quotation_number, customer:customers(company_name), created_at')
            .eq('status', 'sent')
            .lt('created_at', threeDaysAgo)
            .limit(10)

        staleQuotations?.forEach(q => {
            const customerName = (q.customer as any)?.company_name || 'Không rõ'
            alerts.push({
                id: `stale-proposal-${q.id}`,
                type: 'stale_proposal',
                severity: 'warning',
                title: 'Báo giá chưa phản hồi',
                message: `${q.quotation_number} — ${customerName}`,
                link: `/quotations/${q.id}`,
                entity_id: q.id,
                created_at: q.created_at,
            })
        })

        // 3. Projects with no updates > 7 days
        const { data: staleProjects } = await supabase
            .from('projects')
            .select('id, title, updated_at')
            .in('status', ['todo', 'in_progress'])
            .lt('updated_at', sevenDaysAgo)
            .limit(10)

        staleProjects?.forEach(proj => {
            alerts.push({
                id: `stale-project-${proj.id}`,
                type: 'unchecked_project',
                severity: 'warning',
                title: 'Dự án chưa cập nhật',
                message: `${proj.title} — chưa cập nhật > 7 ngày`,
                link: `/projects/${proj.id}`,
                entity_id: proj.id,
                created_at: proj.updated_at,
            })
        })

        // 4. Pending invoices (B2B, sent but not paid)
        const { data: pendingInvoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount, due_date')
            .eq('type', 'output')
            .in('status', ['sent', 'overdue'])
            .limit(10)

        pendingInvoices?.forEach(inv => {
            const isOverdue = inv.due_date && new Date(inv.due_date) < now
            alerts.push({
                id: `invoice-${inv.id}`,
                type: 'pending_invoice',
                severity: isOverdue ? 'danger' : 'warning',
                title: isOverdue ? 'Hoá đơn quá hạn' : 'Hoá đơn chờ thanh toán',
                message: `${inv.invoice_number} — ${(inv.total_amount || 0).toLocaleString('vi-VN')}₫`,
                link: `/invoices/${inv.id}`,
                entity_id: inv.id,
                created_at: inv.due_date || now.toISOString(),
            })
        })

        // 5. Milestones due in 3 days
        const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        const { data: upcomingMilestones } = await supabase
            .from('contract_milestones')
            .select('id, name, due_date, project:projects!project_id(title)')
            .gte('due_date', now.toISOString())
            .lte('due_date', threeDaysOut)
            .neq('status', 'completed')
            .limit(10)

        upcomingMilestones?.forEach(ms => {
            const projectTitle = (ms.project as any)?.title || ''
            alerts.push({
                id: `milestone-${ms.id}`,
                type: 'missed_milestone',
                severity: 'info',
                title: 'Milestone sắp đến hạn',
                message: `${ms.name}${projectTitle ? ` — ${projectTitle}` : ''}`,
                link: `/projects`,
                entity_id: ms.id,
                created_at: ms.due_date,
            })
        })

        // Sort by severity (danger first) then by date
        const severityOrder = { danger: 0, warning: 1, info: 2 }
        return alerts.sort((a, b) => {
            const sevDiff = severityOrder[a.severity] - severityOrder[b.severity]
            if (sevDiff !== 0) return sevDiff
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
    } catch (err) {
        console.error('Error fetching workspace alerts:', err)
        return []
    }
}

/**
 * Get month summary stats for workspace dashboard
 */
export async function getMonthSummary(userId?: string) {
    try {
        const supabase = await createClient()
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

        // Count tasks by status for this month
        let tasksQuery = supabase
            .from('workspace_tasks')
            .select('status')
            .gte('created_at', monthStart)
            .lte('created_at', monthEnd)

        if (userId) {
            tasksQuery = tasksQuery.eq('assigned_to', userId)
        }

        const { data: tasks } = await tasksQuery

        const completed = tasks?.filter(t => t.status === 'completed').length || 0
        const inProgress = tasks?.filter(t => t.status === 'in_progress' || t.status === 'in_review').length || 0
        const todo = tasks?.filter(t => t.status === 'todo').length || 0
        const total = tasks?.length || 0

        return {
            total,
            completed,
            in_progress: inProgress,
            todo,
            completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
    } catch (err) {
        console.error('Error fetching month summary:', err)
        return { total: 0, completed: 0, in_progress: 0, todo: 0, completion_rate: 0 }
    }
}
