import { DataTable } from '@/components/shared/data-table'
import { customerColumns } from '@/components/customers/customer-columns'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Upload, Download } from 'lucide-react'
import Link from 'next/link'
import { getCustomers } from '@/lib/supabase/services/customer-service'

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Khách hàng</h1>
                    <p className="text-muted-foreground">
                        Quản lý danh sách khách hàng và thông tin liên hệ
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild>
                        <Link href="/customers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm khách hàng
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="lead">Tiềm năng</SelectItem>
                        <SelectItem value="prospect">Đang theo dõi</SelectItem>
                        <SelectItem value="customer">Khách hàng</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="churned">Đã rời bỏ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <DataTable
                columns={customerColumns}
                data={customers}
                searchKey="company_name"
                searchPlaceholder="Tìm theo tên công ty..."
            />
        </div>
    )
}
