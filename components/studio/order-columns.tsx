'use client'

import { ColumnDef } from '@tanstack/react-table'
import { RetailOrder } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { MoreHorizontal, ExternalLink, QrCode, Phone, Mail, Link as LinkIcon, Camera, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { cancelRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    editing: 'Đang chỉnh sửa',
    edit_done: 'Xong chỉnh sửa',
    waiting_ship: 'Chờ giao hàng',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
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
                    <span className="text-[11px] text-muted-foreground">STT: #{order.stt}</span>
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
                <StatusBadge status={brand} entityType="brand" />
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
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
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
                <div className="flex flex-col items-center gap-0.5">
                    <StatusBadge status={status || 'unpaid'} entityType="retail_payment" />
                    <span className="text-[11px] text-muted-foreground">Đã thu: {formatCurrency(paid)}</span>
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
                <div className="flex justify-center">
                    <StatusBadge status={status} entityType="retail_order" />
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const order = row.original
            const router = useRouter()
            const [showCancelDialog, setShowCancelDialog] = useState(false)
            const [showDeleteDialog, setShowDeleteDialog] = useState(false)
            const [loading, setLoading] = useState(false)

            const onCancel = async () => {
                try {
                    setLoading(true)
                    await cancelRetailOrder(order.id)
                    toast.success('Hủy đơn hàng thành công')
                    router.refresh()
                } catch (error) {
                    toast.error(`Lỗi hủy đơn: ${(error as any)?.message || 'Thử lại sau'}`)
                } finally {
                    setLoading(false)
                    setShowCancelDialog(false)
                }
            }

            const onDelete = async () => {
                try {
                    setLoading(true)
                    const { deleteRetailOrders } = await import('@/lib/supabase/services/retail-order-service')
                    await deleteRetailOrders([order.id])
                    toast.success('Xóa đơn hàng thành công')
                    router.refresh()
                } catch (error) {
                    toast.error(`Lỗi xóa đơn: ${(error as any)?.message || 'Thử lại sau'}`)
                } finally {
                    setLoading(false)
                    setShowDeleteDialog(false)
                }
            }

            return (
                <>
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="font-bold tracking-tight">Xác nhận hủy đơn hàng?</DialogTitle>
                                <DialogDescription>
                                    Hành động này sẽ chuyển trạng thái đơn hàng <strong>{order.order_number}</strong> thành "Đã hủy".
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-3 mt-6">
                                <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="w-full sm:w-auto">Quay lại</Button>
                                <Button
                                    onClick={onCancel}
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="font-bold tracking-tight">Xóa đơn hàng vĩnh viễn?</DialogTitle>
                                <DialogDescription>
                                    Hành động này sẽ xóa đơn hàng <strong>{order.order_number}</strong> khỏi hệ thống và không thể khôi phục.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-3 mt-6">
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto">Quay lại</Button>
                                <Button
                                    onClick={onDelete}
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border/50">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Thao tác đơn hàng</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="rounded-lg">
                                <Link href={`/studio/${order.id}`}>
                                    <Camera className="mr-2 h-4 w-4" /> Chi tiết & Xử lý ảnh
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    const url = `https://qr.sepay.vn/img?acc=104002106705&bank=ICB&amount=${order.total_amount}&des=STUDIO ${order.order_number}`
                                    window.open(url, '_blank')
                                }}
                                className="rounded-lg"
                            >
                                <QrCode className="mr-2 h-4 w-4" /> QR Thanh toán
                            </DropdownMenuItem>
                            {order.resource_link && (
                                <DropdownMenuItem asChild className="rounded-lg">
                                    <a href={order.resource_link} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" /> Mở Drive ảnh gốc
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    const portalUrl = `${window.location.origin}/portal/order/${order.public_token}`
                                    navigator.clipboard.writeText(portalUrl)
                                    toast.success('Đã copy link Portal gửi khách!')
                                }}
                                className="rounded-lg"
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy Portal Link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-lg">
                                <Link href={`/portal/order/${order.public_token}`} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Xem Portal (Khách)
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive font-medium rounded-lg"
                                onClick={() => setShowCancelDialog(true)}
                                disabled={order.order_status === 'cancelled'}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hủy đơn hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive font-medium rounded-lg"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa đơn hàng
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )

        },
    },
]
