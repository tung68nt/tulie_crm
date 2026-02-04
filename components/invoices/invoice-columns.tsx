'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Invoice } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS
} from '@/lib/constants/status'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { InvoiceCellAction } from './invoice-cell-action'

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'invoice_number',
        header: 'Số hóa đơn',
        cell: ({ row }) => <span className="font-medium">{row.getValue('invoice_number')}</span>
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
