'use client'

import { ColumnDef } from '@tanstack/react-table'
import { RetailOrder } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { MoreHorizontal, ExternalLink, QrCode, Phone, Mail, Link as LinkIcon, Camera, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    shooting: '📏 Đang chụp',
    editing: '✨ Đang chỉnh sửa',
    completed: '✅ Đã hoàn thành',
    cancelled: '❌ Đã hủy',
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-zinc-100 text-zinc-500',
    shooting: 'bg-zinc-100 text-zinc-800 font-medium border border-zinc-200',
    editing: 'bg-zinc-800 text-zinc-100',
    completed: 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950',
    cancelled: 'bg-zinc-100 text-zinc-300 border-zinc-100',
}

const BRAND_LABELS: Record<string, string> = {
    agency: 'Agency',
    studio: 'Studio',
    academy: 'Academy',
}

const BRAND_COLORS: Record<string, string> = {
    agency: 'bg-zinc-200 text-zinc-800',
    studio: 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold',
    academy: 'bg-zinc-500 text-white',
}

export const retailOrderColumns: ColumnDef<RetailOrder>[] = [
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
        accessorKey: 'order_number',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã đơn hàng" />
        ),
        cell: ({ row }) => {
            const order = row.original
            return (
                <div className="flex flex-col gap-1">
                    <Link
                        href={`/studio/${order.id}`}
                        className="font-bold text-sm text-primary hover:underline hover:text-primary/80 transition-all font-mono"
                    >
                        {order.order_number}
                    </Link>
                    <span className="text-[10px] text-muted-foreground  font-bold">STT: #{order.stt}</span>
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
            const brand = row.original.brand || 'studio'
            return (
                <Badge
                    className={cn(
                        "text-[9px] px-1.5 py-0 h-4 font-bold   border-none rounded-sm",
                        BRAND_COLORS[brand] || 'bg-gray-500 text-white'
                    )}
                >
                    {BRAND_LABELS[brand] || brand}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'customer_name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Khách hàng" />
        ),
        cell: ({ row }) => {
            const order = row.original
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm ">{order.customer_name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {order.customer_phone && (
                            <div className="flex items-center gap-1 group/phone">
                                <Phone className="h-3 w-3" />
                                <span className="group-hover/phone:text-primary transition-colors">{order.customer_phone}</span>
                            </div>
                        )}
                        {order.customer_email && (
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{order.customer_email}</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'total_amount',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Giá trị đơn" />
        ),
        cell: ({ row }) => <span className="font-bold text-sm tabular-nums">{formatCurrency(row.original.total_amount)}</span>,
    },
    {
        accessorKey: 'payment_status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thanh toán" />
        ),
        cell: ({ row }) => {
            const status = row.original.payment_status
            const paid = row.original.paid_amount
            const total = row.original.total_amount

            return (
                <div className="flex flex-col gap-1">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-[10px] px-2 py-0 h-5 font-bold  ",
                            status === 'paid' ? "bg-zinc-900 text-zinc-100" : status === 'partial' ? "bg-zinc-500 text-zinc-100" : "bg-zinc-100 text-zinc-500"
                        )}
                    >
                        {status === 'paid' ? 'Đã xong' : status === 'partial' ? 'Một phần' : 'Chưa cọc'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">Đã thu: {formatCurrency(paid)}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'order_status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái đơn" />
        ),
        cell: ({ row }) => {
            const status = row.original.order_status
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px] px-2 py-0 h-5 font-bold  ",
                        STATUS_COLORS[status] || 'bg-gray-100'
                    )}
                >
                    {STATUS_LABELS[status] || status}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-xs  font-bold text-muted-foreground">Thao tác đơn hàng</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/studio/${order.id}`}>
                                <Camera className="mr-2 h-4 w-4" /> Chi tiết & Xử lý ảnh
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const url = `https://qr.sepay.vn/img?acc=104002106705&bank=ICB&amount=${order.total_amount}&des=STUDIO ${order.order_number}`
                            window.open(url, '_blank')
                        }}>
                            <QrCode className="mr-2 h-4 w-4" /> QR Thanh toán
                        </DropdownMenuItem>
                        {order.resource_link && (
                            <DropdownMenuItem asChild>
                                <a href={order.resource_link} target="_blank" rel="noopener noreferrer">
                                    <LinkIcon className="mr-2 h-4 w-4" /> Mở Drive ảnh gốc
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                            const portalUrl = `${window.location.origin}/order/${order.public_token}`
                            navigator.clipboard.writeText(portalUrl)
                            toast.success('Đã copy link Portal gửi khách!')
                        }}>
                            <LinkIcon className="mr-2 h-4 w-4" /> Copy Portal Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/order/${order.public_token}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" /> Xem Portal (Khách)
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 font-bold"
                            onClick={() => toast.info('Tính năng xóa đang chờ phân quyền')}
                        >
                            Hủy đơn hàng
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
