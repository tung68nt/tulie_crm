'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    CheckCircle,
    Clock,
    FileText,
    Download,
    Calendar,
    Building2,
    Wallet,
    FileSignature,
    Eye,
    AlertCircle,
    PenTool,
    CreditCard,
    TrendingUp,
    ExternalLink,
    Receipt,
    Phone,
    Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'

import { Progress } from '@/components/ui/progress'
import { CustomerInfoForm } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import DocumentDownloadButton from '@/components/documents/DocumentDownloadButton'

interface PortalContentProps {
    data: any
    token: string
}

const getStatusBadge = (status: string, isLate?: boolean) => {
    if (isLate) return <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest border-2">Trễ hạn / Late</Badge>

    const baseClass = "text-[10px] font-black uppercase tracking-widest border-2 px-2 py-0.5"

    switch (status) {
        case 'completed':
        case 'paid':
        case 'signed':
            return <Badge className={cn(baseClass, "bg-black text-white border-black")}>Hoàn thành / Done</Badge>
        case 'in_progress':
        case 'partial_paid':
            return <Badge className={cn(baseClass, "bg-white text-black border-black")}>Đang làm / Processing</Badge>
        case 'pending':
        case 'pending_signature':
            return <Badge variant="outline" className={cn(baseClass, "border-zinc-200 text-zinc-400 bg-transparent")}>Chờ / Pending</Badge>
        case 'upcoming':
            return <Badge variant="secondary" className={cn(baseClass, "bg-zinc-100 text-zinc-400 border-transparent")}>Sắp tới / Next</Badge>
        default:
            return <Badge variant="outline" className={cn(baseClass, "border-zinc-200 text-zinc-400")}>{status}</Badge>
    }
}

const getTimelineIcon = (type: string, status: string) => {
    const iconClass = status === 'completed' ? 'text-white' : status === 'pending' ? 'text-muted-foreground' : 'text-muted-foreground/50'
    switch (type) {
        case 'payment':
            return <CreditCard className={`h-4 w-4 ${iconClass}`} />
        case 'work':
            return <FileText className={`h-4 w-4 ${iconClass}`} />
        case 'delivery':
            return <FileText className={`h-4 w-4 ${iconClass}`} />
        case 'milestone':
            return <FileSignature className={`h-4 w-4 ${iconClass}`} />
        default:
            return <Clock className={`h-4 w-4 ${iconClass}`} />
    }
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const { quotation, quotations, contracts, invoices, timeline, customer, project, projectMetadata, tasks, brandConfig } = data
    const [isSigning, setIsSigning] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    // Tasks summary for portal
    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((t: any) => t.status === 'completed' || t.status === 'done').length || 0


    // Primary project identity
    const dealTitle = quotation.deal?.title
    const projectTitle = dealTitle || project?.title || (contracts?.length > 0 ? contracts[0].title : (quotations?.length > 0 ? quotations[0].title : quotation.title))

    // Sales person from quotation creator
    const salesPerson = quotation.creator || null

    // Group documents by Quotation (Package)
    const allQuotations = quotations && quotations.length > 0 ? quotations : [quotation]
    const documentGroups = allQuotations.map((q: any) => {
        const linkedContracts = contracts?.filter((c: any) => c.quotation_id === q.id) || []
        const linkedInvoices = invoices?.filter((inv: any) =>
            inv.quotation_id === q.id || linkedContracts.some((c: any) => c.id === inv.contract_id)
        ) || []

        return {
            quotation: { ...q, brandConfig },
            contracts: linkedContracts,
            invoices: linkedInvoices,
            timeline: (timeline as any[]).filter((t: any) => t.quotation_id === q.id),
            title: q.title || `hạng mục: ${q.quotation_number}`
        }
    })

    const extraProjectTimeline = (timeline as any[]).filter((t: any) => !t.quotation_id)

    const totalDocuments = (quotations?.length || 1) + (contracts?.length || 0) + (invoices?.length || 0)

    // Total value: contracts > sum of all quotations > single quotation
    const totalPaid = invoices?.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total_amount, 0) || 0
    const totalValueFromContracts = contracts?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0
    const totalValueFromQuotations = allQuotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const totalValue = totalValueFromContracts > 0 ? totalValueFromContracts : totalValueFromQuotations
    const paymentProgress = totalValue > 0 ? Math.min((totalPaid / totalValue) * 100, 100) : 0
    const remainingAmount = totalValue - totalPaid


    // Timeline stats
    const completedSteps = timeline.filter((i: any) => i.status === 'completed').length
    const totalSteps = timeline.length || 1
    const projectProgress = Math.round((completedSteps / totalSteps) * 100)

    // Next appointment logic
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcomingItems = timeline
        .filter((item: any) => item.status !== 'completed' && new Date(item.date) >= today)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const nextMilestone = upcomingItems[0]
    const daysUntilNext = nextMilestone
        ? Math.ceil((new Date(nextMilestone.date).getTime() - today.getTime()) / (1000 * 3600 * 24))
        : null

    const capitalize = (str: string) => {
        if (!str) return '';
        // Special case for branding
        let result = str.replace(/sfsv/gi, 'SFSV');
        // Simple title case for the rest
        return result.split(' ').map(word => {
            if (word.length === 0) return '';
            if (/^[0-9]+$/.test(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white" style={{ '--font-kaine': "'Kaine', 'Inter', sans-serif" } as any}>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-white/95 backdrop-blur">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/file/tulie-agency-logo.png" alt="Tulie" className="h-10 w-auto object-contain" />
                        <div className="h-8 w-[2px] bg-zinc-200 hidden sm:block" />
                        <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Customer Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Chào mừng / Welcome</span>
                            <span className="text-sm font-black uppercase tracking-tight">{customer?.company_name || customer?.name}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center border-2 border-black shadow-lg">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Hero */}
                <div className="mb-16 space-y-4">
                    <div className="flex items-baseline gap-4 flex-wrap">
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: 'var(--font-kaine)' }}>
                            {capitalize(projectTitle)}
                        </h1>
                    </div>
                    <div className="h-1 w-24 bg-black" />
                    <p className="text-lg md:text-xl text-zinc-400 font-bold uppercase tracking-tight max-w-2xl leading-tight">
                        Theo dõi tiến độ và tài liệu trực tuyến / Project Hub & Real-time Progress Tracking.
                    </p>
                </div>

                {/* Info Update Notice - Modern Banner */}
                {customer?.is_info_unlocked && (
                    <div className="mb-12 bg-zinc-950 text-white rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/10 transition-colors" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <PenTool className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-kaine)' }}>Cập nhật hồ sơ / Identity Update</h3>
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-lg leading-relaxed">
                                    Vui lòng bổ sung thông tin chính xác để chúng tôi hoàn thiện các văn bản pháp lý. / Please complete your company profile.
                                </p>
                            </div>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="relative z-10 bg-white text-black hover:bg-zinc-200 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95">
                                    Bắt đầu / Start Update
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] rounded-[40px] border-black border-2 p-0 overflow-hidden">
                                <div className="bg-black text-white p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white" style={{ fontFamily: 'var(--font-kaine)' }}>Cập nhật thông tin công ty</DialogTitle>
                                        <DialogDescription className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                            Legal Information & Invoice Details
                                        </DialogDescription>
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
                )}

                {/* Stats Row */}
                <div className="grid gap-6 md:grid-cols-3 mb-16">
                    {/* Total Project Value */}
                    <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-white">Tổng đầu tư / Investment</span>
                                <Receipt className="h-5 w-5 opacity-40 text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-kaine)' }}>{formatCurrency(totalValue).replace('₫', '')}</p>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Việt Nam Đồng (VNĐ)</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>Thanh toán / Paid {paymentProgress.toFixed(0)}%</span>
                                    <span>Còn lại / Due: {formatCurrency(remainingAmount).replace('₫', '')}</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${paymentProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Progress */}
                    <div className="bg-white border-2 border-black p-8 rounded-[40px] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Tiến độ / Actual Progress</span>
                                <TrendingUp className="h-5 w-5 text-black" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-kaine)' }}>{projectProgress}%</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <Calendar className="h-3 w-3" />
                                    <span>Giai đoạn: {project?.status || 'Đang triển khai'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-black transition-all duration-1000" style={{ width: `${projectProgress}%` }} />
                                </div>
                                <p className="text-[10px] font-black text-black uppercase tracking-widest">
                                    {completedTasks}/{totalTasks} công việc hoàn tất
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Next Milestone */}
                    <div className="bg-zinc-50 border-2 border-zinc-100 p-8 rounded-[40px] relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Hành động / Next Move</span>
                                <Clock className="h-5 w-5 text-zinc-300" />
                            </div>
                            {nextMilestone ? (
                                <div className="space-y-1">
                                    <p className="text-3xl font-black tracking-tight text-black" style={{ fontFamily: 'var(--font-kaine)' }}>
                                        {daysUntilNext === 0 ? 'HOM NAY' : `CON ${daysUntilNext} NGAY`}
                                    </p>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter leading-tight max-w-[150px]">
                                        {nextMilestone.title}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-3xl font-black text-zinc-200 uppercase tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>Hoàn tất</p>
                            )}
                            <div className="pt-4 border-t border-zinc-200/50 space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    <span>MANAGER</span>
                                    <span className="text-black">{projectMetadata?.manager_name || 'TULIE SYSTEM'}</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    <span>PRIORITY</span>
                                    <span className="text-black">HIGH STANDARDS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Brief & Strategy Summary */}
                {quotation.proposal_content && (
                    <div className="mb-24 space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-black" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>Tóm lược dự án / Project Brief</h2>
                            </div>
                            <p className="text-zinc-400 font-bold uppercase tracking-tight text-sm">Review mục tiêu chiến lược và kết quả kỳ vọng / Review strategy & key outcomes.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Goals */}
                            <div className="bg-zinc-50 rounded-[40px] p-10 border-2 border-zinc-100 group hover:border-black transition-all">
                                <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Mục tiêu chiến lược / Strategic Goals</span>
                                <div className="text-sm font-black text-black uppercase tracking-tight leading-relaxed space-y-4">
                                    {(typeof quotation.proposal_content === 'string' ? JSON.parse(quotation.proposal_content) : quotation.proposal_content).goals ? (
                                        (typeof quotation.proposal_content === 'string' ? JSON.parse(quotation.proposal_content) : quotation.proposal_content).goals
                                    ) : (
                                        'Đang cập nhật mục tiêu cụ thể cho giai đoạn này.'
                                    )}
                                </div>
                            </div>
                            {/* Key Deliverables */}
                            <div className="bg-zinc-50 rounded-[40px] p-10 border-2 border-zinc-100 group hover:border-black transition-all">
                                <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Sản phẩm bàn giao / Deliverables</span>
                                <div className="text-sm font-black text-zinc-400 uppercase tracking-tight leading-relaxed space-y-4">
                                    {(typeof quotation.proposal_content === 'string' ? JSON.parse(quotation.proposal_content) : quotation.proposal_content).deliverables ? (
                                        (typeof quotation.proposal_content === 'string' ? JSON.parse(quotation.proposal_content) : quotation.proposal_content).deliverables
                                    ) : (
                                        'Vui lòng tham khảo báo giá chi tiết để xem danh sách sản phẩm.'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-16">
                    {/* Timeline */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>Các mốc quan trọng / Milestones</h2>
                            <p className="text-zinc-400 font-bold uppercase tracking-tight text-sm">
                                Lộ trình thực hiện và bàn giao dịch vụ chi tiết / Detailed execution roadmap.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {documentGroups.map((group: any, groupIdx: number) => {
                                const groupCompleted = group.timeline.filter((t: any) => t.status === 'completed').length
                                const groupTotal = group.timeline.length || 1
                                const groupProgress = Math.round((groupCompleted / groupTotal) * 100)

                                return (
                                    <div key={group.quotation.id} className="relative bg-white rounded-[40px] p-8 md:p-12 border-2 border-zinc-100 transition-all hover:border-black group/group">
                                        {/* Group Header */}
                                        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-2 border-zinc-50">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[24px] bg-black text-white flex items-center justify-center font-black text-2xl shadow-xl group-hover/group:scale-110 transition-transform" style={{ fontFamily: 'var(--font-kaine)' }}>
                                                    {groupIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                                                        {group.title}
                                                    </h3>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">Hạng mục triển khai / Project Module</p>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-80 space-y-3">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>Tiến độ / Progress</span>
                                                    <span className="text-black">{groupProgress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-black transition-all duration-1000" style={{ width: `${groupProgress}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-0 relative">
                                            {/* Vertical line - Clean & Modern */}
                                            <div className="absolute left-[31px] md:left-[31px] top-6 bottom-6 w-[2px] bg-zinc-100 group-hover/group:bg-zinc-200 transition-colors" />

                                            {/* Item Summary for this Phase */}
                                            {group.quotation.items && group.quotation.items.length > 0 && (
                                                <div className="ml-[80px] mb-12 bg-zinc-50/50 rounded-[32px] p-8 border-2 border-dashed border-zinc-100 group-hover/group:border-zinc-200 transition-all">
                                                    <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-6">Sản phẩm chi tiết / Itemized Services</span>
                                                    <div className="divide-y-2 divide-zinc-100">
                                                        {group.quotation.items.map((item: any) => (
                                                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-4 w-4 rounded-full border-2 border-zinc-200 flex items-center justify-center">
                                                                        <div className="h-1.5 w-1.5 bg-black rounded-full" />
                                                                    </div>
                                                                    <span className="text-[11px] font-black uppercase text-black tracking-tight">{item.name}</span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">x{item.quantity} {item.unit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {group.timeline.length > 0 ? (
                                                group.timeline.map((item: any) => {
                                                    const isCompleted = item.status === 'completed'
                                                    const isUpcoming = item.status === 'upcoming'
                                                    const isCurrent = !isCompleted && !isUpcoming

                                                    return (
                                                        <div key={item.id} className="flex gap-10 pb-16 last:pb-0 relative group/item">
                                                            <div className="relative z-10">
                                                                <div className={cn(
                                                                    "h-16 w-16 flex items-center justify-center rounded-[20px] border-2 transition-all shadow-sm",
                                                                    isCompleted ? "bg-black border-black text-white" :
                                                                        isCurrent ? "bg-white border-black text-black scale-110 shadow-xl" :
                                                                            "bg-white border-zinc-100 text-zinc-200"
                                                                )}>
                                                                    {getTimelineIcon(item.type, item.status)}
                                                                </div>
                                                                {isCurrent && (
                                                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-black rounded-full border-2 border-white animate-pulse" />
                                                                )}
                                                            </div>

                                                            <div className="flex-1 -mt-1">
                                                                <div className={cn(
                                                                    "p-8 rounded-[32px] transition-all border-2",
                                                                    isCurrent ? "bg-zinc-50 border-black shadow-lg" : "bg-white border-transparent hover:bg-zinc-50/50"
                                                                )}>
                                                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                                                        <div className="space-y-4 flex-1">
                                                                            <div className="flex flex-wrap items-center gap-4">
                                                                                <h4 className={cn(
                                                                                    "font-black text-xl uppercase tracking-tight",
                                                                                    isUpcoming ? "text-zinc-300" : "text-black"
                                                                                )}>
                                                                                    {item.title?.toUpperCase()}
                                                                                </h4>
                                                                                {getStatusBadge(item.status, item.is_late)}
                                                                            </div>
                                                                            <p className="text-zinc-500 font-bold text-sm md:text-base leading-snug max-w-2xl">
                                                                                {capitalize(item.description)}
                                                                            </p>

                                                                            {/* Assets Links */}
                                                                            {(item.type === 'delivery' || item.type === 'work') && (
                                                                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                                    <a href={projectMetadata?.ai_folder_link || '#'} target="_blank" className="p-6 rounded-[24px] bg-white border-2 border-zinc-100 flex items-center justify-between group/link hover:border-black transition-all">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover/link:bg-black transition-colors">
                                                                                                <TrendingUp className="h-5 w-5 text-black group-hover/link:text-white" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="block text-[10px] font-black text-black uppercase tracking-widest">Demo / Draft</span>
                                                                                                <span className="text-[11px] text-zinc-400 font-bold uppercase">Xem bản thảo</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <ExternalLink className="h-4 w-4 text-zinc-300 group-hover/link:text-black" />
                                                                                    </a>
                                                                                    <a href={projectMetadata?.source_link || '#'} target="_blank" className="p-6 rounded-[24px] bg-white border-2 border-zinc-100 flex items-center justify-between group/link hover:border-black transition-all">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover/link:bg-black transition-colors">
                                                                                                <Download className="h-5 w-5 text-black group-hover/link:text-white" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="block text-[10px] font-black text-black uppercase tracking-widest">Final Files</span>
                                                                                                <span className="text-[11px] text-zinc-400 font-bold uppercase">Tải tài nguyên</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <Download className="h-4 w-4 text-zinc-300 group-hover/link:text-black" />
                                                                                    </a>
                                                                                </div>
                                                                            )}

                                                                            {item.amount && (
                                                                                <div className="flex items-center gap-3 mt-6 pt-6 border-t-2 border-zinc-50">
                                                                                    <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                                                                        <Wallet className="h-4 w-4 text-black" />
                                                                                    </div>
                                                                                    <span className="text-sm font-black text-black uppercase tracking-widest">
                                                                                        Giá trị / Value: {formatCurrency(item.amount)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="shrink-0">
                                                                            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-100 rounded-[16px] text-black font-black text-[10px] uppercase tracking-widest border-2 border-zinc-200">
                                                                                <Calendar className="h-4 w-4" />
                                                                                <span>{formatDate(item.date)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="text-center py-20 text-zinc-300 font-black uppercase tracking-widest text-sm">
                                                    Đang cập nhật lộ trình / Roadmap Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Documents List - High Fidelity */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>Hồ sơ & Tài liệu / Documentation</h2>
                            <p className="text-zinc-400 font-bold uppercase tracking-tight text-sm">
                                Quản lý hợp đồng, báo giá và biên bản nghiệm thu / Legal & Project records.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {documentGroups.map((group: any, groupIdx: number) => {
                                const hasContracts = group.contracts.length > 0;
                                const isCompleted = timeline.some((t: any) => t.type === 'delivery' && t.status === 'completed' && (t.id.includes(group.quotation.id) || group.contracts.some((c: any) => t.id.includes(c.id))));

                                return (
                                    <div key={group.quotation.id} className="bg-zinc-50 rounded-[48px] p-10 md:p-16 border-2 border-zinc-100 relative overflow-hidden group/doc">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 pb-8 border-b-2 border-zinc-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[24px] bg-black flex items-center justify-center font-black text-2xl text-white shadow-xl" style={{ fontFamily: 'var(--font-kaine)' }}>
                                                    {groupIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-black uppercase tracking-tighter">
                                                        {group.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge className={cn(
                                                            "px-4 py-1 rounded-full font-black uppercase text-[9px] tracking-[0.2em] border-2",
                                                            isCompleted ? "bg-black text-white border-black" :
                                                                hasContracts ? "bg-white text-black border-black" :
                                                                    "bg-transparent text-zinc-400 border-zinc-200"
                                                        )}>
                                                            {isCompleted ? 'Hoàn thành / Completed' : hasContracts ? 'Thực hiện / Active' : 'Báo giá / Proposal'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-12 lg:grid-cols-4">
                                            {/* Phase 1: Quote */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Bước 1 / Step 1</span>
                                                        <h4 className="text-[12px] font-black text-black uppercase tracking-tight">Báo giá / Quote</h4>
                                                    </div>
                                                </div>
                                                <a href={`/quote/${group.quotation.public_token || token}`} target="_blank" className="block p-6 md:p-8 rounded-[32px] border-2 border-zinc-200 bg-white hover:border-black transition-all group/card shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-black text-black">#{group.quotation.quotation_number}</span>
                                                        <ExternalLink className="h-4 w-4 text-zinc-200 group-hover/card:text-black" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {getStatusBadge(group.quotation.status === 'accepted' ? 'signed' : 'pending_signature')}
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{formatDate(group.quotation.created_at)}</span>
                                                    </div>
                                                </a>
                                            </div>

                                            {/* Phase 2: Contract */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors", hasContracts ? "bg-black text-white" : "bg-zinc-100 text-zinc-400")}>
                                                        <FileSignature className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Bước 2 / Step 2</span>
                                                        <h4 className="text-[12px] font-black text-black uppercase tracking-tight">Hợp đồng / Contract</h4>
                                                    </div>
                                                </div>
                                                {hasContracts ? (
                                                    <div className="space-y-4">
                                                        {group.contracts.map((c: any) => (
                                                            <div key={c.id} className="p-6 md:p-8 rounded-[32px] border-2 border-zinc-200 bg-white hover:border-black transition-all group/card shadow-sm relative">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className="text-xs font-black text-black">#{c.contract_number}</span>
                                                                    <DocumentDownloadButton
                                                                        type="contract"
                                                                        documentId={c.id}
                                                                        customerId={customer.id}
                                                                        label=""
                                                                        variant="ghost"
                                                                        className="h-10 w-10 p-0 text-zinc-300 hover:text-black hover:bg-zinc-50 rounded-2xl border-2 border-transparent hover:border-zinc-100"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    {getStatusBadge(c.status === 'active' || c.status === 'completed' ? 'signed' : 'pending_signature')}
                                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{formatDate(c.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-32 flex items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-[32px] bg-zinc-100/50">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Đang khởi tạo / Pending</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phase 3: Invoices / Payments */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors", group.invoices.length > 0 ? "bg-black text-white" : "bg-zinc-100 text-zinc-400")}>
                                                        <Receipt className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Bước 3 / Step 3</span>
                                                        <h4 className="text-[12px] font-black text-black uppercase tracking-tight">Thanh toán / Invoices</h4>
                                                    </div>
                                                </div>
                                                {group.invoices.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {group.invoices.map((inv: any) => (
                                                            <div key={inv.id} className="p-6 md:p-8 rounded-[32px] border-2 border-zinc-200 bg-white hover:border-black transition-all group/card shadow-sm relative">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <span className="text-xs font-black text-black">#{inv.invoice_number}</span>
                                                                    <DocumentDownloadButton
                                                                        type="invoice"
                                                                        documentId={inv.id}
                                                                        customerId={customer.id}
                                                                        label=""
                                                                        variant="ghost"
                                                                        className="h-10 w-10 p-0 text-zinc-300 hover:text-black hover:bg-zinc-50 rounded-2xl border-2 border-transparent hover:border-zinc-100"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    {getStatusBadge(inv.status === 'paid' ? 'paid' : 'pending')}
                                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{formatDate(inv.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-32 flex items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-[32px] bg-zinc-100/50">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Chưa có yêu cầu / None</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phase 4: Handover */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors", isCompleted ? "bg-black text-white" : "bg-zinc-100 text-zinc-400")}>
                                                        <CheckCircle className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Bước 4 / Step 4</span>
                                                        <h4 className="text-[12px] font-black text-black uppercase tracking-tight">Bàn giao / Handover</h4>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "h-32 flex items-center justify-center p-8 border-2 rounded-[32px] transition-all",
                                                    isCompleted ? "border-black bg-white shadow-xl" : "border-dashed border-zinc-200 bg-zinc-100/50"
                                                )}>
                                                    <p className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest text-center",
                                                        isCompleted ? "text-black" : "text-zinc-400"
                                                    )}>
                                                        {isCompleted ? 'Đã hoàn tất / Handed Over' : 'Chờ hoàn thiện / Waiting'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Task List Grid */}
                    {tasks.length > 0 && (
                        <div className="bg-zinc-950 text-white rounded-[56px] p-12 md:p-20 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                            <div className="relative z-10 space-y-12">
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>Công việc chi tiết / Tasks</h2>
                                    <p className="text-zinc-500 font-bold uppercase tracking-tight text-sm">Review hạng mục triển khai nhỏ / Project breakdown.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {tasks.map((task: any) => (
                                        <div key={task.id} className="group p-8 rounded-[32px] bg-white/5 border-2 border-white/5 hover:border-white/20 transition-all">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={cn(
                                                    "h-4 w-4 rounded-full border-2",
                                                    task.status === 'completed' ? "bg-white border-white" : "border-white/20"
                                                )} />
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{formatDate(task.end_date)}</span>
                                            </div>
                                            <p className={cn(
                                                "text-sm font-bold uppercase tracking-tight leading-tight mb-4",
                                                task.status === 'completed' ? "text-zinc-600 line-through" : "text-white"
                                            )}>
                                                {task.title?.toUpperCase()}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {task.priority === 'high' ? (
                                                    <Badge className="bg-red-500 text-white border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">High Priority</Badge>
                                                ) : (
                                                    <Badge className="bg-white/10 text-zinc-400 border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest">Normal</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white text-black py-24 border-t-2 border-zinc-100">
                <div className="container mx-auto px-6">
                    <div className="grid gap-16 md:grid-cols-3 border-b-2 border-zinc-100 pb-16 mb-16">
                        <div className="space-y-8">
                            <img src="/file/tulie-agency-logo.png" alt="Tulie" className="h-10 w-auto" />
                            <p className="text-zinc-400 font-bold uppercase tracking-tight text-xs leading-loose max-w-xs">
                                Đơn vị cung cấp giải pháp Marketing tổng thể và vận hành hệ thống Tulie Ecosystem. Professional Marketing & Operations.
                            </p>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Hỗ trợ / Support</h4>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Direct Line</span>
                                    <a href="tel:0988984554" className="text-xl font-black hover:tracking-widest transition-all">098.898.4554</a>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Email</span>
                                    <a href={`mailto:${salesPerson?.email || 'hello@thiepnhanh.vn'}`} className="text-sm font-black uppercase tracking-tight border-b-2 border-black pb-1">
                                        {salesPerson?.email || 'hello@thiepnhanh.vn'}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Văn phòng / Studio</h4>
                            <p className="text-sm font-black uppercase tracking-tight leading-loose">
                                Tầng 4, Tòa nhà SHG, Số 8 Quang Trung,<br />
                                Phường Hà Đông, TP. Hà Nội
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                        <p>&copy; {new Date().getFullYear()} {brandConfig?.company_name || brandConfig?.brand_name || 'TULIE AGENCY'}. ALL RIGHTS RESERVED.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-black transition-colors">Privacy</a>
                            <a href="#" className="hover:text-black transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
