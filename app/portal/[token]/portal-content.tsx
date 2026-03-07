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


interface PortalContentProps {
    data: any
    token: string
}

const getStatusBadge = (status: string, isLate?: boolean) => {
    if (isLate) {
        return <Badge variant="destructive" className="bg-red-900 text-neutral-50 border-none dark:bg-red-600">Phát sinh trễ</Badge>
    }
    switch (status) {
        case 'completed':
        case 'signed':
        case 'paid':
        case 'accepted':
            return <Badge className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">Hoàn thành</Badge>
        case 'overdue':
            return <Badge variant="destructive" className="bg-red-500 text-white dark:bg-red-700">Quá hạn</Badge>
        case 'pending':
        case 'sent':
        case 'pending_signature':
            return <Badge variant="secondary" className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300">Chờ xử lý</Badge>
        case 'upcoming':
            return <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">Sắp tới</Badge>
        default:
            return <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-600">{status}</Badge>
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

    // Primary project identity (if part of a deal, use deal title)
    const dealTitle = quotation.deal?.title
    const projectTitle = dealTitle || (contracts?.length > 0 ? contracts[0].title : (quotations?.length > 0 ? quotations[0].title : quotation.title))

    // Build documents list from all related data
    const documents: any[] = []

    if (quotations && quotations.length > 0) {
        quotations.forEach((q: any) => {
            documents.push({
                id: q.id,
                name: `Báo giá #${q.quotation_number}`,
                type: 'quotation',
                status: q.status === 'accepted' ? 'signed' : 'pending_signature',
                public_token: q.public_token, // Use its own token if we want to deep link
                pdf_url: `/quote/${q.public_token || token}`
            })
        })
    } else {
        documents.push({
            id: quotation.id,
            name: `Báo giá #${quotation.quotation_number}`,
            type: 'quotation',
            status: quotation.status === 'accepted' ? 'signed' : 'pending_signature',
            pdf_url: `/quote/${token}`
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
                status: inv.status,
                pdf_url: inv.pdf_url,
                lookup_info: inv.lookup_info
            })
        })
    }

    const totalPaid = invoices?.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total_amount, 0) || 0

    // Aggregated value. If there are contracts, use total of contracts. Otherwise total of accepted quotations.
    const totalValueFromContracts = contracts?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0
    const totalValueFromQuotes = quotations?.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => sum + q.total_amount, 0) || 0

    const totalValue = totalValueFromContracts || totalValueFromQuotes || quotation.total_amount
    const paymentProgress = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0

    // Tasks for Gantt
    const tasks = data.tasks || []



    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src="/logo.png" alt="Tulie" className="h-10 w-auto object-contain" />
                            <div>
                                <h1 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">Tulie Agency</h1>
                                <p className="text-[10px] text-neutral-500 font-medium tracking-normal">Portal khách hàng</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">{customer?.company_name}</p>
                            <p className="text-sm text-neutral-500">{customer?.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Overview */}
                <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <FileSignature className="h-5 w-5 text-primary" />
                                    {projectTitle}
                                </CardTitle>
                                <CardDescription className="mt-1 text-neutral-500 font-normal">
                                    Tiến độ tổng thể dự án
                                </CardDescription>
                            </div>
                            {contracts && contracts.length > 0 ? (
                                <Badge className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 font-medium">
                                    {contracts[0].type === 'order' ? 'Đơn hàng đang thực hiện' : 'Hợp đồng đang triển khai'}
                                </Badge>
                            ) : (
                                getStatusBadge(quotation.status)
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-neutral-500">Tổng giá trị</p>
                                    <p className="font-bold text-base">
                                        {formatCurrency(totalValue)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-neutral-500">Đã thanh toán</p>
                                    <p className="font-bold text-base">
                                        {formatCurrency(totalPaid)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-neutral-500">Ngày bắt đầu</p>
                                    <p className="font-bold text-base">
                                        {formatDate(contracts?.[0]?.start_date || quotations?.[0]?.created_at || quotation.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-md bg-neutral-100 text-neutral-900 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-neutral-500">Loại hồ sơ</p>
                                    <p className="font-bold text-base">
                                        {contracts?.length > 0 ? (contracts[0].type === 'order' ? 'Đơn hàng' : 'Hợp đồng') : 'Báo giá'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Progress */}
                        <div className="mt-8">
                            <div className="flex justify-between text-xs font-medium mb-2">
                                <span className="text-neutral-500">Tiến độ thanh toán</span>
                                <span className="text-neutral-900 dark:text-neutral-100">{paymentProgress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                <div
                                    className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full transition-all duration-500"
                                    style={{ width: `${paymentProgress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Schedule Section (Gantt & Tasks) */}
                {tasks.length > 0 && (
                    <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-lg font-bold">Lịch trình & Kế hoạch chi tiết</CardTitle>
                            <CardDescription className="text-neutral-500 font-normal">Biểu đồ Gantt và danh sách công việc triển khai thực tế.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Simple CSS Gantt Chart */}
                            <div className="overflow-x-auto pb-4">
                                <div className="min-w-[800px] space-y-2">
                                    {/* Month labels (approximate) */}
                                    <div className="flex border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-4">
                                        <div className="w-1/4"></div>
                                        <div className="flex-1 flex justify-between px-4 text-[10px] font-bold text-neutral-400">
                                            <span>Bắt đầu</span>
                                            <span>Triển khai</span>
                                            <span>Hoàn thiện</span>
                                            <span>Kết thúc</span>
                                        </div>
                                    </div>
                                    {tasks.map((task: any) => {
                                        // Simple percentage calculation for demo gantt
                                        // In real app, calculate based on project min/max dates
                                        const start = 10 + (Math.random() * 20)
                                        const width = 20 + (Math.random() * 40)
                                        return (
                                            <div key={task.id} className="flex items-center group">
                                                <div className="w-1/4 text-xs font-medium pr-4 truncate group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </div>
                                                <div className="flex-1 h-6 bg-neutral-50 dark:bg-neutral-900 rounded relative overflow-hidden">
                                                    <div
                                                        className={`absolute top-1 bottom-1 rounded transition-all duration-500 ${task.status === 'completed' ? 'bg-neutral-900 dark:bg-neutral-100' :
                                                            task.status === 'in_progress' ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-neutral-700'
                                                            }`}
                                                        style={{ left: `${start}%`, width: `${width}%` }}
                                                    >
                                                        {task.status === 'completed' && <CheckCircle className="h-3 w-3 absolute right-1 top-1/2 -translate-y-1/2 text-white dark:text-black opacity-50" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Detailed To-Do List */}
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
                        <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-lg font-bold">Các mốc quan trọng</CardTitle>
                                <CardDescription className="text-neutral-500 font-normal">
                                    Lộ trình thực hiện và bàn giao dịch vụ tổng quát
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative space-y-0">
                                    {timeline.map((item: any, index: number) => (
                                        <div key={item.id} className="flex items-center gap-4 pb-8">
                                            {/* Timeline Line */}
                                            <div className="flex flex-col items-center">
                                                <div className={`p-2 rounded-md border ${item.status === 'completed' ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-black' :
                                                    item.status === 'pending' || item.status === 'overdue' ? 'bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700' :
                                                        'bg-transparent border-dashed border-neutral-200 dark:border-neutral-800'
                                                    }`}>
                                                    {getTimelineIcon(item.type, item.status)}
                                                </div>
                                                {index < timeline.length - 1 && (
                                                    <div className={`w-[1px] flex-1 mt-3 mb-1 bg-neutral-200 dark:bg-neutral-800`} />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-1">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                                            <h4 className={`font-bold text-sm sm:text-base ${item.status === 'upcoming' ? 'text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                                {item.title}
                                                            </h4>
                                                            <div className="sm:hidden">
                                                                {getStatusBadge(item.status, item.is_late)}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs sm:text-[13px] text-neutral-500 max-w-sm leading-relaxed whitespace-pre-line font-normal">
                                                            {item.description}
                                                        </p>
                                                        {item.delay_reason && (
                                                            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                                                                Lý do trễ: {item.delay_reason}
                                                            </p>
                                                        )}
                                                        {item.amount && (
                                                            <p className={`text-xs sm:text-[13px] font-bold mt-2 ${item.status === 'completed' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'}`}>
                                                                {formatCurrency(item.amount)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-1 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 sm:pt-0.5">
                                                        <div className="hidden sm:block">
                                                            {getStatusBadge(item.status, item.is_late)}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-bold">
                                                                {formatDate(item.date)}
                                                            </p>
                                                            {item.planned_date && item.date !== item.planned_date && (
                                                                <p className="text-[10px] text-neutral-400 line-through font-normal">
                                                                    {formatDate(item.planned_date)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {timeline.length === 0 && (
                                        <div className="text-center py-10 text-neutral-500 text-sm font-normal">
                                            Chưa có dữ liệu tiến độ
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documents */}
                    <div className="space-y-6">
                        <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
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
                                            <Button variant="ghost" size="sm" asChild className="h-9 px-3 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium" disabled={!doc.pdf_url}>
                                                <a href={doc.pdf_url || '#'} target="_blank">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    <span className="text-xs">Tải PDF</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Card className="border-neutral-200 shadow-sm dark:border-neutral-800 bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-full bg-neutral-800 dark:bg-neutral-200 shrink-0">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold">Cần hỗ trợ?</h4>
                                        <p className="text-[13px] text-neutral-400 dark:text-neutral-600 leading-relaxed font-normal">
                                            Liên hệ Hotline 098.898.4554 hoặc email support@tulielab.vn để được giải đáp thắc mắc.
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
                    <p>© {new Date().getFullYear()} Tulie CRM. Bản quyền thuộc về Tulie Agency.</p>
                </div>
            </footer>
        </div>
    )
}
