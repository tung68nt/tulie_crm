'use client'

import * as React from 'react'
import { WorkspaceTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertTriangle } from 'lucide-react'
import { TaskDetailPanel } from './TaskDetailPanel'

const statusLabels: Record<string, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    in_review: 'Review',
    completed: 'Xong',
}

const statusDots: Record<string, string> = {
    todo: 'bg-zinc-400',
    in_progress: 'bg-blue-500',
    in_review: 'bg-amber-500',
    completed: 'bg-emerald-500',
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    urgent: { label: 'Khẩn cấp', variant: 'destructive' },
    high: { label: 'Cao', variant: 'destructive' },
    medium: { label: 'Tb', variant: 'default' },
    low: { label: 'Thấp', variant: 'secondary' },
}

interface TeamMember {
    id: string
    full_name: string
    role?: string
    department?: string
    avatar_url?: string
}

interface TeamWorkloadClientProps {
    tasks: WorkspaceTask[]
    teamMembers: TeamMember[]
}

export function TeamWorkloadClient({ tasks, teamMembers }: TeamWorkloadClientProps) {
    const [selectedTask, setSelectedTask] = React.useState<WorkspaceTask | null>(null)
    const [panelOpen, setPanelOpen] = React.useState(false)

    const simpleMembers = teamMembers.map(m => ({ id: m.id, full_name: m.full_name }))

    // Build member workload data
    const memberData = teamMembers.map(member => {
        const memberTasks = tasks.filter(t => t.assigned_to === member.id && t.status !== 'cancelled')
        const activeTasks = memberTasks.filter(t => t.status !== 'completed')
        const completedTasks = memberTasks.filter(t => t.status === 'completed')
        const overdueTasks = activeTasks.filter(t => t.due_date && new Date(t.due_date) < new Date())

        return {
            ...member,
            tasks: memberTasks,
            activeTasks,
            completedTasks,
            overdueTasks,
            totalActive: activeTasks.length,
            totalCompleted: completedTasks.length,
            totalOverdue: overdueTasks.length,
        }
    })
        .filter(m => m.tasks.length > 0) // Only show members with tasks
        .sort((a, b) => b.totalActive - a.totalActive) // Busiest first

    // Unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assigned_to && t.status !== 'cancelled' && t.status !== 'completed')

    // Summary stats
    const totalActive = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length
    const totalOverdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed' && t.status !== 'cancelled').length

    function openTask(task: WorkspaceTask) {
        setSelectedTask(task)
        setPanelOpen(true)
    }

    // Max active for bar chart scaling
    const maxActive = Math.max(...memberData.map(m => m.totalActive), 1)

    return (
        <>
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Thành viên có task</p>
                            <p className="text-2xl font-bold mt-1">{memberData.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Task đang hoạt động</p>
                            <p className="text-2xl font-bold mt-1 text-blue-600">{totalActive}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Quá hạn</p>
                            <p className={`text-2xl font-bold mt-1 ${totalOverdue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalOverdue}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">Chưa giao</p>
                            <p className={`text-2xl font-bold mt-1 ${unassignedTasks.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{unassignedTasks.length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Workload Chart */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-4">Khối lượng công việc</h3>
                        <div className="space-y-3">
                            {memberData.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <div className="w-[120px] shrink-0 flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-semibold text-zinc-600 shrink-0">
                                            {member.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium truncate">{member.full_name.split(' ').slice(-2).join(' ')}</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-1">
                                        <div className="flex-1 h-6 bg-muted/30 rounded-md overflow-hidden flex">
                                            {/* In Progress */}
                                            {member.activeTasks.filter(t => t.status === 'in_progress').length > 0 && (
                                                <div
                                                    className="h-full bg-blue-500 transition-all"
                                                    style={{ width: `${(member.activeTasks.filter(t => t.status === 'in_progress').length / maxActive) * 100}%` }}
                                                    title={`Đang làm: ${member.activeTasks.filter(t => t.status === 'in_progress').length}`}
                                                />
                                            )}
                                            {/* In Review */}
                                            {member.activeTasks.filter(t => t.status === 'in_review').length > 0 && (
                                                <div
                                                    className="h-full bg-amber-500 transition-all"
                                                    style={{ width: `${(member.activeTasks.filter(t => t.status === 'in_review').length / maxActive) * 100}%` }}
                                                    title={`Review: ${member.activeTasks.filter(t => t.status === 'in_review').length}`}
                                                />
                                            )}
                                            {/* Todo */}
                                            {member.activeTasks.filter(t => t.status === 'todo').length > 0 && (
                                                <div
                                                    className="h-full bg-zinc-300 transition-all"
                                                    style={{ width: `${(member.activeTasks.filter(t => t.status === 'todo').length / maxActive) * 100}%` }}
                                                    title={`Cần làm: ${member.activeTasks.filter(t => t.status === 'todo').length}`}
                                                />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground w-6 text-right">{member.totalActive}</span>
                                        {member.totalOverdue > 0 && (
                                            <div className="flex items-center gap-0.5 text-red-500 ml-1" title={`${member.totalOverdue} quá hạn`}>
                                                <AlertTriangle className="h-3 w-3" />
                                                <span className="text-[10px] font-bold">{member.totalOverdue}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {memberData.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">Không có task nào được giao</p>
                            )}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1"><div className="h-2 w-5 rounded bg-blue-500" />Đang làm</div>
                            <div className="flex items-center gap-1"><div className="h-2 w-5 rounded bg-amber-500" />Review</div>
                            <div className="flex items-center gap-1"><div className="h-2 w-5 rounded bg-zinc-300" />Cần làm</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detail per member */}
                {memberData.map(member => (
                    <Card key={member.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600">
                                    {member.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{member.full_name}</p>
                                    <p className="text-[10px] text-muted-foreground">{member.role || ''} {member.department ? `· ${member.department}` : ''}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px]">{member.totalActive} hoạt động</Badge>
                                    <Badge variant="outline" className="text-[10px]">{member.totalCompleted} xong</Badge>
                                    {member.totalOverdue > 0 && <Badge variant="destructive" className="text-[10px]">{member.totalOverdue} quá hạn</Badge>}
                                </div>
                            </div>

                            {member.activeTasks.length > 0 && (
                                <div className="space-y-1">
                                    {member.activeTasks.slice(0, 8).map(task => {
                                        const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                                        return (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => openTask(task)}
                                            >
                                                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDots[task.status] || 'bg-zinc-400'}`} />
                                                <span className="text-xs flex-1 truncate">{task.title}</span>
                                                {task.priority && priorityConfig[task.priority] && (
                                                    <Badge variant={priorityConfig[task.priority].variant} className="text-[9px] px-1 py-0 h-4">{priorityConfig[task.priority].label}</Badge>
                                                )}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    task.status === 'in_review' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-zinc-100 text-zinc-700'
                                                }`}>{statusLabels[task.status] || task.status}</span>
                                                {task.due_date && (
                                                    <span className={`text-[10px] shrink-0 ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                                        {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {member.activeTasks.length > 8 && (
                                        <p className="text-[10px] text-muted-foreground px-2">+{member.activeTasks.length - 8} task khác</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Unassigned */}
                {unassignedTasks.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-amber-500" />
                                <h3 className="text-sm font-semibold">Chưa được giao ({unassignedTasks.length})</h3>
                            </div>
                            <div className="space-y-1">
                                {unassignedTasks.slice(0, 10).map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => openTask(task)}
                                    >
                                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDots[task.status] || 'bg-zinc-400'}`} />
                                        <span className="text-xs flex-1 truncate">{task.title}</span>
                                        {task.priority && priorityConfig[task.priority] && (
                                            <Badge variant={priorityConfig[task.priority].variant} className="text-[9px] px-1 py-0 h-4">{priorityConfig[task.priority].label}</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <TaskDetailPanel task={selectedTask} open={panelOpen} onOpenChange={setPanelOpen} teamMembers={simpleMembers} />
        </>
    )
}
