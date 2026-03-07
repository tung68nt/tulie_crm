'use server'

import { createClient } from '../server'
import { ProjectTask } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getProjectTasks(projectId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('project_tasks')
            .select('*, assigned_user:users!assigned_to(*)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data as any[]
    } catch (err) {
        console.error('Error fetching project tasks:', err)
        return []
    }
}

export async function updateProjectTasks(projectId: string, tasks: any[]) {
    try {
        const supabase = await createClient()

        // For simplicity in this demo/agentic flow, we'll sync tasks: delete existing ones for the project and re-insert.
        // In a real production app, we'd do incremental updates (upserts).
        // Let's use upsert if IDs are provided.

        const tasksToUpsert = tasks.map(t => ({
            id: t.id?.startsWith('temp-') ? undefined : t.id,
            project_id: projectId,
            milestone_id: t.milestone_id || null,
            title: t.title,
            description: t.description || '',
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            start_date: t.start_date,
            end_date: t.end_date,
            assigned_to: t.assigned_to || null,
            updated_at: new Date().toISOString()
        }))

        // Separate delete and insert for clean sync if needed, 
        // but let's try a simple approach: if no ID, it's new.

        // Actually, to avoid orphaned tasks when user "Removes" a row in UI:
        const existingTaskIds = tasks.filter(t => t.id && !t.id.startsWith('temp-')).map(t => t.id)

        if (existingTaskIds.length > 0) {
            await supabase
                .from('project_tasks')
                .delete()
                .eq('project_id', projectId)
                .not('id', 'in', `(${existingTaskIds.join(',')})`)
        } else {
            await supabase
                .from('project_tasks')
                .delete()
                .eq('project_id', projectId)
        }

        const { error } = await supabase
            .from('project_tasks')
            .upsert(tasksToUpsert)

        if (error) throw error

        revalidatePath(`/projects/${projectId}`)
        return true
    } catch (err) {
        console.error('Error updating project tasks:', err)
        throw err
    }
}
