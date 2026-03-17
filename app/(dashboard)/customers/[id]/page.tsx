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
    ExternalLink,
    Users,
    User,
    Briefcase,
    Receipt
} from 'lucide-react'
import { getCustomerById } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { getContactsByCustomerId } from '@/lib/supabase/services/contact-service'
import { ContactList } from '@/components/customers/contact-list'
import { UnlockPortalButton } from '@/components/customers/unlock-portal-button'
import { notFound } from 'next/navigation'

interface CustomerPageProps {
    params: { id: string }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const customer = await getCustomerById(id)
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

    const [quotations, contracts, contacts] = await Promise.all([
        getQuotations(id),
        getContracts(id),
        getContactsByCustomerId(id)
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 shrink-0 mt-1">
                        <Link href="/customers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold leading-tight">{customer.company_name}</h1>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            <Badge className={`text-xs ${CUSTOMER_STATUS_COLORS[customer.status] || 'bg-zinc-100 text-zinc-600'}`}>
                                {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {customer.customer_type === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {customer.customer_type === 'individual' ? 'CCCD' : 'MST'}: {customer.tax_code || 'Chưa cập nhật'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-11 sm:ml-0">
                    <UnlockPortalButton customerId={customer.id} isUnlocked={customer.is_info_unlocked} />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/quotations/new?customer=${customer.id}`}>
                            <FileText className="mr-1.5 h-4 w-4" />
                            Tạo báo giá
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/customers/${customer.id}/edit`}>
                            <Edit className="mr-1.5 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                {/* Contact Info */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 sm:col-span-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Mã số thuế</p>
                                <p className="font-medium">{customer.tax_code || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Người đại diện</p>
                                <p className="font-medium">{customer.representative || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Chức vụ</p>
                                <p className="font-medium">{customer.position || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
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
                                <p className="text-sm text-muted-foreground">Địa chỉ trụ sở</p>
                                <p className="font-medium">{customer.address || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        {customer.invoice_address && customer.invoice_address !== customer.address && (
                            <div className="flex items-center gap-3 sm:col-span-2">
                                <Receipt className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Địa chỉ xuất hóa đơn</p>
                                    <p className="font-medium">{customer.invoice_address}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Summary Box */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Tổng quan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold">{quotations.length}</p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">Báo giá</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold">{contracts.length}</p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">Hợp đồng</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">{formatDate(customer.created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Phụ trách</span>
                                <span className="font-medium">{customer.assigned_user?.full_name || 'Hệ thống'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="contacts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="contacts">Liên hệ ({contacts.length})</TabsTrigger>
                    <TabsTrigger value="quotations">Báo giá ({quotations.length})</TabsTrigger>
                    <TabsTrigger value="contracts">Hợp đồng ({contracts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="contacts">
                    <ContactList customerId={customer.id} initialContacts={contacts} />
                </TabsContent>
                <TabsContent value="quotations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Báo giá</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quotations.map((quote) => (
                                <Link key={quote.id} href={`/quotations/${quote.id}?from=/customers/${id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                                    <div>
                                        <p className="font-medium">{quote.quotation_number}</p>
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
                                <Link key={contract.id} href={`/contracts/${contract.id}?from=/customers/${id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
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
    )
}
