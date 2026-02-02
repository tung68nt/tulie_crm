import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import {
    ArrowLeft,
    Edit,
    Package,
    TrendingUp,
    FileText,
    BarChart3
} from 'lucide-react'

// Mock data
const mockProduct = {
    id: '1',
    name: 'Website Development',
    sku: 'WEB-DEV-001',
    category: 'Web Development',
    description: 'Thiết kế và phát triển website doanh nghiệp theo yêu cầu. Bao gồm thiết kế UI/UX, phát triển frontend & backend, tích hợp CMS, và optimization SEO cơ bản.',
    unit: 'dự án',
    unit_price: 50000000,
    cost_price: 30000000,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-06-15',
    stats: {
        total_sold: 15,
        total_revenue: 750000000,
        avg_margin: 40,
    },
    recent_quotations: [
        { id: '1', quote_number: 'QT-2026-0142', customer: 'ABC Corporation', status: 'accepted', date: '2026-01-05' },
        { id: '2', quote_number: 'QT-2025-0256', customer: 'XYZ Limited', status: 'converted', date: '2025-11-20' },
        { id: '3', quote_number: 'QT-2025-0189', customer: 'DEF Industries', status: 'rejected', date: '2025-09-08' },
    ],
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `${mockProduct.name} - Tulie CRM`,
    }
}

export default function ProductDetailPage() {
    const product = mockProduct
    const margin = ((product.unit_price - (product.cost_price || 0)) / product.unit_price) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/products">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Đang bán' : 'Ngừng bán'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/products/${product.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Thông tin sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Danh mục</p>
                                    <p className="font-medium">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Đơn vị tính</p>
                                    <p className="font-medium">{product.unit}</p>
                                </div>
                            </div>
                            {product.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Mô tả</p>
                                    <p className="mt-1">{product.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Giá & Chi phí</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Giá bán</p>
                                    <p className="text-2xl font-bold">{formatCurrency(product.unit_price)}</p>
                                    <p className="text-sm text-muted-foreground">/{product.unit}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Giá vốn</p>
                                    <p className="text-2xl font-bold">
                                        {product.cost_price ? formatCurrency(product.cost_price) : '-'}
                                    </p>
                                    {product.cost_price && <p className="text-sm text-muted-foreground">/{product.unit}</p>}
                                </div>
                                <div className="p-4 rounded-lg bg-green-500/10">
                                    <p className="text-sm text-muted-foreground">Biên lợi nhuận</p>
                                    <p className="text-2xl font-bold text-green-500">{formatPercent(margin)}</p>
                                    <p className="text-sm text-muted-foreground">Margin</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Quotations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Báo giá gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {product.recent_quotations.map((quote) => (
                                <Link
                                    key={quote.id}
                                    href={`/quotations/${quote.id}`}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{quote.quote_number}</p>
                                        <p className="text-sm text-muted-foreground">{quote.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary">{quote.status}</Badge>
                                        <p className="text-sm text-muted-foreground mt-1">{quote.date}</p>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Thống kê
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                                <p className="text-2xl font-bold">{formatCurrency(product.stats.total_revenue)}</p>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Số lượng đã bán</span>
                                <span className="font-medium">{product.stats.total_sold} {product.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Margin trung bình</span>
                                <span className="font-medium text-green-500">{product.stats.avg_margin}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin khác</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span>{product.created_at}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cập nhật lần cuối</span>
                                <span>{product.updated_at}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
