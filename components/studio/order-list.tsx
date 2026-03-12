'use client'

import { RetailOrder } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { retailOrderColumns } from './order-columns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteRetailOrders, updateRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { Ban } from 'lucide-react'

interface RetailOrderListProps {
    initialData: RetailOrder[]
}

export function RetailOrderList({ initialData }: RetailOrderListProps) {
    const router = useRouter()

    const handleDelete = async (rows: RetailOrder[]) => {
        try {
            await deleteRetailOrders(rows.map((row) => row.id))
            toast.success(`Đã xóa ${rows.length} đơn hàng`)
            router.refresh()
        } catch (error) {
            toast.error(`Lỗi xóa đơn hàng: ${(error as any)?.message || 'Thử lại sau'}`)
        }
    }

    const handleBulkCancel = async (rows: RetailOrder[]) => {
        try {
            await Promise.all(
                rows.map((row) => updateRetailOrder(row.id, { order_status: 'cancelled' }))
            )
            toast.success(`Đã hủy ${rows.length} đơn hàng`)
            router.refresh()
        } catch (error) {
            toast.error(`Lỗi hủy đơn hàng: ${(error as any)?.message || 'Thử lại sau'}`)
        }
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={retailOrderColumns}
                data={initialData}
                searchKey="order_number"
                searchPlaceholder="Tìm theo mã đơn (Ví dụ: ORD-001)..."
                onDelete={handleDelete}
                bulkActions={[
                    {
                        label: 'Hủy đơn hàng',
                        icon: <Ban className="h-4 w-4" />,
                        onAction: handleBulkCancel,
                        variant: 'destructive',
                    },
                ]}
            />
        </div>
    )
}
