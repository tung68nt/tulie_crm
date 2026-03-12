'use client'

import { useState, useTransition, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
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
    Undo2,
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
    { value: 'pending', label: 'Chờ xử lý', color: 'bg-muted text-muted-foreground' },
    { value: 'in_progress', label: 'Đang thực hiện', color: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' },
    { value: 'delivered', label: 'Đã bàn giao', color: 'bg-primary text-primary-foreground font-semibold' },
    { value: 'accepted', label: 'Đã nghiệm thu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' },
    { value: 'rejected', label: 'Từ chối', color: 'bg-destructive/10 text-destructive border-destructive/20' },
]

const DEFAULT_DOCUMENTS = [
    'Báo giá (đã gửi)',
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
        quotation_ids: [] as string[],
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
                // Use first quotation_id for DB column (backward compat) + store full array in metadata
                const primaryQuotationId = newItem.quotation_ids[0] || undefined
                await createWorkItem({
                    project_id: project.id,
                    title: newItem.title,
                    description: newItem.description,
                    quotation_id: primaryQuotationId,
                    contract_id: newItem.contract_id || undefined,
                    sort_order: initialWorkItems.length,
                    required_documents: DEFAULT_DOCUMENTS.map(d => ({
                        title: d,
                        status: 'pending' as const,
                    })),
                    metadata: newItem.quotation_ids.length > 1 ? { quotation_ids: newItem.quotation_ids } : undefined,
                } as any)
                toast.success('Đã tạo hạng mục mới')
                setShowCreateDialog(false)
                setNewItem({ title: '', description: '', quotation_ids: [], contract_id: '' })
                router.refresh()
            } catch (err: any) {
                toast.error(`Lỗi tạo hạng mục: ${err?.message || 'Không thể kết nối server'}`)
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
            } catch (err: any) {
                toast.error(`Lỗi xóa hạng mục: ${err?.message || 'Thử lại sau'}`)
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
            } catch (err: any) {
                toast.error(`Lỗi cập nhật trạng thái: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

    const handleRename = async (id: string, title: string) => {
        startTransition(async () => {
            try {
                await updateWorkItem(id, { title })
                router.refresh()
            } catch (err: any) {
                toast.error(`Lỗi đổi tên: ${err?.message || 'Thử lại sau'}`)
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
                                    <Label>Gán báo giá <span className="text-xs text-muted-foreground font-normal">(có thể chọn nhiều)</span></Label>
                                    <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                                        {quotations.map((q: any) => {
                                            const isChecked = newItem.quotation_ids.includes(q.id)
                                            return (
                                                <label
                                                    key={q.id}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors",
                                                        isChecked && "bg-zinc-50"
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            setNewItem(prev => ({
                                                                ...prev,
                                                                quotation_ids: checked
                                                                    ? [...prev.quotation_ids, q.id]
                                                                    : prev.quotation_ids.filter((id: string) => id !== q.id)
                                                            }))
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{q.quotation_number}</p>
                                                        <p className="text-xs text-muted-foreground">{formatCurrency(q.total_amount)}</p>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
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
                            onRename={(title) => handleRename(item.id, title)}
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
    item, idx, isExpanded, onToggle, onDelete, onStatusChange, onRename, project, onEditDoc
}: {
    item: any; idx: number; isExpanded: boolean; onToggle: () => void;
    onDelete: () => void; onStatusChange: (s: string) => void; onRename: (title: string) => void;
    project: any; onEditDoc: (docId: string) => void;
}) {
    const [isPending, startTransition] = useTransition()
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newLinkLabel, setNewLinkLabel] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')
    const [showBundleDialog, setShowBundleDialog] = useState(false)
    const [isRenaming, setIsRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState(item.title)
    const router = useRouter()

    // Compute all quotation IDs from metadata or primary
    const allQuotationIds: string[] = useMemo(() => {
        if (item.metadata?.quotation_ids?.length) return item.metadata.quotation_ids
        if (item.quotation_id) return [item.quotation_id]
        return []
    }, [item.metadata?.quotation_ids, item.quotation_id])

    const [editQuotationIds, setEditQuotationIds] = useState<string[]>(allQuotationIds)

    const handleSaveQuotations = async () => {
        startTransition(async () => {
            try {
                const primaryId = editQuotationIds[0] || undefined
                await updateWorkItem(item.id, {
                    quotation_id: primaryId,
                    metadata: {
                        ...(item.metadata || {}),
                        quotation_ids: editQuotationIds,
                    },
                })
                toast.success('Đã cập nhật báo giá cho hạng mục')
                router.refresh()
            } catch (err: any) {
                toast.error(`Lỗi cập nhật báo giá: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

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
            } catch (err: any) {
                toast.error(`Lỗi thêm công việc: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

    const handleToggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'todo' : 'completed'
        startTransition(async () => {
            try {
                await updateTaskStatus(taskId, newStatus)
                router.refresh()
            } catch (err: any) {
                toast.error(`Lỗi cập nhật công việc: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

    const handleDeleteTask = async (taskId: string) => {
        const task = tasks.find((t: any) => t.id === taskId)
        const taskTitle = task?.title || 'công việc'

        startTransition(async () => {
            try {
                await deleteTask(taskId)
                router.refresh()
                toast('Đã xoá: ' + taskTitle, {
                    action: {
                        label: 'Hoàn tác',
                        onClick: async () => {
                            try {
                                await addTaskToWorkItem(item.id, project.id, { title: taskTitle })
                                router.refresh()
                                toast.success('Đã hoàn tác')
                            } catch {
                                toast.error('Không thể hoàn tác')
                            }
                        }
                    },
                    duration: 5000,
                })
            } catch (err: any) {
                toast.error(`Lỗi xóa công việc: ${err?.message || 'Thử lại sau'}`)
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
            } catch (err: any) {
                toast.error(`Lỗi thêm link bàn giao: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

    const handleRemoveLink = async (idx: number) => {
        const removedLink = deliveryLinks[idx]
        const updated = deliveryLinks.filter((_: any, i: number) => i !== idx)
        startTransition(async () => {
            try {
                await updateWorkItem(item.id, { delivery_links: updated })
                router.refresh()
                toast('Đã xoá link: ' + (removedLink?.label || 'link'), {
                    action: {
                        label: 'Hoàn tác',
                        onClick: async () => {
                            try {
                                await updateWorkItem(item.id, { delivery_links: deliveryLinks })
                                router.refresh()
                                toast.success('Đã hoàn tác')
                            } catch {
                                toast.error('Không thể hoàn tác')
                            }
                        }
                    },
                    duration: 5000,
                })
            } catch (err: any) {
                toast.error(`Lỗi xóa link: ${err?.message || 'Thử lại sau'}`)
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
            } catch (err: any) {
                toast.error(`Lỗi cập nhật ngày chứng từ: ${err?.message || 'Thử lại sau'}`)
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
            } catch (err: any) {
                toast.error(`Lỗi cập nhật chứng từ: ${err?.message || 'Thử lại sau'}`)
            }
        })
    }

    const statusOption = STATUS_OPTIONS.find(s => s.value === item.status)

    return (
        <div className="border rounded-lg overflow-hidden">
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
                    {isRenaming ? (
                        <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && renameValue.trim()) {
                                    onRename(renameValue.trim())
                                    setIsRenaming(false)
                                } else if (e.key === 'Escape') {
                                    setRenameValue(item.title)
                                    setIsRenaming(false)
                                }
                            }}
                            onBlur={() => {
                                if (renameValue.trim() && renameValue.trim() !== item.title) {
                                    onRename(renameValue.trim())
                                }
                                setIsRenaming(false)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 text-sm font-semibold"
                        />
                    ) : (
                        <p
                            className="text-sm font-semibold truncate cursor-text"
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                setRenameValue(item.title)
                                setIsRenaming(true)
                            }}
                            title="Nhấp đúp để đổi tên"
                        >{item.title}</p>
                    )}
                    {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {allQuotationIds.length > 0 && (
                        <Badge variant="secondary" className="font-medium h-7 flex items-center px-2.5 rounded-md border text-muted-foreground shadow-sm">
                            <FileText className="w-3 h-3 mr-1.5" />
                            {allQuotationIds.length} báo giá
                        </Badge>
                    )}
                    {item.contract && (
                        <Badge variant="secondary" className="font-medium h-7 flex items-center px-2.5 rounded-md border text-muted-foreground shadow-sm">
                            <FileSignature className="w-3 h-3 mr-1.5" />
                            {item.contract.contract_number}
                        </Badge>
                    )}
                    <Select value={item.status} onValueChange={onStatusChange}>
                        <SelectTrigger className={cn("h-7 text-xs w-auto min-w-[130px] px-3 font-medium shadow-none outline-none focus:ring-0", statusOption?.color)} onClick={e => e.stopPropagation()}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="p-1 hover:bg-muted rounded-md transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                    </div>
                </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
                <div className="border-t border-zinc-50 p-6 bg-zinc-50/20 space-y-8">
                    <div className="space-y-8">
                        {/* Báo giá section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <FileText className="w-4 h-4" />
                                    Báo giá ({allQuotationIds.length})
                                </h5>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                                            <Plus className="w-3 h-3" />
                                            Gán báo giá
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72 p-0" align="end">
                                        <div className="p-3 border-b">
                                            <p className="text-xs font-semibold">Gán báo giá cho hạng mục</p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {(project.quotations || []).length === 0 ? (
                                                <p className="text-xs text-muted-foreground p-3">Chưa có báo giá nào</p>
                                            ) : (
                                                (project.quotations || []).map((q: any) => {
                                                    const isChecked = editQuotationIds.includes(q.id)
                                                    return (
                                                        <label
                                                            key={q.id}
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-zinc-50 transition-colors",
                                                                isChecked && "bg-zinc-50"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    setEditQuotationIds(prev =>
                                                                        checked
                                                                            ? [...prev, q.id]
                                                                            : prev.filter((id: string) => id !== q.id)
                                                                    )
                                                                }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{q.quotation_number}</p>
                                                                <p className="text-[10px] text-muted-foreground">{q.title || formatCurrency(q.total_amount)}</p>
                                                            </div>
                                                        </label>
                                                    )
                                                })
                                            )}
                                        </div>
                                        <div className="p-2 border-t">
                                            <Button
                                                size="sm"
                                                className="w-full h-7 text-xs"
                                                disabled={isPending}
                                                onClick={handleSaveQuotations}
                                            >
                                                {isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                                Lưu
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {allQuotationIds.length > 0 ? (
                                <div className="space-y-2">
                                    {allQuotationIds.map((qId: string) => {
                                        const q = (project.quotations || []).find((q: any) => q.id === qId)
                                        if (!q) return null
                                        return (
                                            <div key={qId} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-900">{q.quotation_number}</p>
                                                        {q.title && <p className="text-[10px] text-muted-foreground">{q.title}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold tabular-nums text-zinc-700">{formatCurrency(q.total_amount)}</span>
                                                    <Badge variant="outline" className="text-[10px] h-5">{q.status === 'accepted' ? 'Đã duyệt' : q.status === 'sent' ? 'Đã gửi' : 'Nháp'}</Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground py-2">Chưa gán báo giá nào</p>
                            )}
                        </div>

                        {/* Col 1: Todo List */}
                        <div className="space-y-4">
                            <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <ListTodo className="w-4 h-4" />
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
                            <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <Link2 className="w-4 h-4" />
                                Link bàn giao ({deliveryLinks.length})
                            </h5>
                            <div className="space-y-2">
                                {deliveryLinks.map((link: any, lIdx: number) => (
                                    <div key={lIdx} className="flex items-center gap-3 group p-2.5 bg-white border border-zinc-100 rounded-xl shadow-sm group hover:border-zinc-300 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <a href={link.url} target="_blank" className="text-xs font-semibold block truncate hover:underline underline-offset-2">
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
                            <div className="space-y-2 p-2 bg-white border border-zinc-100 rounded-xl shadow-sm">
                                <div className="flex gap-2">
                                    <Input
                                        value={newLinkLabel}
                                        onChange={e => setNewLinkLabel(e.target.value)}
                                        placeholder="Tên link..."
                                        className="h-9 text-xs"
                                    />
                                    <Input
                                        value={newLinkUrl}
                                        onChange={e => setNewLinkUrl(e.target.value)}
                                        placeholder="URL bàn giao..."
                                        className="h-9 text-xs"
                                        onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full h-9"
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
                            <div className="flex items-center justify-between gap-2">
                                <h5 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <ClipboardCheck className="w-4 h-4" />
                                    Thủ tục chứng từ
                                </h5>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs shrink-0"
                                    onClick={() => setShowBundleDialog(true)}
                                >
                                    <Plus className="w-3 h-3 mr-1.5" />
                                    {item.bundle_id ? 'Thay đổi' : 'Chọn bộ chứng từ'}
                                </Button>
                            </div>
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
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    {doc.status === 'signed' ? 'Đã ký:' : 'Dự kiến:'} {formatDate(doc.date)}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium text-muted-foreground/50">Chưa có ngày</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="end">
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
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">Cập nhật lần cuối: {formatDate(item.updated_at || item.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
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
