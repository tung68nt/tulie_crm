import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Eye, Edit, FileSignature, Receipt, Wallet, FileCheck, Files } from 'lucide-react'
import Link from 'next/link'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { DocumentTemplate } from '@/types'

const getTypeIcon = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract':
            return <FileSignature className="h-4 w-4" />
        case 'invoice':
            return <Receipt className="h-4 w-4" />
        case 'payment_request':
            return <Wallet className="h-4 w-4" />
        case 'delivery_minutes':
            return <FileCheck className="h-4 w-4" />
        case 'order':
            return <Plus className="h-4 w-4" />
        default:
            return <FileText className="h-4 w-4" />
    }
}

const getTypeLabel = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract': return 'Hợp đồng'
        case 'invoice': return 'Hóa đơn'
        case 'payment_request': return 'Đề nghị TT'
        case 'quotation': return 'Báo giá'
        case 'order': return 'Đơn hàng'
        case 'delivery_minutes': return 'Biên bản giao nhận'
        default: return 'Khác'
    }
}

export default async function TemplatesPage() {
    const templates = await getDocumentTemplates()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Files className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Mẫu giấy tờ</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý các mẫu hợp đồng, đơn hàng, đề nghị thanh toán, biên bản giao nhận
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/templates/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mẫu mới
                    </Link>
                </Button>
            </div>

            {/* Templates List */}
            <div className="rounded-lg border">
                <div className="grid grid-cols-[1fr_120px_80px_140px] gap-4 px-4 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                    <span>Tên mẫu</span>
                    <span>Loại</span>
                    <span className="text-center">Số biến</span>
                    <span className="text-right">Thao tác</span>
                </div>
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="grid grid-cols-[1fr_120px_80px_140px] gap-4 items-center px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                {getTypeIcon(template.type)}
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/templates/${template.id}`}
                                    className="text-sm font-medium hover:underline truncate block"
                                >
                                    {template.name}
                                </Link>
                            </div>
                        </div>
                        <div>
                            <Badge variant="secondary" className="text-xs font-normal">
                                {getTypeLabel(template.type)}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-muted-foreground">{template.variables.length}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                <Link href={`/templates/${template.id}`}>
                                    <Eye className="mr-1 h-3 w-3" />
                                    Xem
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                <Link href={`/templates/${template.id}/edit`}>
                                    <Edit className="mr-1 h-3 w-3" />
                                    Sửa
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="rounded-lg border py-16 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-base font-semibold">Chưa có mẫu giấy tờ nào</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tạo mẫu đầu tiên để bắt đầu tự động hóa giấy tờ
                    </p>
                    <Button asChild>
                        <Link href="/templates/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo mẫu mới
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
