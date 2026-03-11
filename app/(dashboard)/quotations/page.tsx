import { DataTable } from '@/components/shared/data-table'
import { quotationColumns } from '@/components/quotations/quotation-columns'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { getQuotations, deleteQuotations } from '@/lib/supabase/services/quotation-service'

export default async function QuotationsPage() {
    const quotations = await getQuotations()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                        <FileText className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Báo giá</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý và theo dõi các báo giá gửi cho khách hàng
                        </p>
                    </div>
                </div>
                <Button asChild size="default" className="rounded-xl font-bold shadow-md shadow-zinc-200">
                    <Link href="/quotations/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo báo giá
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="sent">Đã gửi</SelectItem>
                        <SelectItem value="viewed">Đã xem</SelectItem>
                        <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                        <SelectItem value="expired">Hết hạn</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <QuotationTableInitialData data={quotations} />
        </div>
    )
}

async function QuotationTableInitialData({ data }: { data: any[] }) {
    const handleDelete = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteQuotations(ids)
    }

    return (
        <DataTable
            columns={quotationColumns}
            data={data}
            searchKey="quotation_number"
            searchPlaceholder="Tìm theo mã báo giá..."
            onDelete={handleDelete}
        />
    )
}
