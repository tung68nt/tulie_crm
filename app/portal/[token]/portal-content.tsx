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
    Receipt
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
    if (isLate) return <Badge variant="destructive" className="text-[10px] font-medium">trễ hạn</Badge>

    switch (status) {
        case 'completed':
        case 'paid':
        case 'signed':
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium">hoàn thành</Badge>
        case 'in_progress':
        case 'partial_paid':
            return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">đang thực hiện</Badge>
        case 'pending':
        case 'pending_signature':
            return <Badge variant="outline" className="text-[10px] font-medium">chờ xử lý</Badge>
        case 'upcoming':
            return <Badge variant="secondary" className="text-[10px] font-medium">sắp tới</Badge>
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
    const { quotation, quotations, contracts, invoices, timeline, customer, project, projectMetadata, tasks } = data
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

    // Build documents list
    const documents: any[] = []

    if (quotations && quotations.length > 0) {
        quotations.forEach((q: any) => {
            documents.push({
                id: q.id,
                name: `Báo giá #${q.quotation_number}`,
                type: 'quotation',
                status: q.status === 'accepted' ? 'signed' : 'pending_signature',
                public_token: q.public_token
            })
        })
    } else {
        documents.push({
            id: quotation.id,
            name: `Báo giá #${quotation.quotation_number}`,
            type: 'quotation',
            status: quotation.status === 'accepted' ? 'signed' : 'pending_signature',
        })
    }

    if (contracts) {
        contracts.forEach((c: any) => {
            documents.push({
                id: c.id,
                name: c.type === 'order' ? `Đơn hàng #${c.contract_number}` : `Hợp đồng #${c.contract_number}`,
                type: 'contract',
                status: c.status === 'active' || c.status === 'completed' ? 'signed' : 'pending_signature'
            })
        })
    }

    if (invoices) {
        invoices.forEach((inv: any) => {
            documents.push({
                id: inv.id,
                name: `Yêu cầu thanh toán ${inv.invoice_number}`,
                type: 'payment_request',
                status: inv.status
            })
        })
    }

    // Total value: contracts > sum of all quotations > single quotation
    const totalPaid = invoices?.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total_amount, 0) || 0
    const totalValueFromContracts = contracts?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0
    const allQuotations = quotations && quotations.length > 0 ? quotations : [quotation]
    const totalValueFromQuotations = allQuotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const totalValue = totalValueFromContracts > 0 ? totalValueFromContracts : totalValueFromQuotations
    const paymentProgress = totalValue > 0 ? Math.min((totalPaid / totalValue) * 100, 100) : 0
    const remainingAmount = totalValue - totalPaid
    const totalDocuments = documents.length


    // Timeline stats
    const completedSteps = timeline.filter((i: any) => i.status === 'completed').length
    const totalSteps = timeline.length || 1
    const projectProgress = Math.round((completedSteps / totalSteps) * 100)

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
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{projectTitle}</h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
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
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{totalDocuments} tài liệu</span>
                                <span className="text-[11px] font-semibold text-slate-900">Paid: {formatCurrency(totalPaid)}</span>
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
                    <Card className="shadow-sm border-slate-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-500">Thời gian thực hiện</span>
                                <Clock className="h-4 w-4 text-slate-900" />
                            </div>
                            <p className="text-2xl font-bold mb-1">
                                {project?.start_date && project?.end_date ? (
                                    `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 3600 * 24))} ngày`
                                ) : 'TBA'}
                            </p>
                            <div className="space-y-2 mt-3">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Ngày bắt đầu</span>
                                    <span className="font-semibold text-slate-900">{project?.start_date ? formatDate(project.start_date) : 'TBA'}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Người phụ trách</span>
                                    <span className="font-semibold text-slate-900">{projectMetadata?.manager_name || 'Hệ thống Quản trị'}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Trạng thái dự án</span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-700 uppercase">{project?.status || 'Active'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Timeline */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-semibold">Các mốc quan trọng</CardTitle>
                                <CardDescription>
                                    Lộ trình thực hiện và bàn giao dịch vụ tổng quát
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative space-y-0">
                                    {/* Central Line */}
                                    <div className="absolute left-[17px] top-4 bottom-4 w-px bg-border" />

                                    {timeline.map((item: any, index: number) => {
                                        const isCompleted = item.status === 'completed'
                                        const isUpcoming = item.status === 'upcoming'
                                        const isCurrent = !isCompleted && !isUpcoming

                                        return (
                                            <div key={item.id} className="flex gap-4 pb-6 relative group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`z-10 h-9 w-9 flex items-center justify-center rounded-full border-2 transition-all ${isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                                                        isCurrent ? 'bg-blue-600 border-blue-600 text-white' :
                                                            'bg-muted border-border text-muted-foreground'
                                                        }`}>
                                                        {getTimelineIcon(item.type, item.status)}
                                                    </div>
                                                </div>

                                                <div className="flex-1 -mt-0.5">
                                                    <div className={`p-4 rounded-lg border transition-all ${isCurrent ? 'bg-blue-50/50 border-blue-200' :
                                                        'bg-card border-border hover:bg-muted/30'
                                                        }`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                            <div className="space-y-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className={`font-semibold text-sm ${isUpcoming ? 'text-muted-foreground' : ''}`}>
                                                                        {item.title}
                                                                    </h4>
                                                                    {getStatusBadge(item.status, item.is_late)}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                                                    {item.description}
                                                                </p>
                                                                {item.amount && (
                                                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t">
                                                                        <Wallet className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-xs font-semibold">
                                                                            Giá trị: {formatCurrency(item.amount)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="shrink-0">
                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-[11px] font-medium">
                                                                        {formatDate(item.date)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {timeline.length === 0 && (
                                        <div className="text-center py-16 text-muted-foreground text-sm">
                                            Đang cập nhật lộ trình...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Documents Timeline */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Lộ trình hồ sơ & Tài liệu</CardTitle>
                                <CardDescription>
                                    Quy trình pháp lý và bàn giao dự án
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 pb-6">
                                <div className="relative">
                                    {/* Vertical Dotted Line */}
                                    <div className="absolute left-[39px] top-6 bottom-6 w-px border-l-2 border-dotted border-slate-200" />

                                    <div className="space-y-6">
                                        {/* 1. Báo giá */}
                                        <div className="relative flex items-start gap-4 px-6 group">
                                            <div className={cn(
                                                "z-10 h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                quotations?.length > 0 ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-300"
                                            )}>
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 space-y-3 pt-0.5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bước 1</span>
                                                    <h4 className="text-sm font-bold text-slate-900">Báo giá & Đề xuất</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    {documents.filter(d => d.type === 'quotation').map((doc) => (
                                                        <a
                                                            key={doc.id}
                                                            href={`/quote/${doc.public_token || token}`}
                                                            target="_blank"
                                                            className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group/item border-slate-100"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                                                <p className="text-xs font-bold truncate text-slate-700">{doc.name}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusBadge(doc.status)}
                                                                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-slate-900 transition-colors" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Hợp đồng */}
                                        <div className="relative flex items-start gap-4 px-6 group">
                                            <div className={cn(
                                                "z-10 h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                contracts?.length > 0 ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-300"
                                            )}>
                                                <FileSignature className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 space-y-3 pt-0.5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bước 2</span>
                                                    <h4 className="text-sm font-bold text-slate-900">Hợp đồng kinh tế</h4>
                                                </div>
                                                {contracts?.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {documents.filter(d => d.type === 'contract').map((doc) => (
                                                            <div
                                                                key={doc.id}
                                                                className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 border-slate-100"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                                                    <p className="text-xs font-bold truncate text-slate-700">{doc.name}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusBadge(doc.status)}
                                                                    <DocumentDownloadButton
                                                                        type="contract"
                                                                        documentId={doc.id}
                                                                        customerId={customer.id}
                                                                        label=""
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic">Dự thảo sau khi báo giá được phê duyệt</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Nghiệm thu */}
                                        <div className="relative flex items-start gap-4 px-6 group">
                                            <div className={cn(
                                                "z-10 h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                timeline.some(t => t.type === 'delivery' && t.status === 'completed') ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-300"
                                            )}>
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 space-y-3 pt-0.5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bước 3</span>
                                                    <h4 className="text-sm font-bold text-slate-900">Nghiệm thu & Bàn giao</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-400 italic">Biên bản xác nhận hoàn tất dịch vụ</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks */}
                        {tasks.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Công việc chi tiết</CardTitle>
                                    <CardDescription>Các nhiệm vụ đang được triển khai</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {tasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-md border">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-primary' :
                                                task.status === 'in_progress' ? 'bg-blue-500' : 'bg-muted-foreground/30'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}>
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-muted-foreground">{formatDate(task.end_date)}</span>
                                                    {task.priority === 'high' && <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-200 text-red-600">ưu tiên</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Help */}
                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="h-4 w-4 text-slate-900" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-1">Cần hỗ trợ?</h4>
                                        <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                                            <p>
                                                Liên hệ {salesPerson?.full_name || 'Tulie Agency'} qua email{' '}
                                                <a href={`mailto:${salesPerson?.email || 'info@tulie.vn'}`} className="underline font-medium hover:text-foreground transition-colors">
                                                    {salesPerson?.email || 'info@tulie.vn'}
                                                </a>
                                            </p>
                                            <p>
                                                Hotline: <a href="tel:0988984554" className="font-bold text-slate-900 hover:underline">098.898.4554</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main >

            {/* Footer */}
            < footer className="border-t bg-muted/30 mt-12" >
                <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                </div>
            </footer >
        </div >
    )
}
