'use server'

import { revalidatePath } from 'next/cache'
import {
    createWsTask,
    updateWsTask,
    deleteWsTask,
    updateWsTaskStatus,
    getWsTask,
    getWsTaskComments,
    createWsTaskComment,
    createWsProject,
    createWsCycle,
    updateWsCycle,
    addTagToTask,
    removeTagFromTask,
    migrateOldWorkspaceTasks,
} from '@/lib/supabase/services/workspace-v2-service'
import type { WsTask, WsProject, WsCycle } from '@/lib/supabase/services/workspace-v2-service'

const WORKSPACE_PATH = '/workspace'

// ============================================
// TASKS
// ============================================

export async function createTaskV2Action(formData: FormData) {
    const title = formData.get('title') as string
    if (!title?.trim()) return { error: 'Tiêu đề không được để trống' }

    try {
        const task = await createWsTask({
            title: title.trim(),
            description: (formData.get('description') as string)?.trim() || undefined,
            status: (formData.get('status') as WsTask['status']) || 'backlog',
            priority: (formData.get('priority') as WsTask['priority']) || 'medium',
            eisenhower_quadrant: (formData.get('eisenhower') as WsTask['eisenhower_quadrant']) || undefined,
            estimated_effort_hours: formData.get('effort') ? Number(formData.get('effort')) : undefined,
            due_date: (formData.get('due_date') as string) || undefined,
            assigned_to: (formData.get('assigned_to') as string) || undefined,
            project_id: (formData.get('project_id') as string) || undefined,
            cycle_id: (formData.get('cycle_id') as string) || undefined,
            category: (formData.get('category') as string) || undefined,
        })

        revalidatePath(WORKSPACE_PATH)
        return { success: true, task }
    } catch (err: any) {
        return { error: err.message || 'Không thể tạo task' }
    }
}

export async function updateTaskV2Action(id: string, formData: FormData) {
    const title = formData.get('title') as string
    if (!title?.trim()) return { error: 'Tiêu đề không được để trống' }

    try {
        const updates: Partial<WsTask> = { title: title.trim() }

        const desc = formData.get('description') as string
        if (desc !== null) updates.description = desc?.trim() || null

        const fields = ['status', 'priority', 'eisenhower_quadrant', 'due_date',
            'assigned_to', 'project_id', 'cycle_id', 'category'] as const
        for (const f of fields) {
            const v = formData.get(f) as string
            if (v !== null && v !== '') (updates as any)[f] = v
        }

        const effort = formData.get('effort')
        if (effort) updates.estimated_effort_hours = Number(effort)

        const task = await updateWsTask(id, updates)
        revalidatePath(WORKSPACE_PATH)
        return { success: true, task }
    } catch (err: any) {
        return { error: err.message || 'Không thể cập nhật task' }
    }
}

export async function updateTaskStatusV2Action(id: string, status: WsTask['status']) {
    try {
        await updateWsTaskStatus(id, status)
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Không thể cập nhật trạng thái' }
    }
}

export async function moveToQuarantineAction(id: string) {
    return updateTaskStatusV2Action(id, 'quarantine')
}

export async function deleteTaskV2Action(id: string) {
    try {
        await deleteWsTask(id)
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Không thể xoá task' }
    }
}

export async function setEisenhowerAction(id: string, quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null) {
    try {
        await updateWsTask(id, { eisenhower_quadrant: quadrant })
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// TAGS
// ============================================

export async function addTagAction(taskId: string, tagId: string) {
    try {
        await addTagToTask(taskId, tagId)
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function removeTagAction(taskId: string, tagId: string) {
    try {
        await removeTagFromTask(taskId, tagId)
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// COMMENTS
// ============================================

export async function addCommentV2Action(taskId: string, content: string) {
    if (!content?.trim()) return { error: 'Nội dung không được để trống' }
    try {
        const comment = await createWsTaskComment(taskId, content.trim())
        revalidatePath(WORKSPACE_PATH)
        return { success: true, comment }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// CHECKLIST (stored in task metadata)
// ============================================

interface ChecklistItem { id: string; text: string; done: boolean }

export async function addChecklistV2Action(taskId: string, text: string) {
    if (!text?.trim()) return { error: 'Nội dung không được để trống' }
    try {
        const task = await getWsTask(taskId)
        if (!task) return { error: 'Task không tồn tại' }

        const checklist: ChecklistItem[] = (task.metadata as any)?.checklist || []
        checklist.push({ id: crypto.randomUUID(), text: text.trim(), done: false })

        await updateWsTask(taskId, {
            metadata: { ...(task.metadata || {}), checklist },
        })
        revalidatePath(WORKSPACE_PATH)
        return { success: true, checklist }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function toggleChecklistV2Action(taskId: string, itemId: string) {
    try {
        const task = await getWsTask(taskId)
        if (!task) return { error: 'Task không tồn tại' }

        const checklist: ChecklistItem[] = (task.metadata as any)?.checklist || []
        const item = checklist.find(c => c.id === itemId)
        if (item) item.done = !item.done

        await updateWsTask(taskId, {
            metadata: { ...(task.metadata || {}), checklist },
        })
        revalidatePath(WORKSPACE_PATH)
        return { success: true, checklist }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// PROJECTS
// ============================================

export async function createProjectV2Action(formData: FormData) {
    const name = formData.get('name') as string
    if (!name?.trim()) return { error: 'Tên dự án không được để trống' }

    try {
        const project = await createWsProject({
            name: name.trim(),
            description: (formData.get('description') as string)?.trim() || undefined,
            color: (formData.get('color') as string) || '#3B82F6',
        })
        revalidatePath(WORKSPACE_PATH)
        return { success: true, project }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// CYCLES
// ============================================

export async function createCycleAction(formData: FormData) {
    const name = formData.get('name') as string
    if (!name?.trim()) return { error: 'Tên cycle không được để trống' }

    try {
        const cycle = await createWsCycle({
            name: name.trim(),
            description: (formData.get('description') as string)?.trim() || undefined,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            status: 'planning',
        })
        revalidatePath(WORKSPACE_PATH)
        return { success: true, cycle }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function startCycleAction(id: string) {
    try {
        await updateWsCycle(id, { status: 'active' })
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function completeCycleAction(id: string) {
    try {
        await updateWsCycle(id, { status: 'completed' })
        revalidatePath(WORKSPACE_PATH)
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ============================================
// MIGRATION (one-time)
// ============================================

export async function runMigrationAction() {
    try {
        const result = await migrateOldWorkspaceTasks()
        revalidatePath(WORKSPACE_PATH)
        return { success: true, ...result }
    } catch (err: any) {
        return { error: err.message }
    }
}
