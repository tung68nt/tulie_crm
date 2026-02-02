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
    FileSignature,
    Receipt,
    MessageSquare,
    Plus,
    ExternalLink
} from 'lucide-react'

// Mock data
const mockCustomer = {
    id: '1',
    company_name: 'ABC Corporation',
    tax_code: '0123456789',
    email: 'contact@abc.com',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    invoice_address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    industry: 'Công nghệ',
    company_size: '51-200',
    website: 'https://abc-corp.vn',
    status: 'customer' as const,
    assigned_user: { full_name: 'Sarah Nguyen', email: 'sarah@tulie.agency' },
    last_contact_at: '2026-01-08T14:30:00',
    created_at: '2024-01-15T09:00:00',
    contacts: [
        { id: '1', name: 'Nguyễn Văn A', position: 'Giám đốc', email: 'a@abc.com', phone: '0901111111', is_primary: true },
        { id: '2', name: 'Trần Thị B', position: 'Trưởng phòng Marketing', email: 'b@abc.com', phone: '0902222222', is_primary: false },
    ],
    quotations: [
        { id: '1', quote_number: 'QT-2026-0142', total_amount: 220000000, status: 'accepted', created_at: '2026-01-05' },
        { id: '2', quote_number: 'QT-2025-0089', total_amount: 85000000, status: 'converted', created_at: '2025-06-15' },
    ],
    contracts: [
        { id: '1', contract_number: 'HD-2026-0089', total_value: 220000000, status: 'active', start_date: '2026-01-10' },
        { id: '2', contract_number: 'HD-2025-0056', total_value: 85000000, status: 'completed', start_date: '2025-06-20' },
    ],
    notes: [
        { id: '1', content: 'Khách hàng quan tâm đến gói SEO nâng cao', type: 'note', created_at: '2026-01-08T14:30:00', user: 'Sarah Nguyen' },
        { id: '2', content: 'Gọi điện trao đổi về tiến độ dự án website', type: 'call', created_at: '2026-01-05T10:00:00', user: 'Sarah Nguyen' },
        { id: '3', content: 'Gửi email báo giá mới', type: 'email', created_at: '2026-01-05T09:30:00', user: 'Sarah Nguyen' },
    ],
    total_revenue: 305000000,
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `${mockCustomer.company_name} - Tulie CRM`,
    }
}

export default function CustomerDetailPage() {
    const customer = mockCustomer

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
                                <Badge className={CUSTOMER_STATUS_COLORS[customer.status]}>
                                    {CUSTOMER_STATUS_LABELS[customer.status]}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">MST: {customer.tax_code}</p>
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
                            <TabsTrigger value="contacts">Liên hệ ({customer.contacts.length})</TabsTrigger>
                            <TabsTrigger value="quotations">Báo giá ({customer.quotations.length})</TabsTrigger>
                            <TabsTrigger value="contracts">Hợp đồng ({customer.contracts.length})</TabsTrigger>
                            <TabsTrigger value="notes">Ghi chú ({customer.notes.length})</TabsTrigger>
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
                                                {customer.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Điện thoại</p>
                                            <a href={`tel:${customer.phone}`} className="font-medium hover:underline">
                                                {customer.phone}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:col-span-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                            <p className="font-medium">{customer.address}</p>
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
                                            <p className="text-sm text-muted-foreground">Ngành nghề / Quy mô</p>
                                            <p className="font-medium">{customer.industry} • {customer.company_size} nhân viên</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Hoạt động gần đây</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer.notes.slice(0, 3).map((note) => (
                                        <div key={note.id} className="flex gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${note.type === 'call' ? 'bg-green-500/10 text-green-500' :
                                                    note.type === 'email' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {note.type === 'call' ? <Phone className="h-4 w-4" /> :
                                                    note.type === 'email' ? <Mail className="h-4 w-4" /> :
                                                        <MessageSquare className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{note.content}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {note.user} • {formatRelativeTime(note.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
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
                                    {customer.contacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{contact.name}</p>
                                                        {contact.is_primary && <Badge variant="secondary">Chính</Badge>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{contact.position}</p>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p>{contact.email}</p>
                                                <p className="text-muted-foreground">{contact.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="quotations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Báo giá</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {customer.quotations.map((quote) => (
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contracts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hợp đồng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {customer.contracts.map((contract) => (
                                        <Link key={contract.id} href={`/contracts/${contract.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                                            <div>
                                                <p className="font-medium">{contract.contract_number}</p>
                                                <p className="text-sm text-muted-foreground">Bắt đầu: {formatDate(contract.start_date)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(contract.total_value)}</p>
                                                <Badge variant="secondary">{contract.status}</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Ghi chú</CardTitle>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm ghi chú
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customer.notes.map((note) => (
                                        <div key={note.id} className="p-4 rounded-lg border">
                                            <p className="text-sm">{note.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {note.user} • {formatRelativeTime(note.created_at)}
                                            </p>
                                        </div>
                                    ))}
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
                                <span className="text-muted-foreground">Tổng doanh thu</span>
                                <span className="font-bold text-lg">{formatCurrency(customer.total_revenue)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Báo giá</span>
                                <span className="font-medium">{customer.quotations.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Hợp đồng</span>
                                <span className="font-medium">{customer.contracts.length}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Liên hệ gần nhất</span>
                                <span className="font-medium">{formatRelativeTime(customer.last_contact_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">{formatDate(customer.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned User */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Phụ trách</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-foreground text-background">
                                        {customer.assigned_user.full_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{customer.assigned_user.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{customer.assigned_user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
