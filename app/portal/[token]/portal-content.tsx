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
    const { quotation, quotations, contracts, invoices, timeline, customer } = data
    const [isSigning, setIsSigning] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    // Primary project identity
    const dealTitle = quotation.deal?.title
    const projectTitle = dealTitle || (contracts?.length > 0 ? contracts[0].title : (quotations?.length > 0 ? quotations[0].title : quotation.title))

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
    const tasks = data.tasks || []

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
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
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
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Tổng giá trị dự án</span>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mb-1">{formatCurrency(totalValue)}</p>
                            <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
                                <span>Đã thanh toán {paymentProgress.toFixed(0)}%</span>
                                <span>Còn lại {formatCurrency(remainingAmount)}</span>
                            </div>
                            <Progress value={paymentProgress} className="h-1.5" />
                            <p className="text-[11px] text-muted-foreground mt-3 flex justify-between">
                                <span>{totalDocuments} tài liệu</span>
                                <span className="font-semibold">Đã thanh toán: {formatCurrency(totalPaid)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Documents Summary */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Hồ sơ dự án</span>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mb-1">{totalDocuments} tài liệu</p>
                            <div className="space-y-1.5 mt-3">
                                {(quotations?.length || 1) > 0 && (
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>Báo giá</span>
                                        <span className="font-medium">{quotations?.length || 1} bản</span>
                                    </div>
                                )}
                                {contracts?.length > 0 && (
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>Hợp đồng</span>
                                        <span className="font-medium">{contracts.length} bản</span>
                                    </div>
                                )}
                                {invoices?.length > 0 && (
                                    <div className="flex justify-between text-[11px] text-muted-foreground">
                                        <span>Yêu cầu thanh toán</span>
                                        <span className="font-medium">{invoices.length} bản</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Progress */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">Tiến độ dự án</span>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold mb-1">{projectProgress}%</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                                <Calendar className="h-3 w-3" />
                                <span>Hoàn thành dự kiến: {timeline.length > 0 ? formatDate(timeline[timeline.length - 1].date) : '...'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md text-[11px] font-medium">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                <span>{completedSteps}/{totalSteps} công việc đã hoàn tất</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
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
                        {/* Documents */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Tài liệu và hồ sơ</CardTitle>
                                <CardDescription>
                                    Xem và tải về các văn bản chính thức
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.type === 'quotation' ? `/quote/${doc.public_token || token}` : '#'}
                                        target="_blank"
                                        className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 hover:border-foreground/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                                <div className="mt-0.5">{getStatusBadge(doc.status)}</div>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                    </a>
                                ))}
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
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-1">Cần hỗ trợ?</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Liên hệ {salesPerson?.full_name || 'Tulie Agency'} qua email{' '}
                                            <a href={`mailto:${salesPerson?.email || 'info@tulie.vn'}`} className="underline font-medium">
                                                {salesPerson?.email || 'info@tulie.vn'}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Tulie Agency. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
