'use client'

import { RetailOrder } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { retailOrderColumns } from './order-columns'

interface RetailOrderListProps {
    initialData: RetailOrder[]
}

export function RetailOrderList({ initialData }: RetailOrderListProps) {
    return (
        <div className="space-y-4">
            <DataTable
                columns={retailOrderColumns}
                data={initialData}
                searchKey="order_number"
                searchPlaceholder="Tìm theo mã đơn (Ví dụ: ORD-001)..."
            />
        </div>
    )
}
