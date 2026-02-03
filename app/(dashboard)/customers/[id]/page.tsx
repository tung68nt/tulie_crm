import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format'
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    MapPin,
    Building2,
    FileText,
    MessageSquare,
    Plus,
    ExternalLink
} from 'lucide-react'
import { getCustomerById } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { notFound } from 'next/navigation'

interface CustomerPageProps {
    params: { id: string }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const customer = await getCustomerById(params.id)
    return {
        title: customer ? `${customer.company_name} - Tulie CRM` : 'Khách hàng - Tulie CRM',
    }
}

export default async function CustomerDetailPage({ params }: any) {
    const { id } = await params
    const customer = await getCustomerById(id)

    if (!customer) {
        notFound()
    }

    const [quotations, contracts] = await Promise.all([
        getQuotations(id),
        getContracts(id)
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="text-lg bg-foreground text-background">
                                {customer.company_name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">{customer.company_name}</h1>
                                <Badge className={CUSTOMER_STATUS_COLORS[customer.status] || 'bg-gray-100'}>
                                    {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">MST: {customer.tax_code || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/quotations/new?customer=${customer.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Tạo báo giá
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                            <TabsTrigger value="contacts">Liên hệ</TabsTrigger>
                            <TabsTrigger value="quotations">Báo giá ({quotations.length})</TabsTrigger>
                            <TabsTrigger value="contracts">Hợp đồng ({contracts.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Contact Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin liên hệ</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a href={`mailto:${customer.email}`} className="font-medium hover:underline">
                                                {customer.email || 'Chưa cập nhật'}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Điện thoại</p>
                                            <a href={`tel:${customer.phone}`} className="font-medium hover:underline">
                                                {customer.phone || 'Chưa cập nhật'}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:col-span-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                            <p className="font-medium">{customer.address || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    {customer.website && (
                                        <div className="flex items-center gap-3">
                                            <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Website</p>
                                                <a href={customer.website} target="_blank" className="font-medium hover:underline">
                                                    {customer.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ngành nghề</p>
                                            <p className="font-medium">{customer.industry || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contacts">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Danh sách liên hệ</CardTitle>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có thông tin liên hệ chi tiết</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="quotations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Báo giá</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {quotations.map((quote) => (
                                        <Link key={quote.id} href={`/quotations/${quote.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                                            <div>
                                                <p className="font-medium">{quote.quote_number}</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(quote.created_at)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(quote.total_amount)}</p>
                                                <Badge variant="secondary">{quote.status}</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                    {quotations.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">Chưa có báo giá nào</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contracts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hợp đồng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {contracts.map((contract) => (
                                        <Link key={contract.id} href={`/contracts/${contract.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                                            <div>
                                                <p className="font-medium">{contract.contract_number}</p>
                                                <p className="text-sm text-muted-foreground">Bắt đầu: {formatDate(contract.start_date)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(contract.total_amount)}</p>
                                                <Badge variant="secondary">{contract.status}</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                    {contracts.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">Chưa có hợp đồng nào</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng quan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Báo giá</span>
                                <span className="font-medium">{quotations.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Hợp đồng</span>
                                <span className="font-medium">{contracts.length}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">{formatDate(customer.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned User */}
                    {customer.assigned_user && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Phụ trách</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-foreground text-background">
                                            {customer.assigned_user.full_name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{customer.assigned_user.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{customer.assigned_user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
