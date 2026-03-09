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
    Check
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CustomerInfoForm } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
    return <Badge className={cn("text-[10px] font-semibold border px-2.5 py-0.5 rounded-full", s.color)}>{s.label}</Badge>
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const {
        quotations = [], contracts = [], invoices = [],
        timeline = [], customer, project, brandConfig,
        workItems = [], tasks = []
    } = data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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
                        <h2 className="text-xl font-bold text-zinc-900">{customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200 mt-2">
                            <span className={cn("w-1.5 h-1.5 rounded-full", hasContracts ? "bg-emerald-500" : "bg-amber-500")} />
                            <span className="text-[11px] font-medium text-zinc-600">{projectStatusLabel}</span>
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
                            <Button className="relative z-10 bg-white text-zinc-900 hover:bg-zinc-200 font-semibold rounded-xl px-8 h-12 shadow-xl shadow-white/5">
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
                        <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[13px] font-medium text-zinc-500">{stat.label}</span>
                                <div className={cn("p-1.5 rounded-lg", stat.bgColor)}>
                                    <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                                </div>
                            </div>
                            <div className="text-xl font-bold text-zinc-900">{stat.value}</div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">{stat.sub}</div>
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

                {/* Hạng mục dự án */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">Hạng mục & Lộ trình thực hiện</h3>
                        <p className="text-sm text-zinc-500 mt-1">
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
                <DocumentProceduresSection workItems={displayItems} />

                {/* Timeline tổng hợp */}
                <TimelineSection timeline={timeline} />
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
                        <h4 className="text-[15px] font-bold text-zinc-900">{item.title}</h4>
                        {item.description && <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>}
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
                                        <p className="text-[13px] font-semibold text-zinc-900">Báo giá</p>
                                        <p className="text-[11px] text-zinc-500">#{quotation.quotation_number}</p>
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
                                        <p className="text-[13px] font-semibold text-zinc-900">Hợp đồng</p>
                                        <p className="text-[11px] text-zinc-500">#{contract.contract_number}</p>
                                    </div>
                                </div>
                                <StatusBadge status={contract.status} />
                            </div>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="pt-3 border-t border-zinc-100">
                        <p className="text-xs text-zinc-500 mb-1">Giá trị hạng mục</p>
                        <p className="text-xl font-bold text-zinc-900">{formatCurrency(item.total_amount || quotation?.total_amount || 0)}</p>
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
                        <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5 text-zinc-400" />
                            Danh sách công việc
                        </p>
                        {totalTasks > 0 && (
                            <span className="text-[11px] text-zinc-500">
                                {completedTasks}/{totalTasks} hoàn thành
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
function DocumentProceduresSection({ workItems }: { workItems: any[] }) {
    // Aggregate all required_documents from all work items
    const allDocs: { title: string; status: string; workItemTitle: string; date?: string }[] = []

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
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-zinc-400" />
                        Bộ chứng từ dự án
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Lộ trình hoàn thiện hồ sơ pháp lý và thủ tục</p>
                </div>
                <div className="hidden sm:block">
                    <Badge variant="outline" className="text-[10px] bg-zinc-50/50">Full Documents</Badge>
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
                                        {doc.date && <span className="text-[11px] text-zinc-400 font-medium">{formatDate(doc.date)}</span>}
                                        {doc.status === 'signed' || doc.status === 'completed' ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                Đã hoàn thành
                                            </div>
                                        ) : doc.status === 'pending' ? (
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
            <div className="p-5 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    Tiến độ triển khai
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Các mốc thực hiện theo thời gian</p>
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
