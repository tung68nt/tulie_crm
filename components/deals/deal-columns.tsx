'use client'

import { Deal } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from '@/lib/constants/status'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import Link from 'next/link'
import { MoreHorizontal, ExternalLink, TrendingUp } from 'lucide-react'
import { BRAND_LABELS, BRAND_COLORS, BRAND_BADGE_CLASS } from '@/lib/constants/brand'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

export const dealColumns: ColumnDef<Deal>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Cơ hội" />
        ),
        cell: ({ row }) => {
            const deal = row.original
            return (
                <div className="flex flex-col">
                    <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium hover:underline text-primary"
                    >
                        {deal.title}
                    </Link>
                    <span className="text-xs text-muted-foreground italic">
                        {deal.customer?.company_name}
                    </span>
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
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Giai đoạn" />
        ),
        cell: ({ row }) => {
            const status = row.getValue('status') as keyof typeof DEAL_STATUS_LABELS
            return (
                <Badge className={DEAL_STATUS_COLORS[status] || 'bg-gray-100'}>
                    {DEAL_STATUS_LABELS[status] || status}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'budget',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Giá trị dự kiến" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('budget'))
            return <div className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: 'priority',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mức độ" />
        ),
        cell: ({ row }) => {
            const priority = row.getValue('priority') as string
            const colors: any = {
                high: 'text-zinc-100 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 font-bold border-zinc-900',
                medium: 'text-zinc-700 bg-zinc-100 border-zinc-200',
                low: 'text-zinc-500 bg-zinc-50 border-zinc-200',
            }
            return (
                <Badge variant="outline" className={colors[priority] || ''}>
                    {priority === 'high' ? '🔥 Cao' : priority === 'medium' ? '⚡ Trung bình' : '🧊 Thấp'}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'assigned_user.full_name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Sales phụ trách" />
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const deal = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/deals/${deal.id}`}>Chi tiết</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/quotations/new?deal_id=${deal.id}&customer_id=${deal.customer_id}`}>Tạo báo giá</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Hủy cơ hội</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
