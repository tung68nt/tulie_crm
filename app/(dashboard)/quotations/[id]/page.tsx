'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    Copy,
    ExternalLink,
    FileSignature,
    Download,
    Eye,
    Clock,
    Building2
} from 'lucide-react'

// Mock data
const mockQuotation = {
    id: '1',
    quote_number: 'QT-2026-0142',
    customer: {
        id: '1',
        company_name: 'ABC Corporation',
        email: 'contact@abc.com',
        phone: '0901234567',
    },
    creator: {
        full_name: 'Sarah Nguyen',
    },
    status: 'accepted' as const,
    title: 'Báo giá dịch vụ Marketing Digital',
    description: 'Gói dịch vụ marketing tổng hợp bao gồm website, SEO và quản lý social media',
    terms: '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành',
    notes: 'Khách hàng yêu cầu hoàn thành trong Q1 2026',
    items: [
        { id: '1', name: 'Website Development', description: 'Thiết kế và phát triển website doanh nghiệp', quantity: 1, unit: 'dự án', unit_price: 50000000, discount_percent: 0, total: 50000000 },
        { id: '2', name: 'SEO Package - Basic', description: 'Tối ưu SEO cơ bản 6 tháng', quantity: 6, unit: 'tháng', unit_price: 10000000, discount_percent: 0, total: 60000000 },
        { id: '3', name: 'Social Media Management', description: 'Quản lý fanpage Facebook & Instagram', quantity: 6, unit: 'tháng', unit_price: 15000000, discount_percent: 0, total: 90000000 },
    ],
    subtotal: 200000000,
    discount_percent: 0,
    discount_amount: 0,
    vat_percent: 10,
    vat_amount: 20000000,
    total_amount: 220000000,
    valid_until: '2026-02-10',
    public_token: 'abc123xyz',
    view_count: 5,
    viewed_at: '2026-01-08T10:30:00',
    accepted_at: '2026-01-09T14:20:00',
    created_at: '2026-01-05T09:00:00',
    updated_at: '2026-01-09T14:20:00',
}

export default function QuotationDetailPage() {
    const quotation = mockQuotation
    const publicUrl = `/quote/${quotation.public_token}`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/quotations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{quotation.quote_number}</h1>
                            <Badge className={QUOTATION_STATUS_COLORS[quotation.status]}>
                                {QUOTATION_STATUS_LABELS[quotation.status]}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{quotation.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={publicUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Xem trang công khai
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép link
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Tải PDF
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/quotations/${quotation.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    {quotation.status === 'accepted' && (
                        <Button asChild>
                            <Link href={`/contracts/new?from_quote=${quotation.id}`}>
                                <FileSignature className="mr-2 h-4 w-4" />
                                Tạo hợp đồng
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Công ty</p>
                                    <Link href={`/customers/${quotation.customer.id}`} className="font-medium hover:underline">
                                        {quotation.customer.company_name}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{quotation.customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Điện thoại</p>
                                    <p className="font-medium">{quotation.customer.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Người tạo</p>
                                    <p className="font-medium">{quotation.creator.full_name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết báo giá</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Mô tả</TableHead>
                                        <TableHead className="text-center w-20">SL</TableHead>
                                        <TableHead className="text-right w-32">Đơn giá</TableHead>
                                        <TableHead className="text-right w-36 pr-6">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotation.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="pl-6">
                                                <p className="font-medium">{item.name}</p>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium pr-6">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Totals */}
                            <div className="border-t p-4 pr-6">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tạm tính</span>
                                            <span>{formatCurrency(quotation.subtotal)}</span>
                                        </div>
                                        {quotation.discount_amount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Chiết khấu ({quotation.discount_percent}%)</span>
                                                <span className="text-destructive">-{formatCurrency(quotation.discount_amount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">VAT ({quotation.vat_percent}%)</span>
                                            <span>{formatCurrency(quotation.vat_amount)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Tổng cộng</span>
                                            <span className="text-primary">{formatCurrency(quotation.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms & Notes */}
                    {(quotation.terms || quotation.notes) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Điều khoản & Ghi chú</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quotation.terms && (
                                    <div>
                                        <h4 className="font-medium mb-2">Điều khoản thanh toán</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{quotation.terms}</p>
                                    </div>
                                )}
                                {quotation.notes && (
                                    <div>
                                        <h4 className="font-medium mb-2">Ghi chú</h4>
                                        <p className="text-sm text-muted-foreground">{quotation.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Lịch sử
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quotation.accepted_at && (
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Đã chấp nhận</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(quotation.accepted_at)}</p>
                                    </div>
                                </div>
                            )}
                            {quotation.viewed_at && (
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Khách hàng đã xem</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(quotation.viewed_at)}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Tạo báo giá</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(quotation.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Thống kê
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lượt xem</span>
                                <span className="font-medium">{quotation.view_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Hiệu lực đến</span>
                                <span className="font-medium">{formatDate(quotation.valid_until)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">{formatDate(quotation.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
