import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/format'
import { ShoppingCart, Clock, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { getContracts, deleteContracts } from '@/lib/supabase/services/contract-service'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { contractColumns } from '@/components/contracts/contract-columns'

export default async function OrdersPage() {
    // Filter by type 'order'
    const orders = await getContracts(undefined, 'order', 'agency')

    const activeOrders = orders.filter((c) => c.status === 'active').length
    const completedOrders = orders.filter((c) => c.status === 'completed').length
    const totalValue = orders.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Đơn hàng</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý và theo dõi các đơn hàng dịch vụ
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/contracts/new?type=order">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo đơn hàng
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
                        <div className="text-2xl font-semibold">{activeOrders}</div>
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
                        <div className="text-2xl font-semibold">{completedOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng giá trị
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
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
            <OrderTableInitialData data={orders} />
        </div>
    )
}

async function OrderTableInitialData({ data }: { data: any[] }) {
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
            searchPlaceholder="Tìm theo số đơn hàng..."
            onDelete={handleDelete}
        />
    )
}
