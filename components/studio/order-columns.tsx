'use client'

import { ColumnDef } from '@tanstack/react-table'
import { RetailOrder } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { MoreHorizontal, ExternalLink, QrCode, Phone, Mail, Link as LinkIcon, Camera, Copy } from 'lucide-react'
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
    shooting: 'Đang chụp',
    editing: 'Đang chỉnh sửa',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    pending: 'secondary',
    shooting: 'outline',
    editing: 'default',
    completed: 'default',
    cancelled: 'destructive',
}

const BRAND_LABELS: Record<string, string> = {
    agency: 'Agency',
    studio: 'Studio',
    academy: 'Academy',
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
                <div className="flex flex-col gap-0.5">
                    <Link
                        href={`/studio/${order.id}`}
                        className="font-medium text-sm text-primary hover:underline transition-all font-mono"
                    >
                        {order.order_number}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">STT: #{order.stt}</span>
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
                <Badge variant="secondary" className="text-[10px]">
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
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{order.customer_name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {order.customer_phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{order.customer_phone}</span>
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
        cell: ({ row }) => <span className="font-medium text-sm tabular-nums">{formatCurrency(row.original.total_amount)}</span>,
    },
    {
        accessorKey: 'payment_status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thanh toán" />
        ),
        cell: ({ row }) => {
            const status = row.original.payment_status
            const paid = row.original.paid_amount

            return (
                <div className="flex flex-col gap-0.5">
                    <Badge
                        variant={status === 'paid' ? 'default' : status === 'partial' ? 'secondary' : 'outline'}
                        className="text-[10px] w-fit"
                    >
                        {status === 'paid' ? 'Đã xong' : status === 'partial' ? 'Một phần' : 'Chưa cọc'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Đã thu: {formatCurrency(paid)}</span>
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
                <Badge variant={STATUS_VARIANTS[status] || 'secondary'}>
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
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Thao tác đơn hàng</DropdownMenuLabel>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            const portalUrl = `${window.location.origin}/portal/order/${order.id}`
                            navigator.clipboard.writeText(portalUrl)
                            toast.success('Đã copy link Portal gửi khách!')
                        }}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Portal Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/portal/order/${order.id}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" /> Xem Portal (Khách)
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
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
