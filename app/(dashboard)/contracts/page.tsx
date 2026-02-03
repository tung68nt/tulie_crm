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
import { Plus, Eye, FileSignature, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { Button } from '@/components/ui/button'

export default async function ContractsPage() {
    const contracts = await getContracts()

    const activeContracts = contracts.filter((c) => c.status === 'active').length
    const completedContracts = contracts.filter((c) => c.status === 'completed').length
    const totalValue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)

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
                            {contracts.map((contract) => (
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
                                        {formatCurrency(contract.total_amount)}
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
