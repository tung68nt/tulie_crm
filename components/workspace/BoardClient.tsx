'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { QuickAddTaskDialog } from './QuickAddTaskDialog'
import { TaskDetailPanel } from './TaskDetailPanel'
import { updateTaskStatusAction } from '@/app/(dashboard)/workspace/actions'

const columns = [
    { key: 'todo', title: 'Cần làm', color: 'bg-zinc-400' },
    { key: 'in_progress', title: 'Đang làm', color: 'bg-blue-500' },
    { key: 'in_review', title: 'Đang review', color: 'bg-amber-500' },
    { key: 'completed', title: 'Hoàn thành', color: 'bg-emerald-500' },
]


interface BoardClientProps {
    tasks: WorkspaceTask[]
    teamMembers: { id: string; full_name: string }[]
}

export function BoardClient({ tasks, teamMembers }: BoardClientProps) {
    const [selectedTask, setSelectedTask] = React.useState<WorkspaceTask | null>(null)
    const [panelOpen, setPanelOpen] = React.useState(false)
    const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
    const [dragOverCol, setDragOverCol] = React.useState<string | null>(null)
    const router = useRouter()

    function openTask(task: WorkspaceTask) {
        setSelectedTask(task)
        setPanelOpen(true)
    }

    function handleDragStart(e: React.DragEvent, taskId: string) {
        e.dataTransfer.setData('text/plain', taskId)
        setDraggedTaskId(taskId)
    }

    function handleDragOver(e: React.DragEvent, colKey: string) {
        e.preventDefault()
        setDragOverCol(colKey)
    }

    function handleDragLeave() {
        setDragOverCol(null)
    }

    async function handleDrop(e: React.DragEvent, colKey: string) {
        e.preventDefault()
        setDragOverCol(null)
        setDraggedTaskId(null)

        const taskId = e.dataTransfer.getData('text/plain')
        if (!taskId) return

        // Find current task status
        const task = tasks.find(t => t.id === taskId)
        if (!task || task.status === colKey) return

        await updateTaskStatusAction(taskId, colKey)
        router.refresh()
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {columns.map((col) => {
                    const colTasks = tasks.filter(t => t.status === col.key)
                    const isDragOver = dragOverCol === col.key

                    return (
                        <div key={col.key} className="space-y-3">
                            {/* Column Header */}
                            <div className="flex items-center gap-2 px-1">
                                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                                <span className="text-sm font-semibold">{col.title}</span>
                                <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
                            </div>

                            {/* Column Drop Zone */}
                            <div
                                className={`space-y-2 min-h-[200px] rounded-xl p-2 transition-colors ${
                                    isDragOver
                                        ? 'bg-blue-50 border-2 border-dashed border-blue-300'
                                        : 'bg-muted/30'
                                }`}
                                onDragOver={(e) => handleDragOver(e, col.key)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, col.key)}
                            >
                                {colTasks.length === 0 && !isDragOver && (
                                    <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                        Không có task
                                    </div>
                                )}

                                {colTasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        className={`cursor-pointer hover:shadow-md transition-all ${
                                            draggedTaskId === task.id ? 'opacity-40' : ''
                                        }`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => openTask(task)}
                                    >
                                        <CardContent className="p-3 space-y-2">
                                            <p className="text-sm font-medium leading-snug">{task.title}</p>
                                            {task.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 justify-between">
                                                {task.priority && (
                                                    <StatusBadge status={task.priority} entityType="ticket_priority" />
                                                )}
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    {task.due_date && (
                                                        <span className={`text-[11px] ${
                                                            new Date(task.due_date) < new Date() && task.status !== 'completed'
                                                                ? 'text-rose-600 font-medium'
                                                                : 'text-muted-foreground'
                                                        }`}>
                                                            {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                        </span>
                                                    )}
                                                    {task.assigned_user && (
                                                        <div className="h-5 w-5 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-medium text-zinc-600" title={(task.assigned_user as any).full_name || ''}>
                                                            {((task.assigned_user as any).full_name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Add task button per column */}
                                <QuickAddTaskDialog
                                    defaultStatus={col.key}
                                    teamMembers={teamMembers}
                                    trigger={
                                        <button className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1">
                                            <Plus className="h-3 w-3" />
                                            Thêm task
                                        </button>
                                    }
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Detail Panel */}
            <TaskDetailPanel
                task={selectedTask}
                open={panelOpen}
                onOpenChange={setPanelOpen}
                teamMembers={teamMembers}
            />
        </>
    )
}
