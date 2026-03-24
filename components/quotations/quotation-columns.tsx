'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Quotation } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS
} from '@/lib/constants/status'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { QuotationCellAction } from './quotation-cell-action'

export const quotationColumns: ColumnDef<Quotation>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'quotation_number',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    Mã báo giá
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const quotation = row.original
            return (
                <div>
                    <Link
                        href={`/quotations/${quotation.id}`}
                        className="font-bold text-zinc-950 hover:underline tracking-tight italic"
                    >
                        {quotation.quotation_number}
                    </Link>
                    {quotation.title && (
                        <p className="text-xs text-zinc-600 font-medium truncate max-w-[200px]">
                            {quotation.title}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {formatDate(quotation.created_at)}
                    </p>
                </div>
            )
        },
    },
    {
        accessorKey: 'brand',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => {
            const brand = row.original.brand || 'agency'
            return <StatusBadge entityType="brand" status={brand} />
        },
    },
    {
        accessorKey: 'customer',
        header: 'Khách hàng',
        cell: ({ row }) => {
            const customer = row.original.customer
            if (!customer) return <span className="text-muted-foreground">-</span>
            return (
                <Link
                    href={`/customers/${customer.id}`}
                    className="hover:underline"
                >
                    {customer.company_name}
                </Link>
            )
        },
    },
    {
        accessorKey: 'total_amount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Giá trị
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = row.getValue('total_amount') as number
            return <span className="font-medium">{formatCurrency(amount)}</span>
        },
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as Quotation['status']
            return <StatusBadge entityType="quotation" status={status} />
        },
    },
    {
        accessorKey: 'view_count',
        header: 'Lượt xem',
        cell: ({ row }) => {
            const count = (row.getValue('view_count') as number) || 0
            const viewedAt = row.original.viewed_at
            return (
                <div>
                    <span className="font-medium">{count}</span>
                    {viewedAt && count > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(viewedAt)}
                        </p>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'valid_until',
        header: 'Hiệu lực',
        cell: ({ row }) => {
            const date = row.getValue('valid_until') as string
            const isExpired = new Date(date) < new Date()
            return (
                <span className={isExpired ? 'text-destructive' : ''}>
                    {formatDate(date)}
                </span>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <QuotationCellAction data={row.original} />,
    },
]
