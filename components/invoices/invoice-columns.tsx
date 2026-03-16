'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Invoice } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import {
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS
} from '@/lib/constants/status'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
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
                <StatusBadge status={brand} entityType="brand" />
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
                <StatusBadge status={status} entityType="invoice" />
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <InvoiceCellAction data={row.original} />,
    },
]
