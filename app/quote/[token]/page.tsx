import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText } from 'lucide-react'

// Mock data - in real app, fetch by token from database
const mockQuotation = {
    id: '1',
    quote_number: 'QT-2026-0142',
    customer: {
        company_name: 'ABC Corporation',
        email: 'contact@abc.com',
        phone: '0901234567',
    },
    status: 'sent',
    title: 'Báo giá dịch vụ Marketing',
    created_at: '2026-01-10',
    valid_until: '2026-02-10',
    items: [
        { id: '1', name: 'Website Development', quantity: 1, unit: 'dự án', unit_price: 50000000, total: 50000000 },
        { id: '2', name: 'SEO Package - Basic', quantity: 6, unit: 'tháng', unit_price: 10000000, total: 60000000 },
        { id: '3', name: 'Social Media Management', quantity: 6, unit: 'tháng', unit_price: 15000000, total: 90000000 },
    ],
    subtotal: 200000000,
    vat_percent: 10,
    vat_amount: 20000000,
    total_amount: 220000000,
    terms: '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành',
    notes: 'Chúng tôi rất vui được hợp tác cùng Quý công ty.',
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `Báo giá ${mockQuotation.quote_number} - Tulie Agency`,
        description: `Báo giá dành cho ${mockQuotation.customer.company_name}`,
    }
}

export default function PublicQuotationPage() {
    const quotation = mockQuotation
    const isExpired = new Date(quotation.valid_until) < new Date()

    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmer, setConfirmer] = useState({
        name: '',
        email: '',
        phone: '',
        position: ''
    })

    const handleConfirm = () => {
        // Validation
        if (!confirmer.name || !confirmer.phone) {
            alert('Vui lòng nhập họ tên và số điện thoại')
            return
        }

        // TODO: Call API to update status='accepted' and save confirmer info
        alert('Cảm ơn! Báo giá đã được chấp nhận. Chúng tôi sẽ liên hệ lại sớm.')
        console.log('Confirmed by:', confirmer)
        setShowConfirm(false)
    }

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    {/* Use proper logo component or Image in real implementation */}
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground mb-4">
                        <span className="text-2xl font-bold text-background">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">Tulie Agency</h1>
                    <p className="text-muted-foreground">Digital Marketing & Web Development</p>
                </div>

                {/* Quotation Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-8">
                        {/* Quotation Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Báo giá</span>
                                </div>
                                <h2 className="text-3xl font-bold">{quotation.quote_number}</h2>
                                {quotation.title && (
                                    <p className="text-muted-foreground mt-1">{quotation.title}</p>
                                )}
                            </div>
                            <div className="text-sm space-y-1 sm:text-right">
                                <div className="flex items-center gap-2 sm:justify-end">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Ngày tạo: {formatDate(quotation.created_at)}</span>
                                </div>
                                <div className={`flex items-center gap-2 sm:justify-end ${isExpired ? 'text-destructive' : ''}`}>
                                    <Calendar className="h-4 w-4" />
                                    <span>Hiệu lực đến: {formatDate(quotation.valid_until)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-muted/50 rounded-lg p-4 mb-8">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Building2 className="h-4 w-4" />
                                <span>Khách hàng</span>
                            </div>
                            <p className="font-semibold text-lg">{quotation.customer.company_name}</p>
                            {quotation.customer.email && (
                                <p className="text-sm text-muted-foreground">{quotation.customer.email}</p>
                            )}
                        </div>

                        {/* Items Table - Using Sections logic if available or flat fallback */}
                        {/* For now keeping flat structure but ready for sections update */}
                        <div className="mb-8">
                            <h3 className="font-semibold mb-4">Chi tiết báo giá</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Mô tả</th>
                                            <th className="text-center p-3 font-medium w-20">SL</th>
                                            <th className="text-right p-3 font-medium w-32">Đơn giá</th>
                                            <th className="text-right p-3 font-medium w-36">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {quotation.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">
                                                    <span className="font-medium">{item.name}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="p-3 text-right font-medium">
                                                    {formatCurrency(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span>{formatCurrency(quotation.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        VAT ({quotation.vat_percent}%)
                                    </span>
                                    <span>{formatCurrency(quotation.vat_amount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary">{formatCurrency(quotation.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        {quotation.terms && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-2">Điều khoản thanh toán</h3>
                                <div className="text-sm text-muted-foreground whitespace-pre-line">
                                    {quotation.terms}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {quotation.notes && (
                            <div className="bg-muted/30 rounded-lg p-4 mb-8">
                                <p className="text-sm italic">{quotation.notes}</p>
                            </div>
                        )}

                        <Separator className="my-8" />

                        {/* Actions */}
                        {isExpired ? (
                            <div className="text-center py-4">
                                <p className="text-destructive font-medium">
                                    Báo giá này đã hết hạn. Vui lòng liên hệ để nhận báo giá mới.
                                </p>
                            </div>
                        ) : showConfirm ? (
                            <Card className="border-green-500/50 bg-green-500/5">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-5 w-5" />
                                        Xác nhận chấp nhận báo giá
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vui lòng để lại thông tin người đại diện để chúng tôi liên hệ triển khai hợp đồng.
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Họ và tên <span className="text-red-500">*</span></Label>
                                            <Input value={confirmer.name} onChange={e => setConfirmer({ ...confirmer, name: e.target.value })} placeholder="Nguyễn Văn A" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input value={confirmer.phone} onChange={e => setConfirmer({ ...confirmer, phone: e.target.value })} placeholder="090..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={confirmer.email} onChange={e => setConfirmer({ ...confirmer, email: e.target.value })} placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chức vụ</Label>
                                            <Input value={confirmer.position} onChange={e => setConfirmer({ ...confirmer, position: e.target.value })} placeholder="Giám đốc / Kế toán..." />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="ghost" onClick={() => setShowConfirm(false)}>Hủy</Button>
                                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirm}>
                                            Xác nhận ngay
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => setShowConfirm(true)}>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Chấp nhận báo giá
                                </Button>
                                <Button size="lg" variant="destructive">
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Từ chối
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Download className="mr-2 h-5 w-5" />
                                    Tải PDF
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-muted-foreground">
                    <p>Powered by <span className="font-medium">Tulie CRM</span></p>
                    <p className="mt-1">
                        Liên hệ: contact@tulie.agency | 0901 234 567
                    </p>
                </div>
            </div>
        </div>
    )
}

