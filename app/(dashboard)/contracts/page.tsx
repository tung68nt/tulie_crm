import { Contract } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '@/lib/constants/status'
import { Plus, Eye, MoreHorizontal, FileSignature, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Mock data
const mockContracts: Contract[] = [
    {
        id: '1',
        contract_number: 'HD-2026-0089',
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
        title: 'Hợp đồng phát triển website',
        status: 'active',
        total_value: 220000000,
        start_date: '2026-01-10',
        end_date: '2026-04-10',
        signed_date: '2026-01-09',
        created_at: '2026-01-09',
        updated_at: '2026-01-09',
    },
    {
        id: '2',
        contract_number: 'HD-2026-0078',
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
        title: 'Hợp đồng SEO 12 tháng',
        status: 'active',
        total_value: 120000000,
        start_date: '2025-07-01',
        end_date: '2026-01-17',
        signed_date: '2025-06-28',
        created_at: '2025-06-28',
        updated_at: '2025-06-28',
    },
    {
        id: '3',
        contract_number: 'HD-2025-0156',
        customer_id: '2',
        customer: {
            id: '2',
            company_name: 'XYZ Limited',
            status: 'customer',
            assigned_to: 'user-2',
            created_by: 'admin',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        },
        created_by: 'user-2',
        title: 'Thiết kế bộ nhận diện thương hiệu',
        status: 'completed',
        total_value: 45000000,
        start_date: '2025-10-01',
        end_date: '2025-12-31',
        signed_date: '2025-09-28',
        created_at: '2025-09-28',
        updated_at: '2025-12-31',
    },
]

export default function ContractsPage() {
    const activeContracts = mockContracts.filter((c) => c.status === 'active').length
    const completedContracts = mockContracts.filter((c) => c.status === 'completed').length
    const totalValue = mockContracts.reduce((sum, c) => sum + c.total_value, 0)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Hợp đồng</h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi các hợp đồng với khách hàng
                    </p>
                </div>
                <Button asChild>
                    <Link href="/contracts/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo hợp đồng
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đang thực hiện
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeContracts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đã hoàn thành
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedContracts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng giá trị
                        </CardTitle>
                        <FileSignature className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                    </CardContent>
                </Card>
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
                        <SelectItem value="active">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Contracts Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã hợp đồng</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Tiêu đề</TableHead>
                                <TableHead>Giá trị</TableHead>
                                <TableHead>Thời hạn</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockContracts.map((contract) => (
                                <TableRow key={contract.id}>
                                    <TableCell>
                                        <Link href={`/contracts/${contract.id}`} className="font-medium hover:underline">
                                            {contract.contract_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{contract.customer?.company_name}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {contract.title}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(contract.total_value)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{formatDate(contract.start_date)}</div>
                                            <div className="text-muted-foreground">
                                                → {contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={CONTRACT_STATUS_COLORS[contract.status]}>
                                            {CONTRACT_STATUS_LABELS[contract.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/contracts/${contract.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
