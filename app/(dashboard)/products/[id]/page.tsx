import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils/format'
import {
    ArrowLeft,
    Edit,
    Package,
    TrendingUp,
    FileText,
    BarChart3
} from 'lucide-react'
import { getProductById } from '@/lib/supabase/services/product-service'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const product = await getProductById(id)
    return {
        title: product ? `${product.name} - Tulie CRM` : 'Sản phẩm - Tulie CRM',
    }
}

export default async function ProductDetailPage({ params }: any) {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
        notFound()
    }

    const margin = product.price > 0 ? ((product.price - (product.cost_price || 0)) / product.price) * 100 : 0

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
                            <h1 className="text-3xl font-semibold">{product.name}</h1>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Đang bán' : 'Ngừng bán'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
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
                                    <p className="font-medium">{product.category || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Đơn vị tính</p>
                                    <p className="font-medium">{product.unit || 'N/A'}</p>
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
                                    <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
                                    <p className="text-sm text-muted-foreground">/{product.unit}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted">
                                    <p className="text-sm text-muted-foreground">Giá vốn</p>
                                    <p className="text-2xl font-semibold">
                                        {product.cost_price ? formatCurrency(product.cost_price) : '-'}
                                    </p>
                                    {product.cost_price && <p className="text-sm text-muted-foreground">/{product.unit}</p>}
                                </div>
                                <div className="p-4 rounded-lg bg-green-500/10">
                                    <p className="text-sm text-muted-foreground">Biên lợi nhuận</p>
                                    <p className="text-2xl font-semibold text-green-500">{formatPercent(margin)}</p>
                                    <p className="text-sm text-muted-foreground">Margin</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Quotations Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Báo giá gần đây
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground text-center py-8 italic border rounded-lg">Chưa có thống kê báo giá cho sản phẩm này</p>
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
                                <p className="text-2xl font-semibold">{formatCurrency(0)}</p>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Số lượng đã bán</span>
                                <span className="font-medium">0 {product.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Margin trung bình</span>
                                <span className="font-medium text-green-500">0%</span>
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
                                <span>{formatDate(product.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cập nhật lần cuối</span>
                                <span>{formatDate(product.updated_at)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
