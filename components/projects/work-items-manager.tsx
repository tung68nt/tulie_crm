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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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
import { BundleSelectorDialog } from './bundle-selector-dialog'
import { DocumentEditorDialog } from './document-editor-dialog'
import { FileEdit, Eye } from 'lucide-react'

interface WorkItemsManagerProps {
    project: any
    workItems: any[]
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    { value: 'in_progress', label: 'Đang thực hiện', color: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
    { value: 'delivered', label: 'Đã bàn giao', color: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold border-zinc-900' },
    { value: 'accepted', label: 'Đã nghiệm thu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
    { value: 'rejected', label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-200' },
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
    const [showBundleDialog, setShowBundleDialog] = useState(false)
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

    const [activeEditDocId, setActiveEditDocId] = useState<string | null>(null)
    const [activeWorkItemForBundle, setActiveWorkItemForBundle] = useState<any>(null)

    const handleUpdateStatus = async (id: string, status: string) => {
        const item = initialWorkItems.find(i => i.id === id)

        startTransition(async () => {
            try {
                await updateWorkItem(id, { status: status as any })

                // If moving to in_progress and no bundle assigned, prompt for bundle
                if (status === 'in_progress' && !item?.bundle_id) {
                    setActiveWorkItemForBundle(item)
                    setShowBundleDialog(true)
                }

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
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-zinc-900" />
                        Hạng mục dự án
                    </CardTitle>
                    <CardDescription className="text-xs">Quản lý các hạng mục, công việc, link bàn giao và chứng từ</CardDescription>
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
                            onEditDoc={setActiveEditDocId}
                        />
                    ))
                )}

                <BundleSelectorDialog
                    isOpen={showBundleDialog}
                    onOpenChange={setShowBundleDialog}
                    workItem={activeWorkItemForBundle}
                    project={project}
                />

                <DocumentEditorDialog
                    docId={activeEditDocId}
                    onClose={() => setActiveEditDocId(null)}
                />
            </CardContent>
        </Card>
    )
}

/* ===== Single Work Item Row ===== */
function WorkItemRow({
    item, idx, isExpanded, onToggle, onDelete, onStatusChange, project, onEditDoc
}: {
    item: any; idx: number; isExpanded: boolean; onToggle: () => void;
    onDelete: () => void; onStatusChange: (s: string) => void;
    project: any; onEditDoc: (docId: string) => void;
}) {
    const [isPending, startTransition] = useTransition()
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newLinkLabel, setNewLinkLabel] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const [showBundleDialog, setShowBundleDialog] = useState(false)
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

    const handleUpdateDocDate = async (docIdx: number, date: Date | undefined) => {
        if (!date) return
        const updated = requiredDocs.map((d: any, i: number) => {
            if (i === docIdx) {
                return { ...d, date: date.toISOString() }
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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        {item.quotation && (
                            <Badge variant="secondary" className="text-[10px] font-bold h-8 flex items-center px-3 rounded-full bg-white border border-zinc-100 text-zinc-600 shadow-sm hover:border-zinc-300 transition-all">
                                <FileText className="w-3 h-3 mr-1.5 text-zinc-400" />
                                {item.quotation.quotation_number}
                            </Badge>
                        )}
                        {item.contract && (
                            <Badge variant="secondary" className="text-[10px] font-bold h-8 flex items-center px-3 rounded-full bg-white border border-zinc-100 text-zinc-600 shadow-sm hover:border-zinc-300 transition-all">
                                <FileSignature className="w-3 h-3 mr-1.5 text-zinc-400" />
                                {item.contract.contract_number}
                            </Badge>
                        )}
                        <Select value={item.status} onValueChange={onStatusChange}>
                            <SelectTrigger className={cn("h-8 text-[11px] w-auto min-w-[130px] px-4 rounded-full border-none font-bold shadow-sm transition-all hover:scale-105 active:scale-95 uppercase tracking-widest", statusOption?.color)} onClick={e => e.stopPropagation()}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
                                {STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium focus:bg-zinc-50">{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="border-t border-zinc-50 p-6 bg-zinc-50/20 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Col 1: Todo List */}
                        <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <ListTodo className="w-3.5 h-3.5" />
                                Nội dung triển khai ({tasks.length})
                            </h5>
                            <div className="space-y-1">
                                {tasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-3 group py-1.5 px-2 rounded-xl hover:bg-white/50 transition-all">
                                        <button
                                            onClick={() => handleToggleTask(task.id, task.status)}
                                            className="shrink-0 transition-transform active:scale-90"
                                            disabled={isPending}
                                        >
                                            {task.status === 'completed' ? (
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-zinc-200 hover:border-zinc-400 bg-white" />
                                            )}
                                        </button>
                                        <span className={cn(
                                            "text-xs flex-1 font-medium transition-colors",
                                            task.status === 'completed' ? "line-through text-zinc-400" : "text-zinc-700"
                                        )}>
                                            {task.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-300 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 p-1 bg-white border border-zinc-100 rounded-xl shadow-sm">
                                <Input
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    placeholder="Thêm công việc..."
                                    className="h-8 text-xs border-none focus-visible:ring-0 px-2"
                                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-zinc-100"
                                    onClick={handleAddTask}
                                    disabled={isPending || !newTaskTitle.trim()}
                                >
                                    <Plus className="w-4 h-4 text-zinc-400" />
                                </Button>
                            </div>
                        </div>

                        {/* Col 2: Delivery Links */}
                        <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Link2 className="w-3.5 h-3.5" />
                                Link bàn giao ({deliveryLinks.length})
                            </h5>
                            <div className="space-y-2">
                                {deliveryLinks.map((link: any, lIdx: number) => (
                                    <div key={lIdx} className="flex items-center gap-3 group p-2.5 bg-white border border-zinc-100 rounded-xl shadow-sm group hover:border-zinc-300 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <a href={link.url} target="_blank" className="text-xs font-bold text-zinc-900 block truncate hover:underline underline-offset-2">
                                                {link.label}
                                            </a>
                                            {link.date && <p className="text-[10px] text-zinc-400 mt-0.5">{formatDate(link.date)}</p>}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveLink(lIdx)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-300 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 p-2 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                                <div className="flex gap-2">
                                    <Input
                                        value={newLinkLabel}
                                        onChange={e => setNewLinkLabel(e.target.value)}
                                        placeholder="Tên link..."
                                        className="h-9 text-xs hover:border-zinc-300 focus:border-zinc-400 transition-all bg-zinc-50/50 rounded-xl"
                                    />
                                    <Input
                                        value={newLinkUrl}
                                        onChange={e => setNewLinkUrl(e.target.value)}
                                        placeholder="URL bàn giao..."
                                        className="h-9 text-xs hover:border-zinc-300 focus:border-zinc-400 transition-all bg-zinc-50/50 rounded-xl"
                                        onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full h-9 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                                    onClick={handleAddLink}
                                    disabled={isPending || !newLinkLabel.trim() || !newLinkUrl.trim()}
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" />
                                    Thêm tài nguyên
                                </Button>
                            </div>
                        </div>

                        {/* Col 3: Required Documents */}
                        <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="w-3.5 h-3.5" />
                                    Thủ tục chứng từ
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-black px-4 rounded-full border border-blue-100 uppercase tracking-widest"
                                    onClick={() => setShowBundleDialog(true)}
                                >
                                    <Plus className="w-3 h-3 mr-1.5" />
                                    {item.bundle_id ? 'Thay đổi' : 'Chọn bộ chứng từ'}
                                </Button>
                            </h5>
                            <div className="space-y-1.5">
                                {requiredDocs.map((doc: any, dIdx: number) => (
                                    <div key={dIdx} className="flex items-center gap-3 p-2 px-3 rounded-xl hover:bg-white/50 transition-all group/doc">
                                        <button
                                            onClick={() => handleToggleDoc(dIdx)}
                                            className="shrink-0 transition-transform active:scale-90"
                                            disabled={isPending}
                                        >
                                            {doc.status === 'signed' ? (
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-zinc-200 hover:border-zinc-400 bg-white" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={cn(
                                                "text-xs font-medium block truncate",
                                                doc.status === 'signed' ? "text-zinc-400" : "text-zinc-700"
                                            )}>
                                                {doc.title}
                                            </span>
                                            {doc.date ? (
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                                    {doc.status === 'signed' ? 'Đã ký:' : 'Dự kiến:'} {formatDate(doc.date)}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider">Chưa có ngày</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-zinc-100 rounded-2xl shadow-xl" align="end">
                                                    <Calendar
                                                        mode="single"
                                                        selected={doc.date ? new Date(doc.date) : undefined}
                                                        onSelect={(d) => handleUpdateDocDate(dIdx, d)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {doc.generated_doc_id && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                        onClick={() => onEditDoc(doc.generated_doc_id)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                        onClick={() => onEditDoc(doc.generated_doc_id)}
                                                    >
                                                        <FileEdit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Delete and Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] text-zinc-400 italic">Cập nhật lần cuối: {formatDate(item.updated_at || item.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-xl px-4 h-9 uppercase tracking-wider" onClick={onDelete}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Xóa hạng mục
                        </Button>
                    </div>

                    <BundleSelectorDialog
                        isOpen={showBundleDialog}
                        onOpenChange={setShowBundleDialog}
                        workItem={item}
                        project={project}
                    />
                </div>
            )}
        </div>
    )
}
