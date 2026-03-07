'use client'

import { RetailOrder } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { retailOrderColumns } from './order-columns'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface RetailOrderListProps {
    initialData: RetailOrder[]
}

export function RetailOrderList({ initialData }: RetailOrderListProps) {
    const [search, setSearch] = useState('')

    const filteredData = initialData.filter((order) => {
        const searchLower = search.toLowerCase()
        return (
            order.order_number.toLowerCase().includes(searchLower) ||
            order.customer_name.toLowerCase().includes(searchLower) ||
            order.customer_phone?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background/95 backdrop-blur p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Tìm theo mã đơn, khách hàng, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 border-muted/20 focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground ">Tổng số:</p>
                    <span className="text-sm font-bold text-primary">{filteredData.length} đơn</span>
                </div>
            </div>

            <DataTable
                columns={retailOrderColumns}
                data={filteredData}
                searchKey="order_number"
            />
        </div>
    )
}
