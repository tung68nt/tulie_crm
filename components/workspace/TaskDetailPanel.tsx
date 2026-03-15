'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trash2, Calendar, User, Tag, AlertTriangle } from 'lucide-react'
import { updateTaskAction, deleteTaskAction, updateTaskStatusAction } from '@/app/(dashboard)/workspace/actions'
import { WorkspaceTask } from '@/types'

const statusOptions = [
    { value: 'todo', label: 'Cần làm', color: 'bg-zinc-100 text-zinc-700' },
    { value: 'in_progress', label: 'Đang làm', color: 'bg-blue-100 text-blue-700' },
    { value: 'in_review', label: 'Đang review', color: 'bg-amber-100 text-amber-700' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'cancelled', label: 'Đã huỷ', color: 'bg-red-100 text-red-700' },
]

const priorityOptions = [
    { value: 'low', label: 'Thấp', variant: 'secondary' as const },
    { value: 'medium', label: 'Trung bình', variant: 'default' as const },
    { value: 'high', label: 'Cao', variant: 'destructive' as const },
    { value: 'urgent', label: 'Khẩn cấp', variant: 'destructive' as const },
]

const categoryOptions = [
    { value: 'internal', label: 'Nội bộ' },
    { value: 'follow_up', label: 'Theo dõi' },
    { value: 'client_request', label: 'Yêu cầu KH' },
    { value: 'admin', label: 'Hành chính' },
]

interface TaskDetailPanelProps {
    task: WorkspaceTask | null
    open: boolean
    onOpenChange: (open: boolean) => void
    teamMembers?: { id: string; full_name: string }[]
}

export function TaskDetailPanel({ task, open, onOpenChange, teamMembers = [] }: TaskDetailPanelProps) {
    const [loading, setLoading] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = React.useState(false)
    const router = useRouter()

    if (!task) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!task) return
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateTaskAction(task.id, formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        setLoading(false)
        onOpenChange(false)
        router.refresh()
    }

    async function handleDelete() {
        if (!task) return
        setDeleting(true)
        const result = await deleteTaskAction(task.id)

        if (result.error) {
            setError(result.error)
            setDeleting(false)
            return
        }

        setDeleting(false)
        onOpenChange(false)
        router.refresh()
    }

    async function handleStatusChange(status: string) {
        if (!task) return
        await updateTaskStatusAction(task.id, status)
        router.refresh()
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[480px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-left">Chi tiết task</SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Quick status badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {statusOptions.map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => handleStatusChange(s.value)}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                                    task.status === s.value
                                        ? s.color + ' ring-2 ring-offset-1 ring-zinc-300'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Overdue warning */}
                    {isOverdue && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                            Task đã quá hạn!
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Tiêu đề *</Label>
                        <Input
                            id="edit-title"
                            name="title"
                            defaultValue={task.title}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Mô tả</Label>
                        <textarea
                            id="edit-description"
                            name="description"
                            defaultValue={task.description || ''}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            rows={4}
                            placeholder="Mô tả chi tiết..."
                        />
                    </div>

                    {/* Status + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5"><Tag className="h-3 w-3" /> Trạng thái</Label>
                            <Select name="status" defaultValue={task.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> Ưu tiên</Label>
                            <Select name="priority" defaultValue={task.priority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(p => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category + Due date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Phân loại</Label>
                            <Select name="category" defaultValue={task.category || 'internal'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-due_date" className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" /> Deadline
                            </Label>
                            <Input
                                id="edit-due_date"
                                name="due_date"
                                type="date"
                                defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                            />
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><User className="h-3 w-3" /> Giao cho</Label>
                        <Select name="assigned_to" defaultValue={task.assigned_to || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn người..." />
                            </SelectTrigger>
                            <SelectContent>
                                {teamMembers.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                        <p>Tạo bởi: {(task.creator as any)?.full_name || 'N/A'}</p>
                        <p>Ngày tạo: {new Date(task.created_at).toLocaleString('vi-VN')}</p>
                        <p>Cập nhật: {new Date(task.updated_at).toLocaleString('vi-VN')}</p>
                        {task.completed_at && (
                            <p>Hoàn thành: {new Date(task.completed_at).toLocaleString('vi-VN')}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        {!confirmDelete ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setConfirmDelete(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Xoá
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                    Xác nhận xoá
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    Huỷ
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                                Đóng
                            </Button>
                            <Button type="submit" size="sm" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                Lưu
                            </Button>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
