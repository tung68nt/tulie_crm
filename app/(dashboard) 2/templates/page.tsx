import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Eye, Edit, Copy, FileSignature, Receipt, Wallet } from 'lucide-react'
import Link from 'next/link'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { DocumentTemplate } from '@/types'

const getTypeIcon = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract':
            return <FileSignature className="h-5 w-5" />
        case 'invoice':
            return <Receipt className="h-5 w-5" />
        case 'payment_request':
            return <Wallet className="h-5 w-5" />
        default:
            return <FileText className="h-5 w-5" />
    }
}

const getTypeBadge = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract':
            return <Badge className="bg-purple-500">Hợp đồng</Badge>
        case 'invoice':
            return <Badge className="bg-blue-500">Hóa đơn</Badge>
        case 'payment_request':
            return <Badge className="bg-green-500">Đề nghị TT</Badge>
        case 'quotation':
            return <Badge className="bg-orange-500">Báo giá</Badge>
        case 'order':
            return <Badge className="bg-cyan-500">Đơn hàng</Badge>
        default:
            return <Badge>Khác</Badge>
    }
}

export default async function TemplatesPage() {
    const templates = await getDocumentTemplates()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Mẫu giấy tờ
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý các mẫu hợp đồng, hóa đơn, đề nghị thanh toán với biến tự động
                    </p>
                </div>
                <Button asChild>
                    <Link href="/templates/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mẫu mới
                    </Link>
                </Button>
            </div>

            {/* Template Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <FileSignature className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hợp đồng</p>
                                <p className="text-2xl font-semibold">
                                    {templates.filter(t => t.type === 'contract').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <Receipt className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hóa đơn</p>
                                <p className="text-2xl font-semibold">
                                    {templates.filter(t => t.type === 'invoice').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Đề nghị TT</p>
                                <p className="text-2xl font-semibold">
                                    {templates.filter(t => t.type === 'payment_request').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng mẫu</p>
                                <p className="text-2xl font-semibold">{templates.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Templates Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        {getTypeIcon(template.type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription>
                                            {template.variables.length} biến
                                        </CardDescription>
                                    </div>
                                </div>
                                {getTypeBadge(template.type)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                    {template.variables.slice(0, 5).map((v) => (
                                        <Badge key={v} variant="outline" className="text-xs">
                                            {`{{${v}}}`}
                                        </Badge>
                                    ))}
                                    {template.variables.length > 5 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{template.variables.length - 5} biến khác
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/templates/${template.id}`}>
                                            <Eye className="mr-1 h-3 w-3" />
                                            Xem
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/templates/${template.id}/edit`}>
                                            <Edit className="mr-1 h-3 w-3" />
                                            Sửa
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {templates.length === 0 && (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Chưa có mẫu giấy tờ nào</h3>
                        <p className="text-muted-foreground mb-4">
                            Tạo mẫu đầu tiên để bắt đầu tự động hóa giấy tờ
                        </p>
                        <Button asChild>
                            <Link href="/templates/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tạo mẫu mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
