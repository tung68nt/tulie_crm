'use server'

import { createClient } from '../server'
import { ProjectWorkItem } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getWorkItemsByProject(projectId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('project_work_items')
            .select(`
                *,
                quotation:quotations(id, quotation_number, title, status, total_amount, public_token, created_at),
                contract:contracts(id, contract_number, title, status, total_amount, created_at),
                tasks:project_tasks(*)
            `)
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true })

        if (error) throw error
        return (data || []) as ProjectWorkItem[]
    } catch (err) {
        console.error('Error fetching work items:', err)
        return []
    }
}

export async function createWorkItem(item: Partial<ProjectWorkItem>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('project_work_items')
            .insert([{
                project_id: item.project_id,
                title: item.title,
                description: item.description || '',
                status: item.status || 'pending',
                quotation_id: item.quotation_id || null,
                contract_id: item.contract_id || null,
                delivery_links: item.delivery_links || [],
                required_documents: item.required_documents || [],
                sort_order: item.sort_order || 0,
                total_amount: item.total_amount || 0,
            }])
            .select()
            .single()

        if (error) throw error
        revalidatePath(`/projects/${item.project_id}`)
        return data as ProjectWorkItem
    } catch (err) {
        console.error('Error creating work item:', err)
        throw err
    }
}

export async function updateWorkItem(id: string, updates: Partial<ProjectWorkItem>) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('project_work_items')
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.quotation_id !== undefined && { quotation_id: updates.quotation_id }),
                ...(updates.contract_id !== undefined && { contract_id: updates.contract_id }),
                ...(updates.delivery_links !== undefined && { delivery_links: updates.delivery_links }),
                ...(updates.required_documents !== undefined && { required_documents: updates.required_documents }),
                ...(updates.sort_order !== undefined && { sort_order: updates.sort_order }),
                ...(updates.total_amount !== undefined && { total_amount: updates.total_amount }),
                ...(updates.accepted_at !== undefined && { accepted_at: updates.accepted_at }),
                ...(updates.accepted_by !== undefined && { accepted_by: updates.accepted_by }),
                ...(updates.rejection_reason !== undefined && { rejection_reason: updates.rejection_reason }),
            })
            .eq('id', id)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating work item:', err)
        throw err
    }
}

export async function deleteWorkItem(id: string, projectId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('project_work_items')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath(`/projects/${projectId}`)
        return true
    } catch (err) {
        console.error('Error deleting work item:', err)
        throw err
    }
}

// Add a task to a specific work item
export async function addTaskToWorkItem(workItemId: string, projectId: string, task: { title: string; description?: string; priority?: string }) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('project_tasks')
            .insert([{
                project_id: projectId,
                work_item_id: workItemId,
                title: task.title,
                description: task.description || '',
                status: 'todo',
                priority: task.priority || 'medium',
            }])
            .select()
            .single()

        if (error) throw error
        revalidatePath(`/projects/${projectId}`)
        return data
    } catch (err) {
        console.error('Error adding task to work item:', err)
        throw err
    }
}

export async function updateTaskStatus(taskId: string, status: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('project_tasks')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', taskId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating task status:', err)
        throw err
    }
}

export async function deleteTask(taskId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('project_tasks')
            .delete()
            .eq('id', taskId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting task:', err)
        throw err
    }
}
