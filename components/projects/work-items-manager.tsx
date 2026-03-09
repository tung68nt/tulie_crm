'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    Package,
    FileText,
    FileSignature,
    Link2,
    ListTodo,
    ClipboardCheck,
    GripVertical,
    Loader2,
    ExternalLink,
    Circle,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { createWorkItem, updateWorkItem, deleteWorkItem, addTaskToWorkItem, updateTaskStatus, deleteTask } from '@/lib/supabase/services/work-item-service'
import { useRouter } from 'next/navigation'

interface WorkItemsManagerProps {
    project: any
    workItems: any[]
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'in_progress', label: 'Đang thực hiện' },
    { value: 'delivered', label: 'Đã bàn giao' },
    { value: 'accepted', label: 'Đã nghiệm thu' },
    { value: 'rejected', label: 'Từ chối' },
]

const DEFAULT_DOCUMENTS = [
    'Báo giá',
    'Hợp đồng',
    'Biên bản bàn giao',
    'Yêu cầu thanh toán',
    'Biên bản nghiệm thu',
]

export function WorkItemsManager({ project, workItems: initialWorkItems }: WorkItemsManagerProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Create work item form state
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        quotation_id: '',
        contract_id: '',
    })

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleCreate = async () => {
        if (!newItem.title.trim()) {
            toast.error('Vui lòng nhập tên hạng mục')
            return
        }

        startTransition(async () => {
            try {
                await createWorkItem({
                    project_id: project.id,
                    title: newItem.title,
                    description: newItem.description,
                    quotation_id: newItem.quotation_id || undefined,
                    contract_id: newItem.contract_id || undefined,
                    sort_order: initialWorkItems.length,
                    required_documents: DEFAULT_DOCUMENTS.map(d => ({
                        title: d,
                        status: 'pending' as const,
                    })),
                })
                toast.success('Đã tạo hạng mục mới')
                setShowCreateDialog(false)
                setNewItem({ title: '', description: '', quotation_id: '', contract_id: '' })
                router.refresh()
            } catch {
                toast.error('Lỗi khi tạo hạng mục')
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa hạng mục này? Các công việc liên quan sẽ bị gỡ liên kết.')) return
        startTransition(async () => {
            try {
                await deleteWorkItem(id, project.id)
                toast.success('Đã xóa hạng mục')
                router.refresh()
            } catch {
                toast.error('Lỗi khi xóa')
            }
        })
    }

    const handleUpdateStatus = async (id: string, status: string) => {
        startTransition(async () => {
            try {
                await updateWorkItem(id, { status: status as any })
                router.refresh()
            } catch {
                toast.error('Lỗi khi cập nhật')
            }
        })
    }

    const quotations = project.quotations || []
    const contracts = project.contracts || []

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        Hạng mục dự án
                    </CardTitle>
                    <CardDescription>Quản lý các hạng mục, công việc, link bàn giao và chứng từ</CardDescription>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm hạng mục
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Thêm hạng mục mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Tên hạng mục *</Label>
                                <Input
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="VD: Thiết kế web, Marketing hàng tháng..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Mô tả</Label>
                                <Textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Mô tả ngắn về hạng mục..."
                                    rows={2}
                                />
                            </div>
                            {quotations.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Gán báo giá</Label>
                                    <Select value={newItem.quotation_id} onValueChange={v => setNewItem({ ...newItem, quotation_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Chọn báo giá..." /></SelectTrigger>
                                        <SelectContent>
                                            {quotations.map((q: any) => (
                                                <SelectItem key={q.id} value={q.id}>
                                                    {q.quotation_number} — {formatCurrency(q.total_amount)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {contracts.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Gán hợp đồng</Label>
                                    <Select value={newItem.contract_id} onValueChange={v => setNewItem({ ...newItem, contract_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Chọn hợp đồng..." /></SelectTrigger>
                                        <SelectContent>
                                            {contracts.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.contract_number} — {formatCurrency(c.total_amount)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
                            <Button onClick={handleCreate} disabled={isPending}>
                                {isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                Tạo hạng mục
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="space-y-3 pt-4">
                {initialWorkItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Chưa có hạng mục nào. Nhấn "Thêm hạng mục" để bắt đầu.
                    </div>
                ) : (
                    initialWorkItems.map((item: any, idx: number) => (
                        <WorkItemRow
                            key={item.id}
                            item={item}
                            idx={idx}
                            isExpanded={expandedItems.has(item.id)}
                            onToggle={() => toggleExpand(item.id)}
                            onDelete={() => handleDelete(item.id)}
                            onStatusChange={(status) => handleUpdateStatus(item.id, status)}
                            project={project}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    )
}

/* ===== Single Work Item Row ===== */
function WorkItemRow({
    item, idx, isExpanded, onToggle, onDelete, onStatusChange, project
}: {
    item: any; idx: number; isExpanded: boolean; onToggle: () => void;
    onDelete: () => void; onStatusChange: (s: string) => void;
    project: any;
}) {
    const [isPending, startTransition] = useTransition()
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newLinkLabel, setNewLinkLabel] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const router = useRouter()

    const tasks = item.tasks || []
    const deliveryLinks = item.delivery_links || []
    const requiredDocs = item.required_documents || []

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return
        startTransition(async () => {
            try {
                await addTaskToWorkItem(item.id, project.id, { title: newTaskTitle })
                setNewTaskTitle('')
                router.refresh()
            } catch {
                toast.error('Lỗi khi thêm công việc')
            }
        })
    }

    const handleToggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'todo' : 'completed'
        startTransition(async () => {
            try {
                await updateTaskStatus(taskId, newStatus)
                router.refresh()
            } catch {
                toast.error('Lỗi khi cập nhật')
            }
        })
    }

    const handleDeleteTask = async (taskId: string) => {
        startTransition(async () => {
            try {
                await deleteTask(taskId)
                router.refresh()
            } catch {
                toast.error('Lỗi khi xóa')
            }
        })
    }

    const handleAddLink = async () => {
        if (!newLinkLabel.trim() || !newLinkUrl.trim()) return
        const updated = [...deliveryLinks, { label: newLinkLabel, url: newLinkUrl, date: new Date().toISOString() }]
        startTransition(async () => {
            try {
                await updateWorkItem(item.id, { delivery_links: updated })
                setNewLinkLabel('')
                setNewLinkUrl('')
                router.refresh()
            } catch {
                toast.error('Lỗi')
            }
        })
    }

    const handleRemoveLink = async (idx: number) => {
        const updated = deliveryLinks.filter((_: any, i: number) => i !== idx)
        startTransition(async () => {
            try {
                await updateWorkItem(item.id, { delivery_links: updated })
                router.refresh()
            } catch {
                toast.error('Lỗi')
            }
        })
    }

    const handleToggleDoc = async (docIdx: number) => {
        const updated = requiredDocs.map((d: any, i: number) => {
            if (i === docIdx) {
                return {
                    ...d,
                    status: d.status === 'signed' ? 'pending' : 'signed',
                    date: d.status === 'signed' ? null : new Date().toISOString(),
                }
            }
            return d
        })
        startTransition(async () => {
            try {
                await updateWorkItem(item.id, { required_documents: updated })
                router.refresh()
            } catch {
                toast.error('Lỗi')
            }
        })
    }

    const statusOption = STATUS_OPTIONS.find(s => s.value === item.status)

    return (
        <div className="border rounded-xl overflow-hidden">
            {/* Collapsed header */}
            <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={onToggle}
            >
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 text-white text-xs font-bold">
                    {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {item.quotation && (
                        <Badge variant="outline" className="text-[10px] h-5"><FileText className="w-3 h-3 mr-1" />{item.quotation.quotation_number}</Badge>
                    )}
                    {item.contract && (
                        <Badge variant="outline" className="text-[10px] h-5"><FileSignature className="w-3 h-3 mr-1" />{item.contract.contract_number}</Badge>
                    )}
                    <Select value={item.status} onValueChange={onStatusChange}>
                        <SelectTrigger className="h-7 text-xs w-[130px]" onClick={e => e.stopPropagation()}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="border-t p-4 bg-muted/10 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Col 1: Todo List */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <ListTodo className="w-3.5 h-3.5" />
                                Danh sách công việc ({tasks.length})
                            </h5>
                            <div className="space-y-1">
                                {tasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-2 group py-1">
                                        <button
                                            onClick={() => handleToggleTask(task.id, task.status)}
                                            className="shrink-0"
                                            disabled={isPending}
                                        >
                                            {task.status === 'completed' ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-zinc-300 hover:text-zinc-500" />
                                            )}
                                        </button>
                                        <span className={cn(
                                            "text-xs flex-1 truncate",
                                            task.status === 'completed' && "line-through text-muted-foreground"
                                        )}>
                                            {task.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="w-3 h-3 text-red-400 hover:text-red-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    placeholder="Thêm công việc..."
                                    className="h-8 text-xs"
                                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                    onClick={handleAddTask}
                                    disabled={isPending || !newTaskTitle.trim()}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Col 2: Delivery Links */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5" />
                                Link bàn giao ({deliveryLinks.length})
                            </h5>
                            <div className="space-y-1.5">
                                {deliveryLinks.map((link: any, lIdx: number) => (
                                    <div key={lIdx} className="flex items-center gap-2 group text-xs">
                                        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                                        <a href={link.url} target="_blank" className="text-blue-600 hover:underline truncate flex-1">
                                            {link.label}
                                        </a>
                                        {link.date && <span className="text-muted-foreground text-[10px] shrink-0">{formatDate(link.date)}</span>}
                                        <button
                                            onClick={() => handleRemoveLink(lIdx)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newLinkLabel}
                                    onChange={e => setNewLinkLabel(e.target.value)}
                                    placeholder="Tên link..."
                                    className="h-8 text-xs flex-1"
                                />
                                <Input
                                    value={newLinkUrl}
                                    onChange={e => setNewLinkUrl(e.target.value)}
                                    placeholder="URL..."
                                    className="h-8 text-xs flex-1"
                                    onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                    onClick={handleAddLink}
                                    disabled={isPending || !newLinkLabel.trim() || !newLinkUrl.trim()}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Col 3: Required Documents */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <ClipboardCheck className="w-3.5 h-3.5" />
                                Thủ tục chứng từ
                            </h5>
                            <div className="space-y-1">
                                {requiredDocs.map((doc: any, dIdx: number) => (
                                    <div key={dIdx} className="flex items-center gap-2 py-1">
                                        <button
                                            onClick={() => handleToggleDoc(dIdx)}
                                            className="shrink-0"
                                            disabled={isPending}
                                        >
                                            {doc.status === 'signed' ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-zinc-300 hover:text-zinc-500" />
                                            )}
                                        </button>
                                        <span className={cn(
                                            "text-xs",
                                            doc.status === 'signed' && "line-through text-muted-foreground"
                                        )}>
                                            {doc.title}
                                        </span>
                                        {doc.date && <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(doc.date)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end pt-2 border-t">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs" onClick={onDelete}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Xóa hạng mục
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
