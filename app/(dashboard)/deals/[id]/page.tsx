import { getDealById } from '@/lib/supabase/services/deal-service'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from '@/lib/constants/status'
import { ArrowLeft, Edit, ExternalLink, Plus, FileText, TrendingUp, Users, Wallet, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DealDetailPage({ params }: any) {
    const { id } = await params
    const deal = await getDealById(id)

    if (!deal) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/deals">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{deal.title}</h1>
                            <Badge className={DEAL_STATUS_COLORS[deal.status as keyof typeof DEAL_STATUS_LABELS] || 'bg-gray-100'}>
                                {DEAL_STATUS_LABELS[deal.status as keyof typeof DEAL_STATUS_LABELS] || deal.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Khách hàng: <Link href={`/customers/${deal.customer?.id}`} className="hover:underline font-medium">{deal.customer?.company_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/deals/${deal.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/quotations/new?deal_id=${deal.id}&customer_id=${deal.customer_id}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo báo giá
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Deal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết cơ hội</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="p-4 bg-muted/20 rounded-xl border flex flex-col items-center justify-center text-center">
                                    <Wallet className="h-5 w-5 mb-2 text-green-600" />
                                    <p className="text-xs text-muted-foreground">Ngân sách dự kiến</p>
                                    <p className="text-lg font-bold">{formatCurrency(deal.budget || 0)}</p>
                                </div>
                                <div className="p-4 bg-muted/20 rounded-xl border flex flex-col items-center justify-center text-center">
                                    <TrendingUp className="h-5 w-5 mb-2 text-blue-600" />
                                    <p className="text-xs text-muted-foreground">Mức độ ưu tiên</p>
                                    <p className="text-lg font-bold ">{deal.priority}</p>
                                </div>
                                <div className="p-4 bg-muted/20 rounded-xl border flex flex-col items-center justify-center text-center">
                                    <Calendar className="h-5 w-5 mb-2 text-orange-600" />
                                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                                    <p className="text-lg font-bold">{formatDate(deal.created_at)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Mô tả / Yêu cầu khách hàng</h4>
                                <div className="text-sm p-4 bg-muted/30 rounded-lg whitespace-pre-line border border-dashed">
                                    {deal.description || "Chưa có mô tả chi tiết."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Associated Quotations */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Danh sách báo giá</CardTitle>
                                <CardDescription>Các báo giá đã gửi cho cơ hội này.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/quotations/new?deal_id=${deal.id}`}>
                                    <Plus className="h-4 w-4 mr-2" /> Thêm báo giá
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {deal.quotations && deal.quotations.length > 0 ? (
                                <div className="space-y-3">
                                    {deal.quotations.map((quote: any) => (
                                        <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <Link href={`/quotations/${quote.id}`} className="font-bold hover:underline">
                                                        {quote.quotation_number}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{quote.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-semibold">{formatCurrency(quote.total_amount)}</p>
                                                <Badge variant="outline">{quote.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-muted-foreground text-sm">Chưa có báo giá nào cho cơ hội này.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quản lý cơ hội</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground  font-bold ">Phụ trách (Sales)</p>
                                <p className="text-sm font-medium">{deal.assigned_user?.full_name || "Chưa gán"}</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground  font-bold ">Chuyển trạng thái</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="justify-start">
                                        <TrendingUp className="mr-2 h-4 w-4" /> Briefing
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start">
                                        <FileText className="mr-2 h-4 w-4" /> Lên báo giá
                                    </Button>
                                    <Button variant="secondary" size="sm" className="justify-start text-green-600 bg-green-50 hover:bg-green-100 border-green-200">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Chốt thành công
                                    </Button>
                                    <Button variant="secondary" size="sm" className="justify-start text-red-600 bg-red-50 hover:bg-red-100 border-red-200">
                                        <XCircle className="mr-2 h-4 w-4" /> Thất bại
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg opacity-90">Tiềm năng dự án</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{formatCurrency(deal.budget || 0)}</p>
                            <p className="text-xs opacity-70 mt-1 italic">Dựa trên ngân sách dự kiến của khách hàng.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
