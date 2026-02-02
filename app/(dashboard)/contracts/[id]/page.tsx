import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
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
    AlertTriangle
} from 'lucide-react'

// Mock data
const mockContract = {
    id: '1',
    contract_number: 'HD-2026-0089',
    customer: {
        id: '1',
        company_name: 'ABC Corporation',
        email: 'contact@abc.com',
        phone: '0901234567',
    },
    quotation: {
        id: '1',
        quote_number: 'QT-2026-0142',
    },
    creator: {
        full_name: 'Sarah Nguyen',
    },
    title: 'Hợp đồng phát triển website và marketing',
    description: 'Triển khai website doanh nghiệp và gói SEO + Social Media 6 tháng',
    status: 'active' as const,
    total_value: 220000000,
    paid_amount: 110000000,
    start_date: '2026-01-10',
    end_date: '2026-07-10',
    signed_date: '2026-01-09',
    terms: 'Thanh toán theo tiến độ milestone\nBảo hành 12 tháng sau hoàn thành',
    items: [
        { id: '1', name: 'Website Development', quantity: 1, unit: 'dự án', unit_price: 50000000, total: 50000000 },
        { id: '2', name: 'SEO Package', quantity: 6, unit: 'tháng', unit_price: 10000000, total: 60000000 },
        { id: '3', name: 'Social Media', quantity: 6, unit: 'tháng', unit_price: 15000000, total: 90000000 },
        { id: '4', name: 'VAT 10%', quantity: 1, unit: '', unit_price: 20000000, total: 20000000 },
    ],
    milestones: [
        { id: '1', name: 'Ký hợp đồng & Đặt cọc 50%', amount: 110000000, due_date: '2026-01-10', status: 'completed', completed_at: '2026-01-10' },
        { id: '2', name: 'Hoàn thành website', amount: 50000000, due_date: '2026-03-10', status: 'pending' },
        { id: '3', name: 'Thanh toán đợt cuối', amount: 60000000, due_date: '2026-07-10', status: 'pending' },
    ],
    invoices: [
        { id: '1', invoice_number: 'HDB-2026-0142', amount: 110000000, status: 'paid', issue_date: '2026-01-10' },
    ],
    created_at: '2026-01-09',
    updated_at: '2026-01-10',
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `${mockContract.contract_number} - Tulie CRM`,
    }
}

export default function ContractDetailPage() {
    const contract = mockContract
    const progress = (contract.paid_amount / contract.total_value) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/contracts">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{contract.contract_number}</h1>
                            <Badge className={CONTRACT_STATUS_COLORS[contract.status]}>
                                {CONTRACT_STATUS_LABELS[contract.status]}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{contract.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/invoices/new?contract=${contract.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Tạo hóa đơn
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tiến độ thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Đã thanh toán: {formatCurrency(contract.paid_amount)}</span>
                                <span>Tổng giá trị: {formatCurrency(contract.total_value)}</span>
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
                            {contract.milestones.map((milestone, index) => (
                                <div key={milestone.id} className="flex items-start gap-4">
                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${milestone.status === 'completed' ? 'bg-green-500 text-white' :
                                            milestone.status === 'overdue' ? 'bg-red-500 text-white' :
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
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hạng mục</TableHead>
                                        <TableHead className="text-center">SL</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contract.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="border-t p-4">
                                <div className="flex justify-end">
                                    <div className="flex justify-between w-48 font-semibold text-lg">
                                        <span>Tổng cộng</span>
                                        <span>{formatCurrency(contract.total_value)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Hóa đơn liên quan</CardTitle>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/invoices/new?contract=${contract.id}`}>
                                    Tạo hóa đơn
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {contract.invoices.map((invoice) => (
                                <Link key={invoice.id} href={`/invoices/${invoice.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                                    <div>
                                        <p className="font-medium">{invoice.invoice_number}</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(invoice.issue_date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                                        <Badge variant="secondary" className="text-green-500">{invoice.status}</Badge>
                                    </div>
                                </Link>
                            ))}
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
                            <Link href={`/customers/${contract.customer.id}`} className="font-medium hover:underline">
                                {contract.customer.company_name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{contract.customer.email}</p>
                            <p className="text-sm text-muted-foreground">{contract.customer.phone}</p>
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
                                <span className="font-medium">{formatDate(contract.signed_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bắt đầu</span>
                                <span className="font-medium">{formatDate(contract.start_date)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Kết thúc</span>
                                <span className="font-medium">{formatDate(contract.end_date)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Quote */}
                    {contract.quotation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Báo giá gốc
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/quotations/${contract.quotation.id}`} className="font-medium hover:underline">
                                    {contract.quotation.quote_number}
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
