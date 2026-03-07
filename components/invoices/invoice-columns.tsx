'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Invoice } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS
} from '@/lib/constants/status'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { BRAND_LABELS, BRAND_COLORS, BRAND_BADGE_CLASS } from '@/lib/constants/brand'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { InvoiceCellAction } from './invoice-cell-action'

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Chọn tất cả"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn hàng"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'invoice_number',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Số hóa đơn" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue('invoice_number')}</span>
    },
    {
        accessorKey: 'brand',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => {
            const brand = row.original.brand || 'agency'
            return (
                <Badge
                    className={cn(
                        BRAND_BADGE_CLASS,
                        BRAND_COLORS[brand] || 'bg-gray-500'
                    )}
                >
                    {BRAND_LABELS[brand] || brand}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'customer_vendor',
        header: 'Đối tác',
        cell: ({ row }) => {
            const invoice = row.original
            const name = invoice.type === 'output'
                ? invoice.customer?.company_name
                : invoice.vendor?.name
            return <span>{name || '-'}</span>
        }
    },
    {
        accessorKey: 'issue_date',
        header: 'Ngày phát hành',
        cell: ({ row }) => formatDate(row.getValue('issue_date'))
    },
    {
        accessorKey: 'due_date',
        header: 'Hạn thanh toán',
        cell: ({ row }) => formatDate(row.getValue('due_date'))
    },
    {
        accessorKey: 'total_amount',
        header: 'Số tiền',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.getValue('total_amount'))}</span>
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as Invoice['status']
            return (
                <Badge className={INVOICE_STATUS_COLORS[status]}>
                    {INVOICE_STATUS_LABELS[status]}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <InvoiceCellAction data={row.original} />,
    },
]
