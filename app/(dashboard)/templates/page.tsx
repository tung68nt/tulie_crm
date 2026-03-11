import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Eye, Edit, FileSignature, Receipt, Wallet, FileCheck, Files } from 'lucide-react'
import Link from 'next/link'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { DocumentTemplate } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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
        case 'quotation':
            return <FileText className="h-4 w-4" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Files className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Mẫu giấy tờ</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý các mẫu báo giá, hợp đồng, đơn hàng, đề nghị thanh toán, biên bản giao nhận
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
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Tên mẫu</TableHead>
                            <TableHead className="w-[150px]">Loại</TableHead>
                            <TableHead className="w-[100px] text-center">Số biến</TableHead>
                            <TableHead className="w-[140px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template) => (
                            <TableRow key={template.id} className="hover:bg-zinc-50/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-200/50">
                                            {getTypeIcon(template.type)}
                                        </div>
                                        <Link
                                            href={`/templates/${template.id}`}
                                            className="text-sm font-semibold text-zinc-900 hover:text-primary hover:underline"
                                        >
                                            {template.name}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80">
                                        {getTypeLabel(template.type)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm font-medium tabular-nums text-zinc-600">{template.variables.length}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                            <Link href={`/templates/${template.id}`} title="Xem">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                            <Link href={`/templates/${template.id}/edit`} title="Sửa">
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
