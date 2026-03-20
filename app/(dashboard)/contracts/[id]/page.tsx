import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    formatCurrency, formatDate
} from '@/lib/utils/format'
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    FileText,
    Calendar,
    Building2,
    Receipt,
    CheckCircle,
    Clock,
    AlertTriangle,
    FileSignature,
    Globe
} from 'lucide-react'
import { getContractById } from '@/lib/supabase/services/contract-service'
import { notFound } from 'next/navigation'
import { ContractStatus } from '@/types'
import { ContractEmailButton } from '@/components/contracts/contract-email-button'
import { ContractDocuments } from '@/components/contracts/contract-documents'
import { ContractLifecycle } from '@/components/contracts/contract-lifecycle'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const contract = await getContractById(id)
    return {
        title: contract ? `${contract.contract_number} - Tulie CRM` : 'Hợp đồng - Tulie CRM',
    }
}

export default async function ContractDetailPage({ params, searchParams }: any) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const fromParam = resolvedSearchParams?.from
    const backHref = fromParam && typeof fromParam === 'string' && fromParam.startsWith('/') ? fromParam : '/contracts'
    const contract = await getContractById(id)

    if (!contract) {
        notFound()
    }

    // In a real app, paid_amount would be calculated from related invoices
    const paidAmount = contract.milestones
        ?.filter((m: any) => m.status === 'completed')
        .reduce((sum: number, m: any) => sum + m.amount, 0) || 0

    const progress = contract.total_amount > 0 ? (paidAmount / contract.total_amount) * 100 : 0

    // Get portal URL via linked project's quotation
    let portalUrl: string | null = null
    if (contract.project_id) {
        try {
            const supabase = await createClient()
            const { data: quotation } = await supabase
                .from('quotations')
                .select('public_token')
                .eq('project_id', contract.project_id)
                .limit(1)
                .maybeSingle()
            if (quotation?.public_token) {
                portalUrl = `/portal/${quotation.public_token}`
            }
        } catch {}
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href={backHref}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileSignature className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-0.5 rounded-md border bg-muted font-medium h-6 flex items-center text-xs">
                                    {contract.contract_number}
                                </div>
                                <Badge className={CONTRACT_STATUS_COLORS[contract.status as ContractStatus] || 'bg-gray-100'}>
                                    {CONTRACT_STATUS_LABELS[contract.status as ContractStatus] || contract.status}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold leading-none">{contract.customer?.company_name}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/invoices/new?contract=${contract.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Tạo hóa đơn
                        </Link>
                    </Button>
                    <SetPasswordDialog
                        entityId={contract.id}
                        tableName="contracts"
                        hasPassword={!!contract.password_hash}
                    />
                    <ContractEmailButton contract={contract} />
                    <Button variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    {portalUrl && (
                        <Button variant="outline" asChild>
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                <Globe className="mr-2 h-4 w-4" />
                                Xem Portal
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Lifecycle Timeline */}
                    <ContractLifecycle contract={contract} />

                    {/* Payment Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tiến độ thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Đã thanh toán: {formatCurrency(paidAmount)}</span>
                                <span>Tổng giá trị: {formatCurrency(contract.total_amount)}</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <p className="text-center text-sm text-muted-foreground">
                                {progress.toFixed(0)}% hoàn thành
                            </p>
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Milestone thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contract.milestones?.map((milestone: any, index: number) => (
                                <div key={milestone.id} className="flex items-start gap-4">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${milestone.status === 'completed' ? 'bg-emerald-500 text-white' :
                                        milestone.status === 'overdue' ? 'bg-rose-500 text-white' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {milestone.status === 'completed' ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : milestone.status === 'overdue' ? (
                                            <AlertTriangle className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{milestone.name}</p>
                                            <span className="font-medium">{formatCurrency(milestone.amount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Hạn: {formatDate(milestone.due_date)}</span>
                                            {milestone.completed_at && (
                                                <span className="text-green-500">Đã thanh toán {formatDate(milestone.completed_at)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!contract.milestones || contract.milestones.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">Chưa thiết lập milestone thanh toán</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Terms & Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết & Điều khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contract.description && (
                                <div>
                                    <h4 className="font-medium mb-1">Mô tả dự án</h4>
                                    <p className="text-sm text-muted-foreground">{contract.description}</p>
                                </div>
                            )}
                            {contract.terms && (
                                <div>
                                    <h4 className="font-medium mb-1">Điều khoản hợp đồng</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{contract.terms}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/customers/${contract.customer?.id}`} className="font-medium hover:underline">
                                {contract.customer?.company_name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{contract.customer?.email}</p>
                            <p className="text-sm text-muted-foreground">{contract.customer?.phone}</p>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ngày ký</span>
                                <span className="font-medium">{contract.signed_date ? formatDate(contract.signed_date) : 'Chưa ký'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bắt đầu</span>
                                <span className="font-medium">{formatDate(contract.start_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Kết thúc</span>
                                <span className="font-medium">{contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Quote & Creator */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Thông tin khác
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contract.quotation && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Báo giá gốc</p>
                                    <Link href={`/quotations/${contract.quotation.id}`} className="font-medium hover:underline">
                                        {contract.quotation.quotation_number}
                                    </Link>
                                </div>
                            )}
                            {contract.creator && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Người phụ trách</p>
                                    <p className="font-medium">{contract.creator.full_name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Document Templates */}
                    <ContractDocuments contract={contract} />
                </div>
            </div>
        </div>
    )
}
