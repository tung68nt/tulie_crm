'use server'

import { createClient } from '../server'
import { User } from '@/types'

// ============================================
// TEAM PERFORMANCE TYPES
// ============================================

export interface TeamMemberPerformance {
    user: Pick<User, 'id' | 'full_name' | 'avatar_url' | 'role' | 'department'>
    tasks_total: number
    tasks_completed: number
    tasks_overdue: number
    tasks_in_progress: number
    completion_rate: number
    avg_completion_days: number
    projects_active: number
}

export interface TeamOverview {
    total_members: number
    active_projects: number
    total_tasks: number
    completed_tasks: number
    overdue_tasks: number
    overall_completion_rate: number
    members: TeamMemberPerformance[]
}

// ============================================
// TEAM PERFORMANCE QUERIES
// ============================================

/**
 * Get team performance overview (for managers/directors)
 */
export async function getTeamOverview(options?: {
    team_id?: string
    department?: string
    period_start?: string
    period_end?: string
}): Promise<TeamOverview> {
    try {
        const supabase = await createClient()
        const now = new Date()
        const periodStart = options?.period_start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const periodEnd = options?.period_end || now.toISOString()

        // Get team members
        let usersQuery = supabase
            .from('users')
            .select('id, full_name, avatar_url, role, department')
            .eq('is_active', true)

        if (options?.team_id) {
            usersQuery = usersQuery.eq('team_id', options.team_id)
        }
        if (options?.department) {
            usersQuery = usersQuery.eq('department', options.department)
        }

        const { data: users } = await usersQuery

        if (!users || users.length === 0) {
            return {
                total_members: 0,
                active_projects: 0,
                total_tasks: 0,
                completed_tasks: 0,
                overdue_tasks: 0,
                overall_completion_rate: 0,
                members: [],
            }
        }

        const userIds = users.map(u => u.id)

        // Get workspace tasks for these users
        const { data: tasks } = await supabase
            .from('workspace_tasks')
            .select('id, status, assigned_to, due_date, completed_at, created_at')
            .in('assigned_to', userIds)
            .gte('created_at', periodStart)
            .lte('created_at', periodEnd)

        // Get active projects assigned to these users
        const { data: projects } = await supabase
            .from('projects')
            .select('id, assigned_to, status')
            .in('assigned_to', userIds)
            .in('status', ['todo', 'in_progress', 'review'])

        // Calculate per-member stats
        const members: TeamMemberPerformance[] = users.map(user => {
            const userTasks = tasks?.filter(t => t.assigned_to === user.id) || []
            const completed = userTasks.filter(t => t.status === 'completed')
            const overdue = userTasks.filter(t =>
                t.due_date && new Date(t.due_date) < now &&
                t.status !== 'completed' && t.status !== 'cancelled'
            )
            const inProgress = userTasks.filter(t => t.status === 'in_progress' || t.status === 'in_review')
            const userProjects = projects?.filter(p => p.assigned_to === user.id) || []

            // Avg completion time (days)
            const completionDays = completed
                .filter(t => t.completed_at && t.created_at)
                .map(t => {
                    const start = new Date(t.created_at).getTime()
                    const end = new Date(t.completed_at!).getTime()
                    return (end - start) / (1000 * 60 * 60 * 24)
                })
            const avgDays = completionDays.length > 0
                ? Math.round(completionDays.reduce((sum, d) => sum + d, 0) / completionDays.length * 10) / 10
                : 0

            return {
                user: { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url, role: user.role, department: user.department },
                tasks_total: userTasks.length,
                tasks_completed: completed.length,
                tasks_overdue: overdue.length,
                tasks_in_progress: inProgress.length,
                completion_rate: userTasks.length > 0 ? Math.round((completed.length / userTasks.length) * 100) : 0,
                avg_completion_days: avgDays,
                projects_active: userProjects.length,
            }
        })

        // Sort by completion rate (ascending = lowest first, surface problems)
        members.sort((a, b) => a.completion_rate - b.completion_rate)

        const totalTasks = tasks?.length || 0
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
        const overdueTasks = tasks?.filter(t =>
            t.due_date && new Date(t.due_date) < now &&
            t.status !== 'completed' && t.status !== 'cancelled'
        ).length || 0

        return {
            total_members: users.length,
            active_projects: projects?.length || 0,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            overdue_tasks: overdueTasks,
            overall_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            members,
        }
    } catch (err) {
        console.error('Error in getTeamOverview:', err)
        return {
            total_members: 0,
            active_projects: 0,
            total_tasks: 0,
            completed_tasks: 0,
            overdue_tasks: 0,
            overall_completion_rate: 0,
            members: [],
        }
    }
}

/**
 * Get workload distribution across team members
 */
export async function getWorkloadDistribution(teamId?: string) {
    try {
        const supabase = await createClient()

        let usersQuery = supabase
            .from('users')
            .select('id, full_name, role')
            .eq('is_active', true)

        if (teamId) {
            usersQuery = usersQuery.eq('team_id', teamId)
        }

        const { data: users } = await usersQuery
        if (!users) return []

        const userIds = users.map(u => u.id)

        // Count active tasks per user
        const { data: tasks } = await supabase
            .from('workspace_tasks')
            .select('assigned_to')
            .in('assigned_to', userIds)
            .in('status', ['todo', 'in_progress', 'in_review'])

        return users.map(user => ({
            user_id: user.id,
            full_name: user.full_name,
            role: user.role,
            active_tasks: tasks?.filter(t => t.assigned_to === user.id).length || 0,
        })).sort((a, b) => b.active_tasks - a.active_tasks)
    } catch (err) {
        console.error('Error in getWorkloadDistribution:', err)
        return []
    }
}
