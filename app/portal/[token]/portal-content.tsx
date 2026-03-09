'use client'

import { useState } from 'react'
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
import { CustomerInfoForm } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'

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
    }
    token: string
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'pending': { label: 'Chờ xử lý', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'in_progress': { label: 'Đang thực hiện', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'delivered': { label: 'Đã bàn giao', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'accepted': { label: 'Đã nghiệm thu', color: 'bg-zinc-900 text-white border-zinc-900' },
    'rejected': { label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-200' },
    'draft': { label: 'Nháp', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
    'sent': { label: 'Đã gửi', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    'viewed': { label: 'Đã xem', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    'active': { label: 'Đang triển khai', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'completed': { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'signed': { label: 'Đã ký', color: 'bg-zinc-900 text-white border-zinc-900' },
    'paid': { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'todo': { label: 'Cần làm', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    'blocked': { label: 'Bị chặn', color: 'bg-red-50 text-red-600 border-red-200' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, color: 'bg-zinc-100 text-zinc-500 border-zinc-200' }
    return <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-none px-2.5 py-1 rounded-full", s.color)}>{s.label}</Badge>
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
    const router = useRouter()

    // Aggregate Calculations
    const totalInvestment = quotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
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

    // Fallback: if no work items yet, build from quotations (legacy mode)
    const displayItems = workItems.length > 0 ? workItems : quotations.map((q: any) => ({
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
                            <h1 className="text-xl font-bold text-zinc-900">Customer Portal</h1>
                            <p className="text-xs text-zinc-500 mt-0.5">Dự án & Tài liệu</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h2 className="text-2xl font-black text-zinc-950 tracking-tighter">{customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200 mt-2">
                            <span className={cn("w-1.5 h-1.5 rounded-full", hasContracts ? "bg-emerald-500" : "bg-amber-500")} />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{projectStatusLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
                {/* Update Info CTA — dot pattern + gradient like quotation */}
                <div className="relative rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden text-white"
                    style={{ backgroundImage: "linear-gradient(to right, #09090b, #171717, #404040)" }}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-lg font-bold">Cần cập nhật thông tin?</h3>
                        <p className="text-sm text-zinc-400 max-w-md">Vui lòng kiểm tra và cập nhật thông tin xuất hóa đơn hoặc yêu cầu thay đổi trực tiếp tại đây.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="relative z-10 bg-white text-zinc-900 hover:bg-zinc-100 font-black rounded-2xl px-10 h-12 shadow-2xl transition-all uppercase text-[10px] tracking-widest">
                                Cập nhật hồ sơ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl [&_[data-slot=dialog-close]_svg]:text-white">
                            <div className="bg-zinc-900 text-white p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Cập nhật hồ sơ khách hàng</DialogTitle>
                                    <p className="text-zinc-400 text-xs mt-1">Customer Information & Identity</p>
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
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Row — Clean, no uppercase, no letter-spacing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tổng đầu tư', value: formatCurrency(totalInvestment), sub: 'Project Investment', icon: Wallet, color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
                        { label: 'Đã thanh toán', value: formatCurrency(totalPaid), sub: 'Total Paid', icon: CreditCard, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                        { label: 'Còn lại', value: formatCurrency(balanceDue), sub: 'Balance Due', icon: Banknote, color: 'text-amber-600', bgColor: 'bg-amber-50' },
                        { label: 'Tiến độ', value: `${projectProgress}%`, sub: 'Project Progress', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                                <div className={cn("p-1.5 rounded-lg", stat.bgColor)}>
                                    <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-zinc-950 tracking-tight">{stat.value}</div>
                            <div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest opacity-60">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Mô tả dự án */}
                {project?.description && (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                        <h3 className="text-base font-bold text-zinc-900 mb-3">Mô tả dự án</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{project.description}</p>
                    </div>
                )}

                {/* Lịch trình triển khai & Thanh toán (Project Milestones) */}
                {timeline.filter(t => t.type === 'work' || t.type === 'payment').length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2.5 uppercase tracking-widest">
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                </div>
                                Lịch trình triển khai & Thanh toán
                            </h3>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-zinc-50/50 border-zinc-200 px-3 py-1 rounded-lg">Timeline</Badge>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {timeline
                                .filter(t => t.type === 'work' || t.type === 'payment')
                                .map((milestone: any, mIdx: number) => (
                                    <div key={mIdx} className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all group-hover:scale-105",
                                                    milestone.status === 'completed' ? "bg-zinc-950 text-white shadow-lg shadow-black/10" : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                                                )}>
                                                    #{mIdx + 1}
                                                </div>
                                                <StatusBadge status={milestone.status} />
                                            </div>
                                            {milestone.type === 'payment' && (
                                                <div className="p-2 bg-emerald-50 rounded-xl">
                                                    <Wallet className="w-4 h-4 text-emerald-600" />
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="text-[15px] font-black text-zinc-950 mb-1.5 tracking-tight leading-tight">{milestone.title}</h4>
                                        {milestone.description && (
                                            <p className="text-[11px] text-zinc-500 line-clamp-2 mb-5 h-8 font-medium leading-relaxed">{milestone.description}</p>
                                        )}
                                        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Hạn hoàn thành</span>
                                                <span className="text-[12px] font-black text-zinc-950">{formatDate(milestone.date)}</span>
                                            </div>
                                            {milestone.amount > 0 && (
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Giá trị mốc</span>
                                                    <p className="text-[13px] font-black text-zinc-950">{formatCurrency(milestone.amount)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Hạng mục dự án */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2.5 uppercase tracking-widest">
                            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-zinc-400" />
                            </div>
                            Hạng mục & Lộ trình thực hiện
                        </h3>
                        <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest opacity-60">
                            {displayItems.length} hạng mục · {completedItems} đã nghiệm thu
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {displayItems.map((item: any, idx: number) => (
                            <WorkItemCard key={item.id} item={item} idx={idx} token={token} />
                        ))}

                        {displayItems.length === 0 && (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center">
                                <Package className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500">Chưa có hạng mục nào được tạo cho dự án này.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bộ thủ tục chứng từ — aggregate from all work items */}
                <DocumentProceduresSection workItems={displayItems} handleViewDoc={handleViewDoc} />

                {/* Gantt View Section */}
                <ProjectGanttChart tasks={data.tasks || []} />

                {/* Activity History Section */}
                <ProjectActivityHistory projectId={project?.id} />

                {/* Tiện ích khác — Hidden for now as it's redundant with the new milestone cards */}
                {/* Document Viewer Dialog for Portal */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Xem tài liệu</DialogTitle>
                        </DialogHeader>
                        <div
                            className="p-8 prose prose-zinc max-w-none bg-white min-h-[400px]"
                            dangerouslySetInnerHTML={{ __html: selectedDocContent || '' }}
                        />
                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={() => setIsViewingDoc(false)}>Đóng</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

/* ===== Work Item Card ===== */
function WorkItemCard({ item, idx, token }: { item: any; idx: number; token: string }) {
    const quotation = item.quotation
    const contract = item.contract
    const deliveryLinks = item.delivery_links || []
    const itemTasks = item.tasks || []
    const completedTasks = itemTasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = itemTasks.length

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:border-zinc-300 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white text-sm font-bold">
                        {idx + 1}
                    </div>
                    <div>
                        <h4 className="text-[15px] font-black text-zinc-950 tracking-tight leading-tight">{item.title}</h4>
                        {item.description && <p className="text-[11px] font-medium text-zinc-500 mt-1 line-clamp-1">{item.description}</p>}
                    </div>
                </div>
                <StatusBadge status={item.status} />
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Left: Info */}
                <div className="lg:w-2/5 p-5 border-b lg:border-b-0 lg:border-r border-zinc-100 space-y-5">
                    {/* Documents linked */}
                    <div className="space-y-2">
                        {quotation && (
                            <a href={`/quote/${quotation.public_token || token}`} target="_blank"
                                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-zinc-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest">Báo giá</p>
                                        <p className="text-[11px] font-black text-zinc-400 mt-0.5">#{quotation.quotation_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={quotation.status} />
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                </div>
                            </a>
                        )}
                        {contract && (
                            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <FileSignature className="w-4 h-4 text-zinc-400" />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-950 uppercase tracking-widest">Hợp đồng</p>
                                        <p className="text-[11px] font-black text-zinc-400 mt-0.5">#{contract.contract_number}</p>
                                    </div>
                                </div>
                                <StatusBadge status={contract.status} />
                            </div>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="pt-4 border-t border-zinc-100">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Giá trị hạng mục</p>
                        <p className="text-2xl font-black text-zinc-950 tracking-tight">{formatCurrency(item.total_amount || quotation?.total_amount || 0)}</p>
                    </div>

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
                                        {link.date && <span className="text-[10px] text-zinc-400">{formatDate(link.date)}</span>}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Tasks (Todo List) */}
                <div className="lg:w-3/5 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <ListTodo className="w-3.5 h-3.5" />
                            Danh sách công việc
                        </p>
                        {totalTasks > 0 && (
                            <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
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
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    ) : task.status === 'in_progress' ? (
                                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    ) : task.status === 'blocked' ? (
                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
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
                                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{task.description}</p>
                                        )}
                                    </div>
                                    {task.priority === 'high' && (
                                        <span className="text-[9px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Cao</span>
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

/* ===== Document Procedures Section ===== */
function DocumentProceduresSection({ workItems, handleViewDoc }: { workItems: any[]; handleViewDoc: (id: string) => void }) {
    // Aggregate all required_documents from all work items
    const allDocs: { title: string; status: string; workItemTitle: string; date?: string; generated_doc_id?: string }[] = []

    // Default procedures for projects
    const defaultProcedures = [
        { title: 'Báo giá dịch vụ', status: 'completed' },
        { title: 'Hợp đồng & Phụ lục', status: 'completed' },
        { title: 'Biên bản tạm ứng / Hóa đơn', status: 'completed' },
        { title: 'Biên bản bàn giao sản phẩm', status: 'pending' },
        { title: 'Quyết toán & Thanh lý', status: 'pending' },
    ]

    workItems.forEach((item: any) => {
        const docs = item.required_documents || []
        docs.forEach((doc: any) => {
            allDocs.push({ ...doc, workItemTitle: item.title })
        })
    })

    const displayDocs = allDocs.length > 0 ? allDocs : defaultProcedures.map(p => ({
        ...p,
        workItemTitle: 'Dự án',
    }))

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2.5 uppercase tracking-widest">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-zinc-400" />
                        </div>
                        Bộ chứng từ & Hồ sơ dự án
                    </h3>
                    <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest opacity-60">Lộ trình hoàn thiện pháp lý</p>
                </div>
                <div className="hidden sm:block">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-zinc-50/50 border-zinc-200 px-3 py-1 rounded-lg">Full Docs</Badge>
                </div>
            </div>
            <div className="p-6">
                <div className="relative space-y-0">
                    {/* Vertical line */}
                    <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-zinc-100" />

                    {displayDocs.map((doc: any, i: number) => {
                        const isDone = doc.status === 'signed' || doc.status === 'completed' || doc.status === 'auto'
                        const isPending = doc.status === 'pending'

                        return (
                            <div key={i} className="relative pl-10 pb-8 last:pb-0 group">
                                {/* Dot */}
                                <div className={cn(
                                    "absolute left-0 top-1 w-[24px] h-[24px] rounded-full text-white flex items-center justify-center z-10 transition-all shadow-sm",
                                    isDone ? "bg-emerald-500" : isPending ? "bg-amber-400" : "bg-zinc-200"
                                )}>
                                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px] font-bold text-zinc-500 group-last:text-zinc-500">{i + 1}</span>}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <p className={cn(
                                            "text-sm font-bold transition-all",
                                            isDone ? "text-zinc-900" : "text-zinc-500"
                                        )}>{doc.title}</p>
                                        {doc.workItemTitle && doc.workItemTitle !== 'Dự án' && (
                                            <p className="text-[11px] text-zinc-400 mt-0.5">{doc.workItemTitle}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {doc.generated_doc_id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] border-zinc-200 hover:bg-zinc-50"
                                                onClick={() => handleViewDoc(doc.generated_doc_id)}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                Xem dự thảo
                                            </Button>
                                        )}
                                        {doc.date && <span className="text-[11px] text-zinc-400 font-medium">{formatDate(doc.date)}</span>}
                                        {isDone ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                Đã hoàn thành
                                            </div>
                                        ) : isPending ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-[10px] font-bold">
                                                Chờ xử lý
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 text-zinc-400 rounded-full border border-zinc-100 text-[10px] font-bold">
                                                Chưa có
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

/* ===== Timeline Section ===== */
function TimelineSection({ timeline }: { timeline: any[] }) {
    if (timeline.length === 0) return null

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
                <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2.5 uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    Tiến độ triển khai chi tiết
                </h3>
                <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest opacity-60">Cập nhật theo thời gian thực</p>
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
                                <span className="text-[11px] text-zinc-400 shrink-0 ml-4">{formatDate(event.date)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
