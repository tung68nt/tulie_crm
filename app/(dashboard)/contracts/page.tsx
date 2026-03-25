import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/format'
import { FileSignature, Clock, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { getContracts, deleteContracts } from '@/lib/supabase/services/contract-service'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { contractColumns } from '@/components/contracts/contract-columns'

export default async function ContractsPage() {
    // Filter by type 'contract'
    const contracts = await getContracts(undefined, 'contract', 'agency')

    const activeContracts = contracts.filter((c) => c.status === 'active').length
    const completedContracts = contracts.filter((c) => c.status === 'completed').length
    const totalValue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileSignature className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Hợp đồng</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý và theo dõi các hợp đồng dịch vụ
                        </p>
                    </div>
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
                        <div className="text-2xl font-semibold">{activeContracts}</div>
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
                        <div className="text-2xl font-semibold">{completedContracts}</div>
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
                        <div className="text-2xl font-semibold">{formatCurrency(totalValue)}</div>
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

            {/* Data Table */}
            <ContractTableInitialData data={contracts} />
        </div>
    )
}

async function ContractTableInitialData({ data }: { data: any[] }) {
    const handleDelete = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteContracts(ids)
    }

    return (
        <DataTable
            columns={contractColumns}
            data={data}
            searchKey="contract_number"
            searchPlaceholder="Tìm theo số hợp đồng..."
            onDelete={handleDelete}
        />
    )
}
