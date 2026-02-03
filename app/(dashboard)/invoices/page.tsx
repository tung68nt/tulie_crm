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
import { getInvoices } from '@/lib/supabase/services/invoice-service'

export default async function InvoicesPage() {
    const invoices = await getInvoices()
    const outputInvoices = invoices.filter(i => i.type === 'output')
    const inputInvoices = invoices.filter(i => i.type === 'input')

    const totalReceivable = outputInvoices
        .filter((i) => i.status !== 'paid')
        .reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0)

    const overdueCount = outputInvoices.filter((i) => i.status === 'overdue').length

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
                    <TabsTrigger value="output">Hóa đơn bán hàng ({outputInvoices.length})</TabsTrigger>
                    <TabsTrigger value="input">Hóa đơn mua vào ({inputInvoices.length})</TabsTrigger>
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
                                    {outputInvoices.map((invoice) => (
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
                                    {inputInvoices.map((invoice) => (
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
