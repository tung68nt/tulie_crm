'use client'

import { useState, useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    CheckCircle2,
    Clock,
    FileText,
    Building2,
    FileSignature,
    ExternalLink,
    ChevronRight,
    Package,
    Link2,
    ClipboardCheck,
    ListTodo,
    AlertCircle,
    Circle,
    CheckCircle,
    ArrowRight,
    Wallet,
    CreditCard,
    Banknote,
    Activity,
    FileCheck,
    Check,
    BookOpen,
    Eye,
    Receipt
} from 'lucide-react'
import { getGeneratedDocumentById } from '@/lib/supabase/services/document-template-service'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CustomerInfoForm, isCustomerInfoComplete } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { sanitizeHtml } from '@/lib/security/sanitize'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { usePortalTracking } from '@/hooks/use-portal-tracking'

interface PortalContentProps {
    data: {
        quotation: any
        quotations: any[]
        contracts: any[]
        invoices: any[]
        tasks: any[]
        timeline: any[]
        customer: any
        project: any
        projectMetadata: any
        brandConfig: any
        workItems?: any[]
        activities?: any[] // Add this
    }
    token: string
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    'pending': { label: 'Chờ xử lý', bg: 'bg-zinc-50', text: 'text-zinc-500', dot: 'bg-zinc-400', border: 'border-zinc-200' },
    'in_progress': { label: 'Đang thực hiện', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'delivered': { label: 'Đã bàn giao', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' },
    'accepted': { label: 'Đã nghiệm thu', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'rejected': { label: 'Từ chối', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    'draft': { label: 'Nháp', bg: 'bg-zinc-50', text: 'text-zinc-400', dot: 'bg-zinc-300', border: 'border-zinc-200' },
    'sent': { label: 'Đã gửi', bg: 'bg-white', text: 'text-zinc-600', dot: 'bg-zinc-500', border: 'border-zinc-200' },
    'viewed': { label: 'Đã xem', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'active': { label: 'Đang triển khai', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'completed': { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'signed': { label: 'Đã ký', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'paid': { label: 'Đã thanh toán', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'todo': { label: 'Cần làm', bg: 'bg-zinc-50', text: 'text-zinc-500', dot: 'bg-zinc-400', border: 'border-zinc-200' },
    'blocked': { label: 'Bị chặn', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    'upcoming': { label: 'Sắp tới', bg: 'bg-zinc-50', text: 'text-zinc-400', dot: 'bg-zinc-300', border: 'border-zinc-200' },
    'overdue': { label: 'Trễ hạn', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, bg: 'bg-zinc-50', text: 'text-zinc-500', dot: 'bg-zinc-400', border: 'border-zinc-200' }
    return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border", s.bg, s.border)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
            <span className={cn("text-[11px] font-normal", s.text)}>{s.label}</span>
        </div>
    )
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const {
        quotations = [], contracts = [], invoices = [],
        timeline = [], customer, project, brandConfig,
        workItems = [], tasks = []
    } = data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDocContent, setSelectedDocContent] = useState<string | null>(null)
    const [isViewingDoc, setIsViewingDoc] = useState(false)

    const handleViewDoc = async (docId: string) => {
        trackInteraction('view_document', { docId })
        try {
            const doc = await getGeneratedDocumentById(docId)
            if (doc) {
                setSelectedDocContent(doc.content)
                setIsViewingDoc(true)
            }
        } catch (err) {
            toast.error('Không thể tải tài liệu')
        }
    }

    // View contract document content directly (from contract_documents table)
    const handleViewContractDoc = (htmlContent: string) => {
        setSelectedDocContent(htmlContent)
        setIsViewingDoc(true)
    }
    const router = useRouter()
    const { confirm } = useConfirm()

    // Portal view tracking
    const { trackInteraction } = usePortalTracking({
        portalToken: token,
        projectId: project?.id,
        customerId: customer?.id
    })

    // Fallback: if no work items yet, build from quotations (legacy mode)
    const displayItems = useMemo(() => {
        if (workItems.length > 0) return workItems
        return quotations.map((q: any) => ({
            id: q.id,
            title: q.title || `Báo giá #${q.quotation_number}`,
            status: q.status === 'accepted' ? 'in_progress' : 'pending',
            quotation: q,
            contract: contracts.find((c: any) => c.quotation_id === q.id) || null,
            delivery_links: [],
            required_documents: [],
            tasks: tasks.filter((t: any) => !t.work_item_id),
            total_amount: q.total_amount || 0,
        }))
    }, [workItems, quotations, contracts, tasks])

    // Quotation selection state: map workItemId -> selected quotationId
    // Initialize with the first (or accepted) quotation for each work item
    const [selectedQuotationMap, setSelectedQuotationMap] = useState<Record<string, string>>(() => {
        const map: Record<string, string> = {}
        displayItems.forEach((item: any) => {
            if (item.quotation) {
                map[item.id] = item.quotation.id
            }
        })
        return map
    })

    const handleSelectQuotation = useCallback((workItemId: string, quotationId: string) => {
        setSelectedQuotationMap(prev => ({ ...prev, [workItemId]: quotationId }))
    }, [])

    // Find quotation alternatives for each work item
    // Return all quotations linked via metadata.quotation_ids or single quotation_id
    const getQuotationOptionsForItem = useCallback((item: any): any[] => {
        // Check metadata.quotation_ids first (multi-quotation support)
        if (item.metadata?.quotation_ids?.length) {
            return item.metadata.quotation_ids
                .map((qId: string) => quotations.find((q: any) => q.id === qId))
                .filter(Boolean)
        }
        // Fallback: single quotation
        if (!item.quotation_id && !item.quotation) return []
        const itemQuotation = item.quotation || quotations.find((q: any) => q.id === item.quotation_id)
        if (!itemQuotation) return []
        return [itemQuotation]
    }, [quotations])

    // Aggregate Calculations — based on selected quotation per item
    const totalInvestment = useMemo(() => {
        if (quotations.length <= 1) {
            return quotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
        }
        // Sum only the selected quotation per work item (avoid double-counting)
        const selectedIds = new Set(Object.values(selectedQuotationMap))
        if (selectedIds.size === 0) {
            // fallback: take first quotation only
            return quotations.length > 0 ? (quotations[0].total_amount || 0) : 0
        }
        return quotations
            .filter((q: any) => selectedIds.has(q.id))
            .reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    }, [quotations, selectedQuotationMap])

    const totalPaid = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: any, inv: any) => sum + (inv.total_amount || 0), 0)
    const balanceDue = totalInvestment - totalPaid
    const completedItems = workItems.filter((w: any) => w.status === 'accepted').length
    const projectProgress = workItems.length > 0
        ? Math.round((completedItems / workItems.length) * 100)
        : (timeline.length > 0
            ? Math.round((timeline.filter((t: any) => t.status === 'completed').length / timeline.length) * 100)
            : 0)

    const hasContracts = contracts.length > 0
    const projectStatusLabel = hasContracts ? "Đang triển khai" : "Chờ triển khai"
    const hasMultipleQuotations = quotations.filter((q: any) => ['draft','sent','viewed','accepted'].includes(q.status)).length > 1

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 pt-10 pb-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <img
                            src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                            alt="Logo"
                            className="h-14 w-auto object-contain grayscale"
                        />
                        <div className="w-px h-10 bg-zinc-200" />
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Customer Portal</h1>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">Dự án & Tài liệu</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h2 className="text-2xl font-bold text-zinc-950 tracking-tighter">{customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full border mt-3",
                            hasContracts ? "bg-blue-50 border-blue-200" : "bg-zinc-50 border-zinc-200"
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", hasContracts ? "bg-blue-500" : "bg-zinc-400")} />
                            <span className={cn("text-[11px] font-normal", hasContracts ? "text-blue-700" : "text-zinc-500")}>{projectStatusLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
                {/* Update Info CTA — hidden when all fields are filled */}
                {!isCustomerInfoComplete(customer) && (
                <div className="relative rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden text-white bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800">
                    <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '16px 16px', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)' }}>
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-lg font-semibold tracking-tight">Cần cập nhật thông tin?</h3>
                        <p className="text-sm text-zinc-400 max-w-md font-normal">Vui lòng kiểm tra và cập nhật thông tin xuất hóa đơn hoặc yêu cầu thay đổi trực tiếp tại đây.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="relative z-10 bg-white text-zinc-900 hover:bg-zinc-100 font-semibold rounded-xl px-10 h-12 shadow-xl transition-all text-xs">
                                Cập nhật hồ sơ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-xl p-0 overflow-hidden border-none shadow-xl [&_[data-slot=dialog-close]_svg]:text-white">
                            <div className="bg-zinc-900 text-white p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold tracking-tight">Cập nhật hồ sơ khách hàng</DialogTitle>
                                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Customer Information & Identity</p>
                                </DialogHeader>
                            </div>
                            <div className="p-8">
                                <CustomerInfoForm
                                    customer={customer}
                                    token={token}
                                    onComplete={() => {
                                        setIsDialogOpen(false)
                                        router.refresh()
                                        toast.success('Đã cập nhật thông tin thành công!')
                                    }}
                                    onDraftSave={() => {
                                        setIsDialogOpen(false)
                                        router.refresh()
                                    }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                )}


                {/* Stats Row — Clean, no uppercase, no letter-spacing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng đầu tư', value: totalInvestment, sub: 'Project Investment', icon: Wallet, color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
                        { label: 'Đã thanh toán', value: totalPaid, sub: 'Total Paid', icon: CreditCard, color: 'text-zinc-950', bgColor: 'bg-zinc-100' },
                        { label: 'Còn lại', value: balanceDue, sub: 'Balance Due', icon: Banknote, color: 'text-zinc-950', bgColor: 'bg-zinc-100' },
                        { label: 'Tiến độ', value: `${projectProgress}%`, sub: 'Project Progress', icon: Activity, color: 'text-zinc-950', bgColor: 'bg-zinc-100' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                <div className={cn("p-1.5 rounded-lg border border-zinc-100", stat.bgColor)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-lg sm:text-2xl font-bold text-zinc-950 tracking-tighter tabular-nums truncate">
                                    {typeof stat.value === 'number' ? formatCurrency(stat.value).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim() : stat.value}
                                </div>
                                {typeof stat.value === 'number' && (
                                    <div className="text-sm font-semibold text-muted-foreground">đ</div>
                                )}
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-widest">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Mô tả dự án */}
                {project?.description && (
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Mô tả dự án</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line font-medium">{project.description}</p>
                    </div>
                )}



                {/* Hạng mục dự án */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-zinc-900" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-zinc-950 tracking-tight leading-tight">Hạng mục & Lộ trình thực hiện</h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">Deliverables & Progress</p>
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-zinc-500 tabular-nums whitespace-nowrap">
                                {displayItems.length} hạng mục · {completedItems} đã nghiệm thu
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {displayItems.map((item: any, idx: number) => (
                            <WorkItemCard
                                key={item.id}
                                item={item}
                                idx={idx}
                                token={token}
                                quotationOptions={getQuotationOptionsForItem(item)}
                                selectedQuotationId={selectedQuotationMap[item.id]}
                                onSelectQuotation={(qId: string) => handleSelectQuotation(item.id, qId)}
                                timeline={timeline}
                                contracts={contracts}
                                onViewContractDoc={handleViewContractDoc}
                                onViewDoc={handleViewDoc}
                            />
                        ))}

                        {displayItems.length === 0 && (
                            <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center">
                                <Package className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">Chưa có hạng mục nào được tạo cho dự án này.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bộ thủ tục chứng từ đã được dời vào trong Hạng mục thay vì hiển thị riêng lẻ */}

                {/* Gantt View Section */}
                <ProjectGanttChart tasks={data.tasks || []} />

                {/* Activity History Section */}
                <ProjectActivityHistory projectId={project?.id} activities={data.activities} />

                {/* Tiện ích khác — Hidden for now as it's redundant with the new milestone cards */}
                {/* Document Viewer Dialog for Portal */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="max-w-[95vw] lg:max-w-[1100px] w-full p-0 overflow-hidden bg-zinc-50 border-none rounded-xl" showCloseButton={false}>
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-zinc-900" />
                                </div>
                                <DialogTitle className="text-base font-semibold text-zinc-900">Chi tiết tài liệu</DialogTitle>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setIsViewingDoc(false)}
                                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            >
                                Đóng
                            </Button>
                        </div>

                        <div className="px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[85vh]">
                            <style>{`
                                .portal-doc-viewer > div { padding: 10mm 15mm !important; }
                                @media (min-width: 1024px) { .portal-doc-viewer > div { padding: 15mm 20mm !important; } }
                            `}</style>
                            <div
                                className="portal-doc-viewer bg-white shadow-lg border border-zinc-200 text-[#000] mx-auto"
                                style={{ maxWidth: '210mm', minHeight: '297mm' }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedDocContent || '') }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

/* ===== Work Item Card ===== */
function WorkItemCard({ item, idx, token, quotationOptions = [], selectedQuotationId, onSelectQuotation, timeline = [], contracts = [], onViewContractDoc, onViewDoc }: {
    item: any; idx: number; token: string;
    quotationOptions?: any[];
    selectedQuotationId?: string;
    onSelectQuotation?: (qId: string) => void;
    timeline?: any[];
    contracts?: any[];
    onViewContractDoc?: (htmlContent: string) => void;
    onViewDoc?: (docId: string) => void;
}) {
    const quotation = item.quotation
    const contract = item.contract
    const deliveryLinks = item.delivery_links || []
    const itemTasks = item.tasks || []
    const completedTasks = itemTasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = itemTasks.length

    // Determine the active quotation (selected vs default)
    const activeQuotation = quotationOptions.length > 1
        ? quotationOptions.find((q: any) => q.id === selectedQuotationId) || quotation
        : quotation

    const activeAmount = activeQuotation?.total_amount || item.total_amount || 0

    // Get milestones for this work item's contract
    const contractId = contract?.id
    const itemMilestones = contractId
        ? timeline.filter((t: any) => t.contract_id === contractId && (t.type === 'work' || t.type === 'payment'))
        : []

    return (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:border-zinc-300 transition-all">
            {/* Header — always on top */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white text-sm font-semibold">
                        {idx + 1}
                    </div>
                    <div>
                        <h4 className="text-[15px] font-semibold text-zinc-950 tracking-tight leading-tight">{item.title}</h4>
                        {item.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.description}</p>}
                    </div>
                </div>
                <StatusBadge status={item.status} />
            </div>

            {/* Quotation Switcher — sleek inline strip */}
            {quotationOptions.length > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                            <ListTodo className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-700 leading-tight">Phương án báo giá</p>
                            <p className="text-xs text-zinc-400">Chọn phương án phù hợp để xem chi tiết</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quotationOptions.map((q: any, qIdx: number) => {
                            const isActive = q.id === (selectedQuotationId || quotation?.id)
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuotation?.(q.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-center border",
                                        isActive
                                            ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:shadow-sm"
                                    )}
                                >
                                    <span className={cn("text-xs font-bold uppercase tracking-wide", isActive ? "text-zinc-400" : "text-zinc-400")}>
                                        {q.status === 'accepted' ? '✓' : `PA${qIdx + 1}`}
                                    </span>
                                    <span className={cn("text-sm font-bold tabular-nums", isActive ? "text-white" : "text-zinc-900")}>
                                        {formatCurrency(q.total_amount)}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row">
                {/* Left: Info */}
                <div className="lg:w-2/5 p-5 border-b lg:border-b-0 lg:border-r border-zinc-100 space-y-5">
                    {/* Documents linked */}
                    <div className="space-y-2">
                        {(() => {
                            const renderedDocs: any[] = []
                            // 1. Quotaion
                            if (activeQuotation && ['sent', 'viewed', 'accepted', 'converted'].includes(activeQuotation.status)) {
                                renderedDocs.push({
                                    title: 'Báo giá',
                                    key: 'quotation',
                                    number: activeQuotation.quotation_number,
                                    status: activeQuotation.status,
                                    icon: FileText,
                                    link: `/quote/${activeQuotation.public_token || token}`
                                })
                            }

                            // 2. Contract Documents
                            if (contract) {
                                const contractDocs: any[] = contract.documents || []
                                const visibleDocs = contractDocs.filter((d: any) => d.is_visible_on_portal !== false)
                                const paymentDocs = visibleDocs.filter((d: any) => d.type === 'payment_request')
                                const DOC_TYPE_LABELS: Record<string, string> = {
                                    contract: 'Hợp đồng',
                                    order: 'Đơn đặt hàng',
                                    payment_request: 'Đề nghị thanh toán',
                                    delivery_minutes: 'Biên bản bàn giao',
                                    acceptance: 'Biên bản nghiệm thu',
                                }

                                for (const d of visibleDocs) {
                                    const metaTitle = DOC_TYPE_LABELS[d.type] || d.type
                                    let docTitle = metaTitle
                                    if (d.type === 'payment_request' && paymentDocs.length > 1) {
                                        const idx = paymentDocs.indexOf(d) + 1
                                        docTitle = `${metaTitle} đợt ${idx}`
                                    }

                                    renderedDocs.push({
                                        title: docTitle,
                                        key: d.id,
                                        number: d.doc_number || (d.type === 'contract' ? contract.contract_number : ''),
                                        status: d.status,
                                        icon: FileSignature,
                                        docId: d.id,
                                        content: d.content
                                    })
                                }
                            }

                            return renderedDocs.map((d, i) => (
                                <div key={d.key || i} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <d.icon className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{d.title}</p>
                                            <p className="text-xs font-bold font-mono text-zinc-900 mt-0.5">#{d.number || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={d.status} />
                                        {d.link ? (
                                            <a href={d.link} target="_blank" className="flex items-center justify-center w-7 h-7 bg-white rounded-lg border border-zinc-200 hover:bg-zinc-100 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                                            </a>
                                        ) : d.docId ? (
                                            <button
                                                onClick={() => d.content ? onViewContractDoc?.(d.content) : onViewDoc?.(d.docId)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-700"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Xem
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>

                    {/* Amount */}
                    <div className="pt-4 border-t border-zinc-100">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Giá trị hạng mục</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tighter tabular-nums">{formatCurrency(activeAmount).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim()}</span>
                            <span className="text-sm font-semibold text-zinc-900">đ</span>
                        </div>
                    </div>

                    {/* Payment Milestones — List format */}
                    {itemMilestones.length > 0 && (
                        <div className="pt-4 border-t border-zinc-100">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Wallet className="w-3 h-3" />
                                Lộ trình thanh toán
                            </p>
                            <div className="space-y-2">
                                {itemMilestones.map((m: any, mIdx: number) => (
                                    <div key={m.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-zinc-50/80 hover:bg-zinc-100/80 transition-colors">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                            m.status === 'completed'
                                                ? "bg-zinc-900 text-white"
                                                : "bg-white text-zinc-500 border border-zinc-300"
                                        )}>
                                            {m.status === 'completed' ? <Check className="w-3 h-3" /> : mIdx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={cn(
                                                "text-[12px] font-semibold leading-tight",
                                                m.status === 'completed' ? "text-zinc-400 line-through" : "text-zinc-800"
                                            )}>
                                                {m.title}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                                Hạn: {formatDate(m.date)}
                                            </p>
                                        </div>
                                        {m.amount > 0 && (
                                            <div className="text-right shrink-0">
                                                <span className="text-[12px] font-bold text-zinc-950 tabular-nums">
                                                    {formatCurrency(m.amount).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim()}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 ml-0.5">đ</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delivery Links */}
                    {deliveryLinks.length > 0 && (
                        <div className="pt-3 border-t border-zinc-100">
                            <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                                <Link2 className="w-3 h-3" />
                                Link sản phẩm bàn giao
                            </p>
                            <div className="space-y-1.5">
                                {deliveryLinks.map((link: any, lIdx: number) => (
                                    <a key={lIdx} href={link.url} target="_blank"
                                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors group">
                                        <div className="flex items-center gap-2">
                                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                                            <span className="text-[12px] font-medium text-zinc-700">{link.label}</span>
                                        </div>
                                        {link.date && <span className="text-xs text-zinc-400">{formatDate(link.date)}</span>}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Tasks (Todo List) */}
                <div className="lg:w-3/5 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                            <ListTodo className="w-3.5 h-3.5" />
                            Danh sách công việc
                        </p>
                        {totalTasks > 0 && (
                            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                                {completedTasks}/{totalTasks}
                            </span>
                        )}
                    </div>

                    {totalTasks > 0 ? (
                        <div className="space-y-1.5">
                            {/* Progress bar */}
                            {totalTasks > 0 && (
                                <div className="mb-4">
                                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                                            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            {itemTasks.map((task: any) => (
                                <div key={task.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-zinc-50 transition-colors">
                                    {task.status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
                                    ) : task.status === 'in_progress' ? (
                                        <Clock className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                    ) : task.status === 'blocked' ? (
                                        <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className={cn(
                                            "text-[13px]",
                                            task.status === 'completed'
                                                ? "line-through text-zinc-400"
                                                : "text-zinc-800"
                                        )}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-zinc-400 mt-0.5 truncate">{task.description}</p>
                                        )}
                                    </div>
                                    {task.priority === 'high' && (
                                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Cao</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <ListTodo className="w-6 h-6 text-zinc-200 mx-auto mb-2" />
                            <p className="text-xs text-zinc-400">Lộ trình công việc đang được cập nhật</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


/* ===== Timeline Section ===== */
function TimelineSection({ timeline }: { timeline: any[] }) {
    if (timeline.length === 0) return null

    return (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-lg font-semibold text-zinc-950 tracking-tight leading-tight">Tiến độ triển khai chi tiết</h3>
                        <p className="text-xs text-zinc-400 uppercase tracking-widest">Live Updates & Timeline</p>
                    </div>
                </div>
            </div>
            <div className="p-5">
                <div className="relative pl-6 border-l-2 border-zinc-100 ml-2 space-y-6">
                    {timeline.map((event, eIdx) => (
                        <div key={event.id} className="relative">
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[25px] top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-white",
                                event.status === 'completed' ? "border-zinc-900" : "border-zinc-200"
                            )}>
                                {event.status === 'completed' && <div className="absolute inset-0.5 rounded-full bg-zinc-900" />}
                            </div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <h6 className={cn(
                                        "text-[13px] font-semibold",
                                        event.status === 'completed' ? "text-zinc-900" : "text-zinc-400"
                                    )}>
                                        {event.title}
                                    </h6>
                                    {event.description && (
                                        <p className="text-[12px] text-zinc-500 mt-0.5 max-w-lg">{event.description}</p>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-400 shrink-0 ml-4">{formatDate(event.date)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
