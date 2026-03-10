'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatRelativeTime } from '@/lib/utils/format'
import { ArrowUpDown, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { CellAction } from './cell-action'

export const customerColumns: ColumnDef<Customer>[] = [
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
        accessorKey: 'company_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    Công ty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const customer = row.original
            return (
                <div className="py-1">
                    <Link
                        href={`/customers/${customer.id}`}
                        className="text-sm font-bold text-zinc-950 hover:underline tracking-tight italic"
                    >
                        {customer.customer_type === 'individual'
                            ? (customer.representative || 'Chưa đặt tên')
                            : customer.company_name}
                    </Link>
                    {customer.customer_type === 'business' && customer.tax_code && (
                        <p className="text-xs text-muted-foreground mt-0.5">MST: {customer.tax_code}</p>
                    )}
                    {customer.customer_type === 'individual' && customer.address && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{customer.address}</p>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'email',
        header: 'Liên hệ',
        cell: ({ row }) => {
            const customer = row.original
            return (
                <div className="space-y-1">
                    {customer.email && (
                        <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                        </div>
                    )}
                    {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone}</span>
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return <StatusBadge entityType="customer" status={status} />
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'assigned_user',
        header: 'Phụ trách',
        cell: ({ row }) => {
            const user = row.original.assigned_user
            if (!user) return <span className="text-xs text-muted-foreground">Chưa gán</span>
            return (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border">
                        {user.full_name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{user.full_name}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'last_contact_at',
        header: 'Liên hệ lần cuối',
        cell: ({ row }) => {
            const date = row.getValue('last_contact_at') as string | undefined
            if (!date) return <span className="text-muted-foreground">Chưa có</span>
            return <span className="text-sm">{formatRelativeTime(date)}</span>
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
