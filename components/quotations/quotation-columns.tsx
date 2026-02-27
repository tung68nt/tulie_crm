'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Quotation } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS
} from '@/lib/constants/status'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { QuotationCellAction } from './quotation-cell-action'

export const quotationColumns: ColumnDef<Quotation>[] = [
    {
        accessorKey: 'quote_number',
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
                        className="font-medium hover:underline"
                    >
                        {quotation.quotation_number}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(quotation.created_at)}
                    </p>
                </div>
            )
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
            return (
                <Badge className={QUOTATION_STATUS_COLORS[status]}>
                    {QUOTATION_STATUS_LABELS[status]}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'view_count',
        header: 'Lượt xem',
        cell: ({ row }) => {
            const count = row.getValue('view_count') as number
            const viewedAt = row.original.viewed_at
            return (
                <div>
                    <span className="font-medium">{count}</span>
                    {viewedAt && (
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
