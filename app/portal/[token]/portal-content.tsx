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
    if (isLate) return <Badge variant="destructive" className="text-[10px] font-medium">Trễ hạn</Badge>

    switch (status) {
        case 'completed':
        case 'paid':
        case 'signed':
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">Hoàn thành</Badge>
        case 'in_progress':
        case 'partial_paid':
            return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">Đang thực hiện</Badge>
        case 'pending':
        case 'pending_signature':
            return <Badge variant="outline" className="text-[10px] font-medium">Chờ xử lý</Badge>
        case 'upcoming':
            return <Badge variant="secondary" className="text-[10px] font-medium">Sắp tới</Badge>
        default:
            return <Badge variant="outline" className="text-[10px] font-medium">{status}</Badge>
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
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[11px] text-muted-foreground">Khách hàng</span>
                            <span className="text-sm font-semibold">{customer?.company_name || customer?.name}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-slate-900" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Hero */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{capitalize(projectTitle)}</h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
                        Thông báo tiến độ dự án, tài liệu liên quan và các yêu cầu thanh toán dành cho Quý khách.
                    </p>
                </div>

                {/* Info Update Notice */}
                {customer?.is_info_unlocked && (
                    <Card className="mb-8 border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <PenTool className="h-4 w-4" />
                                Cập nhật thông tin khách hàng
                            </CardTitle>
                            <CardDescription>
                                Vui lòng kiểm tra và bổ sung thông tin công ty để hoàn thiện các văn bản, hợp đồng.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>Bắt đầu cập nhật</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px]">
                                    <DialogHeader>
                                        <DialogTitle>Cập nhật thông tin công ty</DialogTitle>
                                        <DialogDescription>
                                            Vui lòng điền chính xác các thông tin dưới đây để chúng tôi cập nhật vào hợp đồng.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CustomerInfoForm
                                        customer={customer}
                                        token={token}
                                        onComplete={() => {
                                            setIsDialogOpen(false)
                                            router.refresh()
                                            toast.success('Đã cập nhật thông tin thành công!')
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Row */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {/* Total Project Value */}
                    <Card className="shadow-sm border-slate-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500">Tổng giá trị dự án</span>
                                <Receipt className="h-4 w-4 text-slate-900" />
                            </div>
                            <p className="text-2xl font-bold mb-1 tracking-tight">{formatCurrency(totalValue)}</p>
                            <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                                <span>Đã thanh toán {paymentProgress.toFixed(0)}%</span>
                                <span>Còn lại {formatCurrency(remainingAmount)}</span>
                            </div>
                            <Progress value={paymentProgress} className="h-1.5 bg-slate-100" />
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                <span className="text-[10px] text-slate-400 font-medium lowercase-off">{totalDocuments} tài liệu</span>
                                <span className="text-[11px] font-semibold text-slate-900">đã trả: {formatCurrency(totalPaid)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Progress */}
                    <Card className="shadow-sm border-slate-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500">Tiến độ dự án</span>
                                <TrendingUp className="h-4 w-4 text-slate-900" />
                            </div>
                            <p className="text-2xl font-bold mb-1">{projectProgress}%</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                                <Calendar className="h-3 w-3" />
                                <span>Hoàn thành dự kiến: {project?.end_date ? formatDate(project.end_date) : 'Đang cập nhật'}</span>
                            </div>
                            <Progress value={projectProgress} className="h-1.5 bg-slate-100" />
                            <div className="mt-3 bg-slate-50 rounded-lg p-2 flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-slate-900" />
                                <span className="text-[11px] text-slate-600 font-medium">{completedTasks}/{totalTasks} công việc đã hoàn tất</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline & PM */}
                    <Card className="shadow-sm border-slate-100 bg-slate-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500">Hành động tiếp theo</span>
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            {nextMilestone ? (
                                <>
                                    <p className="text-2xl font-bold mb-1">
                                        {daysUntilNext === 0 ? 'Hôm nay' : `Còn ${daysUntilNext} ngày`}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <Calendar className="h-3 w-3" />
                                        <span className="font-medium">Hẹn tiếp theo: {nextMilestone.title} ({formatDate(nextMilestone.date)})</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-2xl font-bold mb-1 text-slate-400">Đã hoàn tất</p>
                            )}
                            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 uppercase tracking-wider font-bold opacity-50">phụ trách</span>
                                    <span className="font-semibold text-slate-900">{projectMetadata?.manager_name || 'Hệ thống quản trị'}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 uppercase tracking-wider font-bold opacity-50">trạng thái</span>
                                    <span className="px-1.5 py-0.5 bg-primary/10 rounded text-[9px] font-bold text-primary uppercase">{project?.status || 'Active'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Timeline */}
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="pb-6 px-0">
                            <CardTitle className="text-2xl font-bold">Các mốc quan trọng</CardTitle>
                            <CardDescription className="text-base text-slate-500">
                                Lộ trình thực hiện và bàn giao dịch vụ chi tiết theo từng hạng mục
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="space-y-12">
                                {documentGroups.map((group: any, groupIdx: number) => {
                                    const groupCompleted = group.timeline.filter((t: any) => t.status === 'completed').length
                                    const groupTotal = group.timeline.length || 1
                                    const groupProgress = Math.round((groupCompleted / groupTotal) * 100)

                                    return (
                                        <div key={group.quotation.id} className="relative bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm">
                                            {/* Group Header */}
                                            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                                        {groupIdx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900">
                                                            {group.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground mt-1">Hạng mục triển khai chính</p>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-64 space-y-2">
                                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        <span>Tiến độ hạng mục</span>
                                                        <span className="text-slate-900">{groupProgress}%</span>
                                                    </div>
                                                    <Progress value={groupProgress} className="h-2" />
                                                </div>
                                            </div>

                                            <div className="space-y-0">
                                                {/* Vertical line for this group - Bolder and more professional */}
                                                <div className="absolute left-[39px] md:left-[55px] top-[140px] bottom-10 w-0.5 bg-slate-200" />

                                                {group.timeline.length > 0 ? (
                                                    group.timeline.map((item: any) => {
                                                        const isCompleted = item.status === 'completed'
                                                        const isUpcoming = item.status === 'upcoming'
                                                        const isCurrent = !isCompleted && !isUpcoming

                                                        return (
                                                            <div key={item.id} className="flex gap-6 pb-12 relative group/item">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`z-10 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${isCompleted ? 'bg-black border-black text-white' :
                                                                        isCurrent ? 'bg-primary border-primary text-white scale-110 shadow-lg' :
                                                                            'bg-white border-slate-100 text-slate-300'
                                                                        }`}>
                                                                        {getTimelineIcon(item.type, item.status)}
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1 -mt-1">
                                                                    <div className={cn(
                                                                        "p-6 rounded-2xl transition-all border",
                                                                        isCurrent ? "bg-slate-50 border-primary/20 shadow-md ring-1 ring-primary/5" : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50"
                                                                    )}>
                                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                                            <div className="space-y-2 flex-1">
                                                                                <div className="flex flex-wrap items-center gap-3">
                                                                                    <h4 className={cn(
                                                                                        "font-bold text-lg",
                                                                                        isUpcoming ? "text-slate-400" : "text-slate-900"
                                                                                    )}>
                                                                                        {capitalize(item.title)}
                                                                                    </h4>
                                                                                    {getStatusBadge(item.status, item.is_late)}
                                                                                </div>
                                                                                <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl">
                                                                                    {capitalize(item.description)}
                                                                                </p>

                                                                                {/* Product statistics / Demo Assets */}
                                                                                {(item.type === 'delivery' || item.type === 'work') && (
                                                                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                        <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-center justify-between group/asset hover:shadow-md transition-all">
                                                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                                                                                    <TrendingUp className="h-5 w-5 text-primary" />
                                                                                                </div>
                                                                                                <div className="flex flex-col overflow-hidden">
                                                                                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Demo sản phẩm</span>
                                                                                                    <span className="text-[11px] text-slate-400 truncate">Xem trực tiếp bản thảo dự án</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" asChild>
                                                                                                <a href={projectMetadata?.ai_folder_link || '#'} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                                                                                            </Button>
                                                                                        </div>
                                                                                        <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-center justify-between group/asset hover:shadow-md transition-all">
                                                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                                                                                    <Download className="h-5 w-5 text-primary" />
                                                                                                </div>
                                                                                                <div className="flex flex-col overflow-hidden">
                                                                                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Tài nguyên bàn giao</span>
                                                                                                    <span className="text-[11px] text-slate-400 truncate">File thiết kế & Nội dung hoàn thiện</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" asChild>
                                                                                                <a href={projectMetadata?.source_link || '#'} target="_blank"><Download className="h-4 w-4" /></a>
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {item.amount && (
                                                                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                                                                        <Wallet className="h-4 w-4 text-primary" />
                                                                                        <span className="text-sm font-bold text-slate-700">
                                                                                            Giá trị: {formatCurrency(item.amount)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="shrink-0">
                                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-900 font-bold text-xs ring-1 ring-slate-200/50">
                                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                                    <span>
                                                                                        {formatDate(item.date)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="text-center py-10 text-slate-400">
                                                        đang cập nhật lộ trình hạng mục...
                                                    </div>
                                                )}
                                            </div>

                                            {/* Divider if not last */}
                                            {groupIdx < documentGroups.length - 1 && (
                                                <div className="mx-6 my-4 border-t border-slate-50 border-dashed" />
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Project-wide/Misc Timeline items if any */}
                                {extraProjectTimeline.length > 0 && (
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-slate-400" />
                                            <h3 className="text-base font-bold text-slate-600 uppercase tracking-widest">
                                                Thanh toán & Mốc dự án chung
                                            </h3>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {extraProjectTimeline.map((item: any) => (
                                                <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                        {getTimelineIcon(item.type, item.status)}
                                                    </div>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                                            <p className="text-xs text-slate-500 font-medium">{formatDate(item.date)}</p>
                                                        </div>
                                                        {getStatusBadge(item.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Timeline */}
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="pb-6 px-0">
                            <CardTitle className="text-2xl font-bold">Lộ trình hồ sơ & Tài liệu</CardTitle>
                            <CardDescription className="text-base text-slate-500">
                                Quy trình pháp lý và bàn giao dự án chi tiết cho từng hạng mục
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-12">
                            <div className="grid gap-6">
                                {documentGroups.map((group: any, groupIdx: number) => {
                                    const hasContracts = group.contracts.length > 0;
                                    const isCompleted = timeline.some((t: any) => t.type === 'delivery' && t.status === 'completed' && (t.id.includes(group.quotation.id) || group.contracts.some((c: any) => t.id.includes(c.id))));
                                    const progressValue = isCompleted ? 100 : (hasContracts ? 66 : 33);

                                    return (
                                        <div key={group.quotation.id} className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-primary/20 transition-all">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                                            {/* Group Header & Progress */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center font-bold text-lg text-white shadow-lg">
                                                        {groupIdx + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                                                            {capitalize(group.title)}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${progressValue}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                Tiến độ hạng mục: {progressValue}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn(
                                                        "px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest",
                                                        isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            hasContracts ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {isCompleted ? 'đã hoàn thành' : hasContracts ? 'đang triển khai' : 'đang báo giá'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid gap-8 md:grid-cols-3">
                                                {/* 1. Báo giá */}
                                                <div className="relative flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-lg">
                                                            <FileText className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giai đoạn 1</span>
                                                            <h4 className="text-sm font-bold text-slate-900">Báo giá & Đề xuất</h4>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`/quote/${group.quotation.public_token || token}`}
                                                        target="_blank"
                                                        className="flex flex-col gap-3 p-6 rounded-3xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer shadow-sm group/item"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-slate-900">#{group.quotation.quotation_number}</p>
                                                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover/item:text-primary transition-colors" />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            {getStatusBadge(group.quotation.status === 'accepted' ? 'signed' : 'pending_signature')}
                                                            <span className="text-[11px] text-slate-400 font-medium">{formatDate(group.quotation.created_at)}</span>
                                                        </div>
                                                    </a>
                                                </div>

                                                {/* 2. Hợp đồng */}
                                                <div className="relative flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                                                            hasContracts ? "bg-black text-white" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            <FileSignature className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giai đoạn 2</span>
                                                            <h4 className="text-sm font-bold text-slate-900">Hợp đồng kinh tế</h4>
                                                        </div>
                                                    </div>
                                                    {hasContracts ? (
                                                        <div className="space-y-3">
                                                            {group.contracts.map((c: any) => (
                                                                <div
                                                                    key={c.id}
                                                                    className="flex flex-col gap-3 p-6 rounded-3xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-primary/20 transition-all shadow-sm"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-bold text-slate-900">#{c.contract_number}</p>
                                                                        <DocumentDownloadButton
                                                                            type="contract"
                                                                            documentId={c.id}
                                                                            customerId={customer.id}
                                                                            label=""
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        {getStatusBadge(c.status === 'active' || c.status === 'completed' ? 'signed' : 'pending_signature')}
                                                                        <span className="text-[11px] text-slate-400 font-medium">{formatDate(c.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                                            <p className="text-[12px] text-slate-400 italic text-center leading-relaxed">Dự thảo sau khi báo giá được phê duyệt</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 3. Nghiệm thu */}
                                                <div className="relative flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                                                            isCompleted ? "bg-black text-white" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            <CheckCircle className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giai đoạn 3</span>
                                                            <h4 className="text-sm font-bold text-slate-900">Bàn giao & Nghiệm thu</h4>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "h-full min-h-[140px] flex items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all",
                                                        isCompleted ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50"
                                                    )}>
                                                        <p className={cn(
                                                            "text-[12px] text-center leading-relaxed",
                                                            isCompleted ? "text-emerald-700 font-medium" : "text-slate-400 italic"
                                                        )}>
                                                            {isCompleted ? 'Đã nghiệm thu & bàn giao tài liệu' : 'Tài liệu xác nhận hoàn tất dịch vụ hạng mục này'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Task List if any */}
                    {tasks.length > 0 && (
                        <Card className="border-none shadow-none bg-slate-50/50 p-8 rounded-3xl">
                            <CardHeader className="pb-6 px-0">
                                <CardTitle className="text-xl font-bold">Danh mục đầu việc chi tiết</CardTitle>
                                <CardDescription className="text-sm">Kiểm soát tiến độ triển khai từng hạng mục nhỏ</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {tasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                                            <div className={`h-3 w-3 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-emerald-500' :
                                                task.status === 'in_progress' ? 'bg-primary animate-pulse' : 'bg-slate-200'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[13px] font-bold truncate ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                    {capitalize(task.title)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400">{formatDate(task.end_date)}</span>
                                                    {task.priority === 'high' && <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-200 text-red-600 bg-red-50 font-bold uppercase">ưu tiên</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main >

            {/* Footer */}
            <footer className="bg-zinc-950 text-white mt-12 py-16" >
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 md:grid-cols-3 border-b border-white/5 pb-12 mb-12">
                        <div className="space-y-4">
                            <img src="/file/tulie-agency-logo.png" alt="Tulie" className="h-8 w-auto invert brightness-0" />
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Đơn vị cung cấp giải pháp Marketing tổng thể và vận hành hệ thống Tulie Ecosystem.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Liên hệ hỗ trợ</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <a href={`mailto:${salesPerson?.email || 'hello@thiepnhanh.vn'}`} className="text-sm text-zinc-300 hover:text-white transition-colors">
                                        {salesPerson?.email || 'hello@thiepnhanh.vn'}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <a href="tel:0988984554" className="text-sm text-zinc-300 hover:text-white transition-colors font-bold">
                                        098.898.4554
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Văn phòng chính</h4>
                            <p className="text-sm text-zinc-500">
                                Tầng 4, Tòa nhà SHG, Số 8 Quang Trung,<br />
                                Phường Hà Đông, TP. Hà Nội
                            </p>
                        </div>
                    </div>
                    <div className="text-center text-xs text-zinc-600 font-medium">
                        <p>&copy; {new Date().getFullYear()} Tulie Agency - Một sản phẩm của Tulie JSC. Bảo lưu mọi quyền.</p>
                    </div>
                </div>
            </footer >
        </div >
    )
}
