'use server'

import { revalidatePath } from 'next/cache'
import { createWorkspaceTask, updateWorkspaceTask, deleteWorkspaceTask, getWorkspaceTask, getTaskComments, createTaskComment, deleteTaskComment } from '@/lib/supabase/services/workspace-service'
import { WorkspaceTask } from '@/types'

export async function createTaskAction(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const status = (formData.get('status') as string) || 'todo'
    const priority = (formData.get('priority') as string) || 'medium'
    const category = formData.get('category') as string | null
    const due_date = formData.get('due_date') as string | null
    const assigned_to = formData.get('assigned_to') as string | null
    const project_id = formData.get('project_id') as string | null

    if (!title?.trim()) {
        return { error: 'Tiêu đề không được để trống' }
    }

    try {
        const task = await createWorkspaceTask({
            title: title.trim(),
            description: description?.trim() || undefined,
            status: status as WorkspaceTask['status'],
            priority: priority as WorkspaceTask['priority'],
            category: category as WorkspaceTask['category'] || undefined,
            due_date: due_date || undefined,
            assigned_to: assigned_to || undefined,
            project_id: project_id || undefined,
        })

        revalidatePath('/workspace')
        return { success: true, task }
    } catch (err: any) {
        console.error('Create task error:', err)
        return { error: err.message || 'Không thể tạo task' }
    }
}

export async function updateTaskAction(id: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const status = formData.get('status') as string | null
    const priority = formData.get('priority') as string | null
    const category = formData.get('category') as string | null
    const due_date = formData.get('due_date') as string | null
    const assigned_to = formData.get('assigned_to') as string | null

    if (!title?.trim()) {
        return { error: 'Tiêu đề không được để trống' }
    }

    try {
        const updates: Partial<WorkspaceTask> = {
            title: title.trim(),
            description: description?.trim() || undefined,
        }

        if (status) updates.status = status as WorkspaceTask['status']
        if (priority) updates.priority = priority as WorkspaceTask['priority']
        if (category) updates.category = category as WorkspaceTask['category']
        if (due_date) updates.due_date = due_date
        if (assigned_to) updates.assigned_to = assigned_to

        const task = await updateWorkspaceTask(id, updates)

        revalidatePath('/workspace')
        return { success: true, task }
    } catch (err: any) {
        console.error('Update task error:', err)
        return { error: err.message || 'Không thể cập nhật task' }
    }
}

export async function updateTaskStatusAction(id: string, status: string) {
    try {
        await updateWorkspaceTask(id, {
            status: status as WorkspaceTask['status'],
            ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        })

        revalidatePath('/workspace')
        return { success: true }
    } catch (err: any) {
        console.error('Update task status error:', err)
        return { error: err.message || 'Không thể cập nhật trạng thái' }
    }
}

export async function deleteTaskAction(id: string) {
    try {
        await deleteWorkspaceTask(id)
        revalidatePath('/workspace')
        return { success: true }
    } catch (err: any) {
        console.error('Delete task error:', err)
        return { error: err.message || 'Không thể xoá task' }
    }
}

// ============================================
// COMMENTS
// ============================================

export async function getTaskCommentsAction(taskId: string) {
    try {
        const comments = await getTaskComments(taskId)
        return { success: true, comments }
    } catch (err: any) {
        return { error: err.message, comments: [] }
    }
}

export async function addCommentAction(taskId: string, content: string) {
    if (!content?.trim()) return { error: 'Nội dung không được để trống' }
    try {
        const comment = await createTaskComment(taskId, content.trim())
        revalidatePath('/workspace')
        return { success: true, comment }
    } catch (err: any) {
        return { error: err.message || 'Không thể thêm bình luận' }
    }
}

export async function deleteCommentAction(commentId: string) {
    try {
        await deleteTaskComment(commentId)
        revalidatePath('/workspace')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Không thể xoá bình luận' }
    }
}

// ============================================
// CHECKLIST (stored in metadata.checklist)
// ============================================

interface ChecklistItem {
    id: string
    text: string
    done: boolean
}

export async function addChecklistItemAction(taskId: string, text: string) {
    if (!text?.trim()) return { error: 'Nội dung không được để trống' }
    try {
        const task = await getWorkspaceTask(taskId)
        if (!task) return { error: 'Task không tồn tại' }

        const checklist: ChecklistItem[] = (task.metadata as any)?.checklist || []
        checklist.push({ id: crypto.randomUUID(), text: text.trim(), done: false })

        await updateWorkspaceTask(taskId, {
            metadata: { ...(task.metadata || {}), checklist },
        })

        revalidatePath('/workspace')
        return { success: true, checklist }
    } catch (err: any) {
        return { error: err.message || 'Không thể thêm checklist item' }
    }
}

export async function toggleChecklistItemAction(taskId: string, itemId: string) {
    try {
        const task = await getWorkspaceTask(taskId)
        if (!task) return { error: 'Task không tồn tại' }

        const checklist: ChecklistItem[] = (task.metadata as any)?.checklist || []
        const item = checklist.find(c => c.id === itemId)
        if (item) item.done = !item.done

        await updateWorkspaceTask(taskId, {
            metadata: { ...(task.metadata || {}), checklist },
        })

        revalidatePath('/workspace')
        return { success: true, checklist }
    } catch (err: any) {
        return { error: err.message || 'Không thể cập nhật checklist' }
    }
}

export async function removeChecklistItemAction(taskId: string, itemId: string) {
    try {
        const task = await getWorkspaceTask(taskId)
        if (!task) return { error: 'Task không tồn tại' }

        const checklist: ChecklistItem[] = (task.metadata as any)?.checklist || []
        const filtered = checklist.filter(c => c.id !== itemId)

        await updateWorkspaceTask(taskId, {
            metadata: { ...(task.metadata || {}), checklist: filtered },
        })

        revalidatePath('/workspace')
        return { success: true, checklist: filtered }
    } catch (err: any) {
        return { error: err.message || 'Không thể xoá checklist item' }
    }
}
