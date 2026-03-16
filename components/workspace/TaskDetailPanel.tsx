'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Calendar, User, Tag, AlertTriangle, CheckSquare, MessageSquare, Plus, X, Send, Square, CheckSquare2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
    updateTaskAction,
    deleteTaskAction,
    updateTaskStatusAction,
    getTaskCommentsAction,
    addCommentAction,
    deleteCommentAction,
    addChecklistItemAction,
    toggleChecklistItemAction,
    removeChecklistItemAction,
} from '@/app/(dashboard)/workspace/actions'
import { WorkspaceTask } from '@/types'

const statusOptions = [
    { value: 'todo', label: 'Cần làm', color: 'bg-zinc-100 text-zinc-700' },
    { value: 'in_progress', label: 'Đang làm', color: 'bg-blue-50 text-blue-700' },
    { value: 'in_review', label: 'Đang review', color: 'bg-amber-100 text-amber-700' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'cancelled', label: 'Đã huỷ', color: 'bg-rose-50 text-rose-700' },
]

const priorityOptions = [
    { value: 'low', label: 'Thấp' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'high', label: 'Cao' },
    { value: 'urgent', label: 'Khẩn cấp' },
]

const categoryOptions = [
    { value: 'internal', label: 'Nội bộ' },
    { value: 'follow_up', label: 'Theo dõi' },
    { value: 'client_request', label: 'Yêu cầu KH' },
    { value: 'admin', label: 'Hành chính' },
]

type TabType = 'detail' | 'checklist' | 'comments'

interface ChecklistItem {
    id: string
    text: string
    done: boolean
}

interface Comment {
    id: string
    content: string
    user?: { full_name?: string }
    created_at: string
}

interface TaskDetailPanelProps {
    task: WorkspaceTask | null
    open: boolean
    onOpenChange: (open: boolean) => void
    teamMembers?: { id: string; full_name: string }[]
}

export function TaskDetailPanel({ task, open, onOpenChange, teamMembers = [] }: TaskDetailPanelProps) {
    const [tab, setTab] = React.useState<TabType>('detail')
    const [loading, setLoading] = React.useState(false)
    const [deleting, setDeleting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = React.useState(false)
    const router = useRouter()

    // Checklist state
    const [checklist, setChecklist] = React.useState<ChecklistItem[]>([])
    const [newItem, setNewItem] = React.useState('')

    // Comments state
    const [comments, setComments] = React.useState<Comment[]>([])
    const [newComment, setNewComment] = React.useState('')
    const [loadingComments, setLoadingComments] = React.useState(false)
    const [sending, setSending] = React.useState(false)

    // load checklist from task metadata
    React.useEffect(() => {
        if (task) {
            setChecklist((task.metadata as any)?.checklist || [])
            setTab('detail')
            setConfirmDelete(false)
            setError(null)
        }
    }, [task?.id])

    // load comments when tab switches
    React.useEffect(() => {
        if (tab === 'comments' && task) {
            loadComments()
        }
    }, [tab, task?.id])

    async function loadComments() {
        if (!task) return
        setLoadingComments(true)
        const result = await getTaskCommentsAction(task.id)
        setComments(result.comments || [])
        setLoadingComments(false)
    }

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

    // Checklist handlers
    async function handleAddItem() {
        if (!task || !newItem.trim()) return
        const result = await addChecklistItemAction(task.id, newItem)
        if (result.checklist) setChecklist(result.checklist)
        setNewItem('')
    }

    async function handleToggleItem(itemId: string) {
        if (!task) return
        const result = await toggleChecklistItemAction(task.id, itemId)
        if (result.checklist) setChecklist(result.checklist)
    }

    async function handleRemoveItem(itemId: string) {
        if (!task) return
        const result = await removeChecklistItemAction(task.id, itemId)
        if (result.checklist) setChecklist(result.checklist)
    }

    // Comment handlers
    async function handleAddComment() {
        if (!task || !newComment.trim()) return
        setSending(true)
        const result = await addCommentAction(task.id, newComment)
        if (result.comment) {
            setComments(prev => [...prev, result.comment as Comment])
        }
        setNewComment('')
        setSending(false)
    }

    async function handleDeleteComment(commentId: string) {
        await deleteCommentAction(commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
    const doneCount = checklist.filter(c => c.done).length
    const checklistProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0

    const tabs = [
        { key: 'detail' as TabType, label: 'Chi tiết', icon: Tag },
        { key: 'checklist' as TabType, label: `Checklist${checklist.length > 0 ? ` (${doneCount}/${checklist.length})` : ''}`, icon: CheckSquare },
        { key: 'comments' as TabType, label: `Bình luận${comments.length > 0 ? ` (${comments.length})` : ''}`, icon: MessageSquare },
    ]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[520px] overflow-y-auto p-0">
                <div className="p-6 pb-4">
                    <SheetHeader>
                        <SheetTitle className="text-left text-base">{task.title}</SheetTitle>
                    </SheetHeader>

                    {/* Quick status badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
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

                    {isOverdue && (
                        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mt-3">
                            <AlertTriangle className="h-4 w-4" />
                            Task đã quá hạn!
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                                tab === key
                                    ? 'border-foreground text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setTab(key)}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-6 pt-4">
                    {error && (
                        <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* === DETAIL TAB === */}
                    {tab === 'detail' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Tiêu đề *</Label>
                                <Input id="edit-title" name="title" defaultValue={task.title} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Mô tả</Label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    defaultValue={task.description || ''}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                    rows={3}
                                    placeholder="Mô tả..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>
                                    <Select name="status" defaultValue={task.status}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ưu tiên</Label>
                                    <Select name="priority" defaultValue={task.priority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {priorityOptions.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Phân loại</Label>
                                    <Select name="category" defaultValue={task.category || 'internal'}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-due_date" className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Deadline
                                    </Label>
                                    <Input id="edit-due_date" name="due_date" type="date" defaultValue={task.due_date ? task.due_date.split('T')[0] : ''} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><User className="h-3 w-3" /> Giao cho</Label>
                                <Select name="assigned_to" defaultValue={task.assigned_to || ''}>
                                    <SelectTrigger><SelectValue placeholder="Chọn người..." /></SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                                <p>Tạo bởi: {(task.creator as any)?.full_name || 'N/A'} · {new Date(task.created_at).toLocaleString('vi-VN')}</p>
                                {task.completed_at && <p>Hoàn thành: {new Date(task.completed_at).toLocaleString('vi-VN')}</p>}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                                {!confirmDelete ? (
                                    <Button type="button" variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Xoá
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                                            {deleting && <LoadingSpinner size="sm" className="mr-1" />} Xác nhận
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Huỷ</Button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Đóng</Button>
                                    <Button type="submit" size="sm" disabled={loading}>
                                        {loading && <LoadingSpinner size="sm" className="mr-1" />} Lưu
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* === CHECKLIST TAB === */}
                    {tab === 'checklist' && (
                        <div className="space-y-4">
                            {/* Progress */}
                            {checklist.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">{doneCount}/{checklist.length} hoàn thành</span>
                                        <span className="font-medium">{checklistProgress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${checklistProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="space-y-1">
                                {checklist.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 group py-1">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleItem(item.id)}
                                            className="shrink-0"
                                        >
                                            {item.done ? (
                                                <CheckSquare2 className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            )}
                                        </button>
                                        <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        >
                                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {checklist.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    Chưa có checklist item nào
                                </p>
                            )}

                            {/* Add item */}
                            <div className="flex gap-2">
                                <Input
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Thêm item..."
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                />
                                <Button type="button" size="sm" className="h-8 px-3" onClick={handleAddItem} disabled={!newItem.trim()}>
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* === COMMENTS TAB === */}
                    {tab === 'comments' && (
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner size="md" />
                                </div>
                            ) : (
                                <>
                                    {comments.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            Chưa có bình luận nào
                                        </p>
                                    )}

                                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="group">
                                                <div className="flex items-start gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-medium text-zinc-600 shrink-0 mt-0.5">
                                                        {(comment.user?.full_name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold">{comment.user?.full_name || 'Ẩn danh'}</span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {new Date(comment.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                                            >
                                                                <X className="h-3 w-3 text-muted-foreground hover:text-rose-500" />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Add comment */}
                            <div className="flex gap-2 pt-2 border-t">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Viết bình luận..."
                                    className="flex min-h-[60px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    rows={2}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault()
                                            handleAddComment()
                                        }
                                    }}
                                />
                                <Button type="button" size="sm" className="self-end h-8 px-3" onClick={handleAddComment} disabled={!newComment.trim() || sending}>
                                    {sending ? <LoadingSpinner size="sm" /> : <Send className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">⌘+Enter để gửi</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
