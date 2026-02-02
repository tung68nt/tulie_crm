import { Invoice } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/constants/status'
import { Plus, Download, Eye, Receipt, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockOutputInvoices: Invoice[] = [
    {
        id: '1',
        invoice_number: 'HDB-2026-0142',
        type: 'output',
        customer_id: '1',
        customer: { id: '1', company_name: 'ABC Corporation', status: 'customer', assigned_to: 'user-1', created_by: 'admin', created_at: '2024-01-01', updated_at: '2024-01-01' },
        created_by: 'user-1',
        status: 'paid',
        issue_date: '2026-01-05',
        due_date: '2026-01-20',
        subtotal: 100000000,
        vat_percent: 10,
        vat_amount: 10000000,
        total_amount: 110000000,
        paid_amount: 110000000,
        created_at: '2026-01-05',
        updated_at: '2026-01-09',
    },
    {
        id: '2',
        invoice_number: 'HDB-2026-0156',
        type: 'output',
        customer_id: '2',
        customer: { id: '2', company_name: 'XYZ Limited', status: 'lead', assigned_to: 'user-2', created_by: 'admin', created_at: '2024-01-01', updated_at: '2024-01-01' },
        created_by: 'user-2',
        status: 'sent',
        issue_date: '2026-01-08',
        due_date: '2026-01-23',
        subtotal: 80000000,
        vat_percent: 10,
        vat_amount: 8000000,
        total_amount: 88000000,
        paid_amount: 0,
        created_at: '2026-01-08',
        updated_at: '2026-01-08',
    },
    {
        id: '3',
        invoice_number: 'HDB-2025-0089',
        type: 'output',
        customer_id: '4',
        customer: { id: '4', company_name: 'GHI Company', status: 'prospect', assigned_to: 'user-2', created_by: 'admin', created_at: '2024-01-01', updated_at: '2024-01-01' },
        created_by: 'user-2',
        status: 'overdue',
        issue_date: '2025-12-15',
        due_date: '2026-01-05',
        subtotal: 45000000,
        vat_percent: 10,
        vat_amount: 4500000,
        total_amount: 49500000,
        paid_amount: 0,
        created_at: '2025-12-15',
        updated_at: '2026-01-05',
    },
]

const mockInputInvoices: Invoice[] = [
    {
        id: '10',
        invoice_number: 'HDM-2026-0015',
        type: 'input',
        vendor_id: '1',
        vendor: { id: '1', name: 'Công ty ABC Hosting', created_at: '2024-01-01', updated_at: '2024-01-01' },
        created_by: 'user-1',
        status: 'paid',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        subtotal: 5000000,
        vat_percent: 10,
        vat_amount: 500000,
        total_amount: 5500000,
        paid_amount: 5500000,
        created_at: '2026-01-01',
        updated_at: '2026-01-02',
    },
    {
        id: '11',
        invoice_number: 'HDM-2026-0018',
        type: 'input',
        vendor_id: '2',
        vendor: { id: '2', name: 'Văn phòng 123', created_at: '2024-01-01', updated_at: '2024-01-01' },
        created_by: 'user-1',
        status: 'sent',
        issue_date: '2026-01-05',
        due_date: '2026-01-20',
        subtotal: 25000000,
        vat_percent: 10,
        vat_amount: 2500000,
        total_amount: 27500000,
        paid_amount: 0,
        created_at: '2026-01-05',
        updated_at: '2026-01-05',
    },
]

export default function InvoicesPage() {
    const totalReceivable = mockOutputInvoices
        .filter((i) => i.status !== 'paid')
        .reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0)

    const overdueCount = mockOutputInvoices.filter((i) => i.status === 'overdue').length

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Hóa đơn</h1>
                    <p className="text-muted-foreground">
                        Quản lý hóa đơn bán hàng và mua vào
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </Button>
                    <Button asChild>
                        <Link href="/invoices/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo hóa đơn
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Công nợ phải thu
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReceivable)}</div>
                    </CardContent>
                </Card>
                <Card className={overdueCount > 0 ? 'border-destructive' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hóa đơn quá hạn
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-destructive' : ''}`}>
                            {overdueCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="output" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="output">Hóa đơn bán hàng ({mockOutputInvoices.length})</TabsTrigger>
                    <TabsTrigger value="input">Hóa đơn mua vào ({mockInputInvoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="output">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Số hóa đơn</TableHead>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Ngày phát hành</TableHead>
                                        <TableHead>Hạn thanh toán</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockOutputInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                            <TableCell>{invoice.customer?.company_name}</TableCell>
                                            <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                                                    {INVOICE_STATUS_LABELS[invoice.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="input">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Số hóa đơn</TableHead>
                                        <TableHead>Nhà cung cấp</TableHead>
                                        <TableHead>Ngày phát hành</TableHead>
                                        <TableHead>Hạn thanh toán</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockInputInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                            <TableCell>{invoice.vendor?.name}</TableCell>
                                            <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                                                    {INVOICE_STATUS_LABELS[invoice.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
