'use client'

import * as React from 'react'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListTodo, Plus, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { QuickAddTaskDialog } from './QuickAddTaskDialog'
import { TaskDetailPanel } from './TaskDetailPanel'

const statusLabels: Record<string, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    in_review: 'Đang review',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ',
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    urgent: { label: 'Khẩn cấp', variant: 'destructive' },
    high: { label: 'Cao', variant: 'destructive' },
    medium: { label: 'Tb', variant: 'default' },
    low: { label: 'Thấp', variant: 'secondary' },
}

const statusColors: Record<string, string> = {
    todo: 'bg-zinc-100 text-zinc-700',
    in_progress: 'bg-blue-100 text-blue-700',
    in_review: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
}

const statusDots: Record<string, string> = {
    todo: 'bg-zinc-400',
    in_progress: 'bg-blue-500',
    in_review: 'bg-amber-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
}

interface TaskListClientProps {
    tasks: WorkspaceTask[]
    teamMembers: { id: string; full_name: string }[]
}

export function TaskListClient({ tasks, teamMembers }: TaskListClientProps) {
    const [selectedTask, setSelectedTask] = React.useState<WorkspaceTask | null>(null)
    const [panelOpen, setPanelOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState<string>('active')
    const [priorityFilter, setPriorityFilter] = React.useState<string>('all')

    const filteredTasks = tasks.filter(t => {
        // Search
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
        // Status
        if (statusFilter === 'active' && (t.status === 'completed' || t.status === 'cancelled')) return false
        if (statusFilter !== 'all' && statusFilter !== 'active' && t.status !== statusFilter) return false
        // Priority
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
        return true
    })

    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    function openTask(task: WorkspaceTask) {
        setSelectedTask(task)
        setPanelOpen(true)
    }

    return (
        <>
            <div className="space-y-4">
                {/* Filters Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm task..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Đang hoạt động</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="todo">Cần làm</SelectItem>
                            <SelectItem value="in_progress">Đang làm</SelectItem>
                            <SelectItem value="in_review">Đang review</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
                            <SelectItem value="urgent">Khẩn cấp</SelectItem>
                            <SelectItem value="high">Cao</SelectItem>
                            <SelectItem value="medium">Trung bình</SelectItem>
                            <SelectItem value="low">Thấp</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto">
                        <QuickAddTaskDialog teamMembers={teamMembers} />
                    </div>
                </div>

                {/* Results count */}
                <p className="text-xs text-muted-foreground">
                    {filteredTasks.length} task · {activeTasks.length} đang hoạt động · {completedTasks.length} hoàn thành
                </p>

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ListTodo className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-1">
                                {tasks.length === 0 ? 'Chưa có task nào' : 'Không tìm thấy task'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {tasks.length === 0
                                    ? 'Tạo task đầu tiên để bắt đầu quản lý công việc'
                                    : 'Thử thay đổi bộ lọc để tìm task'
                                }
                            </p>
                            {tasks.length === 0 && <QuickAddTaskDialog teamMembers={teamMembers} />}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {filteredTasks.map((task) => {
                                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                                    return (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                                            onClick={() => openTask(task)}
                                        >
                                            {/* Status indicator */}
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${statusDots[task.status] || 'bg-zinc-400'}`} />

                                            {/* Task info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm truncate ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                                    {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Priority */}
                                            {task.priority && priorityConfig[task.priority] && (
                                                <Badge variant={priorityConfig[task.priority].variant} className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                                                    {priorityConfig[task.priority].label}
                                                </Badge>
                                            )}

                                            {/* Status */}
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[task.status] || ''}`}>
                                                {statusLabels[task.status] || task.status}
                                            </span>

                                            {/* Due date */}
                                            {task.due_date && (
                                                <span className={`text-xs whitespace-nowrap shrink-0 ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                                    {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                            )}

                                            {/* Assignee avatar */}
                                            {task.assigned_user && (
                                                <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0" title={(task.assigned_user as any).full_name || ''}>
                                                    {((task.assigned_user as any).full_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
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
