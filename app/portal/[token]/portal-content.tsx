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
    PenTool
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import DocumentDownloadButton from '@/components/documents/DocumentDownloadButton'
import { Progress } from '@/components/ui/progress'
import { CustomerInfoForm } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'

interface PortalContentProps {
    data: any
    token: string
}

const getStatusBadge = (status: string, isLate?: boolean) => {
    if (isLate) return <Badge variant="destructive" className="bg-red-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Trễ hạn</Badge>

    switch (status) {
        case 'completed':
        case 'paid':
        case 'signed':
            return <Badge className="bg-emerald-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Hoàn thành</Badge>
        case 'in_progress':
        case 'partial_paid':
            return <Badge className="bg-amber-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Đang triển khai</Badge>
        case 'pending':
        case 'sent':
        case 'pending_signature':
            return <Badge className="bg-blue-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Chờ xử lý</Badge>
        case 'overdue':
            return <Badge className="bg-rose-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Quá hạn</Badge>
        case 'upcoming':
            return <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-500 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Sắp tới</Badge>
        default:
            return <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-500 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">{status}</Badge>
    }
}

const getTimelineIcon = (type: string, status: string) => {
    const iconClass = status === 'completed' ? 'text-white dark:text-neutral-900' : status === 'pending' ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-300 dark:text-neutral-600'
    switch (type) {
        case 'payment':
            return <Wallet className={`h-5 w-5 ${iconClass}`} />
        case 'work':
            return <FileText className={`h-5 w-5 ${iconClass}`} />
        case 'delivery':
            return <FileText className={`h-5 w-5 ${iconClass}`} />
        case 'milestone':
            return <FileSignature className={`h-5 w-5 ${iconClass}`} />
        default:
            return <Clock className={`h-5 w-5 ${iconClass}`} />
    }
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const { quotation, quotations, contracts, invoices, timeline, customer } = data
    const [isSigning, setIsSigning] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    // Primary project identity
    const dealTitle = quotation.deal?.title
    const projectTitle = dealTitle || (contracts?.length > 0 ? contracts[0].title : (quotations?.length > 0 ? quotations[0].title : quotation.title))

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

    const totalPaid = invoices?.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total_amount, 0) || 0
    const totalValueFromContracts = contracts?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0
    const totalValueFromQuotes = quotations?.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => sum + q.total_amount, 0) || 0
    const totalValue = totalValueFromContracts || totalValueFromQuotes || quotation.total_amount
    const paymentProgress = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0
    const tasks = data.tasks || []

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-12 md:h-14 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-neutral-500 font-medium">Khách hàng</span>
                            <span className="text-sm font-bold">{customer?.company_name || customer?.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero / Overview */}
                <div className="mb-10 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {projectTitle}
                    </h1>
                    <p className="text-neutral-500 max-w-2xl font-normal">
                        Dưới đây là thông báo về tiến độ dự án, tài liệu liên quan và các yêu cầu thanh toán dành cho Quý khách.
                    </p>
                </div>

                {/* Info Update Notice */}
                {customer?.is_info_unlocked && (
                    <Card className="mb-10 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 border-l-4 border-l-neutral-900 dark:border-l-neutral-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <PenTool className="h-5 w-5" />
                                Cập nhật thông tin khách hàng
                            </CardTitle>
                            <CardDescription className="text-neutral-500 font-normal">
                                Vui lòng kiểm tra và bổ sung thông tin công ty để hoàn thiện các văn bản, hợp đồng.
                                Các trường thông tin sẽ được khóa lại sau khi Quý khách xác nhận.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:opacity-90">
                                        Bắt đầu cập nhật
                                    </Button>
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
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* Status Dashboard */}
                <div className="grid gap-6 md:grid-cols-3 mb-10">
                    <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm border-b-2 border-b-emerald-500 rounded-xl overflow-hidden">
                        <CardHeader className="pb-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tiến độ thanh toán</CardTitle>
                                <Wallet className="h-4 w-4 text-emerald-500" />
                            </div>
                            <CardTitle className="text-2xl font-black">{formatCurrency(totalPaid)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end mb-1.5">
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Đã thanh toán {Math.round(paymentProgress)}%</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Còn lại {formatCurrency(totalValue - totalPaid)}</p>
                            </div>
                            <Progress value={paymentProgress} className="h-2 bg-neutral-100 dark:bg-neutral-800" />
                            <p className="text-[11px] text-neutral-500 mt-3 font-medium flex justify-between">
                                <span>Tổng hợp đồng:</span>
                                <span className="font-bold">{formatCurrency(totalValue)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white dark:bg-neutral-900 shadow-sm border-b-2 border-b-blue-500 rounded-xl">
                        <CardHeader className="pb-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tiến độ dự án</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                            <CardTitle className="text-2xl font-black">
                                {Math.round((timeline.filter((i: any) => i.status === 'completed').length / (timeline.length || 1)) * 100)}%
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-bold mb-3">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>Hoàn thành dự kiến: {timeline.length > 0 ? formatDate(timeline[timeline.length - 1].date) : '...'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                                <CheckCircle className="h-4 w-4" />
                                <span>{timeline.filter((i: any) => i.status === 'completed').length}/{timeline.length} công việc đã hoàn tất</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg rounded-xl">
                        <CardHeader className="pb-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Hỗ trợ 24/7</CardTitle>
                                <AlertCircle className="h-4 w-4 text-amber-400" />
                            </div>
                            <CardTitle className="text-2xl font-black">098.898.4554</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-bold uppercase mb-2">
                                Nguyễn Thanh Tùng - Quản lý dự án
                            </p>
                            <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest border-neutral-700 dark:border-neutral-200 hover:bg-neutral-800 dark:hover:bg-neutral-100 h-8" asChild>
                                <a href="tel:0988984554">Gọi hỗ trợ ngay</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Kanban-like Tasks section if available */}
                {tasks.length > 0 && (
                    <Card className="mb-10 border-neutral-200  dark:border-neutral-800 bg-white dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Công việc chi tiết</CardTitle>
                            <CardDescription className="text-neutral-500 font-normal">Danh sách các nhiệm vụ đang được triển khai</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {tasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-neutral-900 dark:bg-neutral-100' :
                                            task.status === 'in_progress' ? 'bg-blue-500' : 'bg-neutral-300'
                                            }`} />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-neutral-400 line-through' : ''}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-neutral-400">{formatDate(task.end_date)}</span>
                                                {task.priority === 'high' && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-200 text-red-600 font-medium">Ưu tiên</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Timeline */}
                    <div className="lg:col-span-2">
                        <Card className="border-neutral-200  dark:border-neutral-800">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-lg font-bold">Các mốc quan trọng</CardTitle>
                                <CardDescription className="text-neutral-500 font-normal">
                                    Lộ trình thực hiện và bàn giao dịch vụ tổng quát
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="relative space-y-0 min-h-[400px]">
                                    {/* Central Line */}
                                    <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-neutral-100 dark:bg-neutral-800" />

                                    {timeline.map((item: any, index: number) => {
                                        const isCompleted = item.status === 'completed'
                                        const isUpcoming = item.status === 'upcoming'
                                        const isCurrent = !isCompleted && !isUpcoming

                                        return (
                                            <div key={item.id} className="flex gap-6 pb-10 relative group">
                                                <div className="flex flex-col items-center">
                                                    <div className={`z-10 h-11 w-11 flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${isCompleted ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-black scale-100' :
                                                        isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110' :
                                                            'bg-white border-neutral-200 text-neutral-400 dark:bg-neutral-900 dark:border-neutral-800 scale-90'
                                                        }`}>
                                                        {getTimelineIcon(item.type, item.status)}
                                                    </div>
                                                </div>

                                                <div className="flex-1 -mt-0.5">
                                                    <Card className={`border-none shadow-sm transition-all duration-300 ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-100 dark:ring-blue-900/30' :
                                                        'bg-white dark:bg-neutral-900/50'
                                                        }`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <h4 className={`font-black text-sm sm:text-lg ${isUpcoming ? 'text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                                            {item.title}
                                                                        </h4>
                                                                        {getStatusBadge(item.status, item.is_late)}
                                                                    </div>
                                                                    <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed whitespace-pre-line font-medium italic">
                                                                        {item.description}
                                                                    </p>
                                                                    {item.amount && (
                                                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-50 dark:border-neutral-800/50">
                                                                            <Wallet className="h-3 w-3 text-neutral-400" />
                                                                            <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                                                                                Giá trị: {formatCurrency(item.amount)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0 text-left sm:text-right flex items-center sm:items-end gap-2 sm:flex-col">
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                                        <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                                                                        <span className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-300 font-black tracking-tight">
                                                                            {formatDate(item.date)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {timeline.length === 0 && (
                                        <div className="text-center py-20 text-neutral-500 text-sm font-bold uppercase tracking-widest opacity-50">
                                            Đang cập nhật lộ trình...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documents */}
                    <div className="space-y-6">
                        <Card className="border-neutral-200  dark:border-neutral-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold">Tài liệu & Hồ sơ</CardTitle>
                                <CardDescription className="text-neutral-500 font-normal">
                                    Xem và tải về các văn bản chính thức
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex flex-wrap items-center justify-between gap-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-200 group">
                                        <div className="flex items-center gap-4 min-w-[200px] flex-1">
                                            <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700 group-hover:border-primary/30 transition-colors">
                                                <FileText className="h-5 w-5 text-neutral-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{doc.name}</p>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(doc.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:border-l sm:pl-4 sm:border-neutral-100 dark:sm:border-neutral-800">
                                            <Button variant="ghost" size="sm" asChild className="h-9 px-3 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium">
                                                <a href={doc.type === 'quotation' ? `/quote/${doc.public_token || token}` : (doc.lookup_info || '#')} target="_blank">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    <span className="text-xs">Xem</span>
                                                </a>
                                            </Button>

                                            <DocumentDownloadButton
                                                type={doc.type}
                                                documentId={doc.id}
                                                customerId={customer?.id}
                                                label="Tải PDF"
                                                variant="ghost"
                                                className="h-9 px-3 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Card className="border-neutral-200  dark:border-neutral-800 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-full bg-neutral-800 dark:bg-neutral-200 shrink-0">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold">Cần hỗ trợ?</h4>
                                        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 leading-relaxed font-normal">
                                            Liên hệ Hotline 098.898.4554 hoặc email info@tulie.vn để được giải đáp thắc mắc.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-xs font-medium text-neutral-500 tracking-normal">
                    <p>© {new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
