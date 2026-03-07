import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    Download,
    Send,
    CreditCard,
    Building2,
    FileSignature,
    Calendar,
    CheckCircle
} from 'lucide-react'
import { getInvoiceById } from '@/lib/supabase/services/invoice-service'
import { notFound } from 'next/navigation'
import { InvoiceEmailButton } from '@/components/invoices/invoice-email-button'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const invoice = await getInvoiceById(id)
    return {
        title: invoice ? `${invoice.invoice_number} - Tulie CRM` : 'Hóa đơn - Tulie CRM',
    }
}

export default async function InvoiceDetailPage({ params }: any) {
    const { id } = await params
    const invoice = await getInvoiceById(id)

    if (!invoice) {
        notFound()
    }

    const isPaid = invoice.status === 'paid'
    const remaining = invoice.total_amount - (invoice.paid_amount || 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/invoices">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold">{invoice.invoice_number}</h1>
                            <Badge className={INVOICE_STATUS_COLORS[invoice.status] || 'bg-gray-100'}>
                                {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Ngày phát hành: {formatDate(invoice.issue_date)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Tải PDF
                    </Button>
                    <InvoiceEmailButton
                        customerEmail={invoice.customer?.email}
                        customerName={invoice.customer?.company_name || 'Quý khách'}
                        invoiceNumber={invoice.invoice_number}
                        totalAmount={formatCurrency(invoice.total_amount)}
                        dueDate={formatDate(invoice.due_date)}
                        senderName={invoice.creator?.full_name || 'Tulie Agency'}
                    />
                    {!isPaid && (
                        <Button>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Ghi nhận thanh toán
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/invoices/${invoice.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Preview */}
                    <Card>
                        <CardContent className="p-8">
                            {/* Invoice Header */}
                            <div className="flex justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-10 w-10 bg-foreground rounded-lg flex items-center justify-center">
                                            <span className="text-background font-semibold">T</span>
                                        </div>
                                        <span className="text-xl font-semibold">Tulie Agency</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        123 ABC Street, District 1, HCMC<br />
                                        contact@tulie.agency | 0901234567
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-semibold">HÓA ĐƠN</h2>
                                    <p className="text-lg font-medium">{invoice.invoice_number}</p>
                                </div>
                            </div>

                            {/* Bill To */}
                            <div className="grid gap-6 sm:grid-cols-2 mb-8">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Khách hàng</p>
                                    <p className="font-semibold">{invoice.customer?.company_name}</p>
                                    <p className="text-sm">{invoice.customer?.address}</p>
                                    <p className="text-sm">MST: {invoice.customer?.tax_code || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ngày phát hành:</span>
                                            <span>{formatDate(invoice.issue_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hạn thanh toán:</span>
                                            <span>{formatDate(invoice.due_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border rounded-lg overflow-hidden mb-6">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Mô tả</th>
                                            <th className="text-center p-3 font-medium w-20">SL</th>
                                            <th className="text-right p-3 font-medium w-32">Đơn giá</th>
                                            <th className="text-right p-3 font-medium w-32">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items?.map((item: any) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-3">
                                                    <p className="font-medium">{item.name || item.description}</p>
                                                    {item.description && item.name && (
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">{item.quantity} {item.unit}</td>
                                                <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                        {(!invoice.items || invoice.items.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">Không có hạng mục nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tạm tính</span>
                                        <span>{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">VAT ({invoice.vat_percent}%)</span>
                                        <span>{formatCurrency(invoice.vat_amount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Tổng cộng</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                    {invoice.paid_amount > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm text-green-500">
                                                <span>Đã thanh toán</span>
                                                <span>{formatCurrency(invoice.paid_amount)}</span>
                                            </div>
                                            {remaining > 0 && (
                                                <div className="flex justify-between font-semibold text-destructive">
                                                    <span>Còn lại</span>
                                                    <span>{formatCurrency(remaining)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {invoice.notes && (
                                <div className="mt-8 pt-6 border-t">
                                    <p className="text-sm text-muted-foreground">Ghi chú: {invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoice.payments?.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                            <span className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.payment_method} {payment.notes && `• ${payment.notes}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!invoice.payments || invoice.payments.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-8 italic border rounded-lg">Chưa có lịch sử thanh toán</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/customers/${invoice.customer?.id}`} className="font-medium hover:underline">
                                {invoice.customer?.company_name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{invoice.customer?.email}</p>
                        </CardContent>
                    </Card>

                    {/* Related Contract */}
                    {invoice.contract && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSignature className="h-5 w-5" />
                                    Hợp đồng liên quan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/contracts/${invoice.contract.id}`} className="font-medium hover:underline">
                                    {invoice.contract.contract_number}
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Thông tin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span>{formatDate(invoice.created_at)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Người tạo</span>
                                <span>{invoice.creator?.full_name || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
