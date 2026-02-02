import { Quotation } from '@/types'
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
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockQuotations: Quotation[] = [
    {
        id: '1',
        quote_number: 'QT-2026-0142',
        customer_id: '1',
        customer: {
            id: '1',
            company_name: 'ABC Corporation',
            status: 'customer',
            assigned_to: 'user-1',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-1',
        status: 'accepted',
        subtotal: 200000000,
        vat_percent: 10,
        vat_amount: 20000000,
        total_amount: 220000000,
        valid_until: '2026-02-10',
        public_token: 'abc123',
        view_count: 5,
        viewed_at: '2026-01-08',
        accepted_at: '2026-01-09',
        created_at: '2026-01-05',
        updated_at: '2026-01-09',
    },
    {
        id: '2',
        quote_number: 'QT-2026-0156',
        customer_id: '2',
        customer: {
            id: '2',
            company_name: 'XYZ Limited',
            status: 'lead',
            assigned_to: 'user-2',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-2',
        status: 'viewed',
        subtotal: 80000000,
        vat_percent: 10,
        vat_amount: 8000000,
        total_amount: 88000000,
        valid_until: '2026-02-15',
        public_token: 'def456',
        view_count: 3,
        viewed_at: '2026-01-10',
        created_at: '2026-01-08',
        updated_at: '2026-01-10',
    },
    {
        id: '3',
        quote_number: 'QT-2026-0165',
        customer_id: '3',
        customer: {
            id: '3',
            company_name: 'DEF Industries',
            status: 'vip',
            assigned_to: 'user-1',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-1',
        status: 'sent',
        subtotal: 150000000,
        vat_percent: 10,
        vat_amount: 15000000,
        total_amount: 165000000,
        valid_until: '2026-02-20',
        public_token: 'ghi789',
        view_count: 0,
        created_at: '2026-01-10',
        updated_at: '2026-01-10',
    },
    {
        id: '4',
        quote_number: 'QT-2026-0138',
        customer_id: '4',
        customer: {
            id: '4',
            company_name: 'GHI Company',
            status: 'prospect',
            assigned_to: 'user-2',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-2',
        status: 'rejected',
        subtotal: 50000000,
        vat_percent: 10,
        vat_amount: 5000000,
        total_amount: 55000000,
        valid_until: '2026-01-20',
        public_token: 'jkl012',
        view_count: 2,
        rejected_at: '2026-01-08',
        created_at: '2025-12-20',
        updated_at: '2026-01-08',
    },
    {
        id: '5',
        quote_number: 'QT-2026-0125',
        customer_id: '5',
        customer: {
            id: '5',
            company_name: 'JKL Partners',
            status: 'lead',
            assigned_to: 'user-1',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-1',
        status: 'expired',
        subtotal: 30000000,
        vat_percent: 10,
        vat_amount: 3000000,
        total_amount: 33000000,
        valid_until: '2025-12-30',
        public_token: 'mno345',
        view_count: 1,
        created_at: '2025-11-30',
        updated_at: '2025-12-30',
    },
]

export default function QuotationsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Báo giá</h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi các báo giá gửi cho khách hàng
                    </p>
                </div>
                <Button asChild>
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
            <DataTable
                columns={quotationColumns}
                data={mockQuotations}
                searchKey="quote_number"
                searchPlaceholder="Tìm theo mã báo giá..."
            />
        </div>
    )
}
