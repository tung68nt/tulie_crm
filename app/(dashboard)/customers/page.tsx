import { Customer } from '@/types'
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

// Mock data - replace with actual API call
const mockCustomers: Customer[] = [
    {
        id: '1',
        company_name: 'ABC Corporation',
        tax_code: '0123456789',
        email: 'contact@abc.com',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
        status: 'customer',
        assigned_to: 'user-1',
        assigned_user: {
            id: 'user-1',
            email: 'sarah@tulie.agency',
            full_name: 'Sarah Nguyen',
            role: 'staff',
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        created_by: 'admin',
        created_at: '2024-01-15',
        updated_at: '2024-01-20',
    },
    {
        id: '2',
        company_name: 'XYZ Limited',
        tax_code: '9876543210',
        email: 'info@xyz.vn',
        phone: '0912345678',
        address: '456 Lê Lợi, Q1, TP.HCM',
        status: 'lead',
        assigned_to: 'user-2',
        assigned_user: {
            id: 'user-2',
            email: 'mike@tulie.agency',
            full_name: 'Mike Tran',
            role: 'staff',
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        created_by: 'admin',
        created_at: '2024-02-01',
        updated_at: '2024-02-05',
    },
    {
        id: '3',
        company_name: 'DEF Industries',
        email: 'sales@def.com',
        phone: '0923456789',
        status: 'vip',
        assigned_to: 'user-1',
        assigned_user: {
            id: 'user-1',
            email: 'sarah@tulie.agency',
            full_name: 'Sarah Nguyen',
            role: 'staff',
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        created_by: 'admin',
        created_at: '2023-06-15',
        updated_at: '2024-01-10',
    },
    {
        id: '4',
        company_name: 'GHI Company',
        tax_code: '1122334455',
        email: 'hello@ghi.vn',
        phone: '0934567890',
        address: '789 Điện Biên Phủ, Q3, TP.HCM',
        status: 'prospect',
        assigned_to: 'user-2',
        assigned_user: {
            id: 'user-2',
            email: 'mike@tulie.agency',
            full_name: 'Mike Tran',
            role: 'staff',
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'admin',
        created_at: '2024-02-10',
        updated_at: '2024-02-10',
    },
    {
        id: '5',
        company_name: 'JKL Partners',
        email: 'team@jkl.com',
        status: 'churned',
        assigned_to: 'user-1',
        assigned_user: {
            id: 'user-1',
            email: 'sarah@tulie.agency',
            full_name: 'Sarah Nguyen',
            role: 'staff',
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        last_contact_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
        created_by: 'admin',
        created_at: '2023-03-01',
        updated_at: '2023-12-15',
    },
]

export default function CustomersPage() {
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
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Nhân viên phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả nhân viên</SelectItem>
                        <SelectItem value="user-1">Sarah Nguyen</SelectItem>
                        <SelectItem value="user-2">Mike Tran</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <DataTable
                columns={customerColumns}
                data={mockCustomers}
                searchKey="company_name"
                searchPlaceholder="Tìm theo tên công ty..."
            />
        </div>
    )
}
