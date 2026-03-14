'use client'

import { RetailOrder, RetailOrderStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    MoreVertical,
    Copy,
    ExternalLink,
    Pencil,
    Trash2,
    Calendar,
    Loader2,
    Circle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateRetailOrder } from '@/lib/supabase/services/retail-order-service'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OrderDetailHeaderProps {
    order: RetailOrder
}

export const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    editing: 'Đang chỉnh sửa',
    edit_done: 'Hoàn thành chỉnh sửa',
    waiting_ship: 'Chờ giao hàng',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
}

export const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-zinc-50 text-zinc-500 border-zinc-200',
    editing: 'bg-blue-50 text-blue-600 border-blue-200',
    edit_done: 'bg-violet-50 text-violet-600 border-violet-200',
    waiting_ship: 'bg-amber-50 text-amber-600 border-amber-200',
    shipping: 'bg-orange-50 text-orange-600 border-orange-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const STATUS_DOT_COLORS: Record<string, string> = {
    pending: 'text-zinc-400',
    editing: 'text-blue-500',
    edit_done: 'text-indigo-500',
    waiting_ship: 'text-amber-500',
    shipping: 'text-orange-500',
    completed: 'text-emerald-500',
    cancelled: 'text-red-500',
}

// Digital: pending → editing → edit_done → completed
const DIGITAL_FLOW: RetailOrderStatus[] = ['pending', 'editing', 'edit_done', 'completed']
// Physical: pending → editing → edit_done → waiting_ship → shipping → completed
const PHYSICAL_FLOW: RetailOrderStatus[] = ['pending', 'editing', 'edit_done', 'waiting_ship', 'shipping', 'completed']

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
    const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/order/${order.id}`
    const router = useRouter()
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const isPhysical = order.delivery_type === 'physical'
    const statusFlow = isPhysical ? PHYSICAL_FLOW : DIGITAL_FLOW

    const handleStatusChange = async (newStatus: RetailOrderStatus) => {
        if (newStatus === order.order_status) return
        setIsUpdatingStatus(true)
        try {
            await updateRetailOrder(order.id, { order_status: newStatus })
            toast.success(`Đã chuyển trạng thái → ${STATUS_LABELS[newStatus]}`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi cập nhật trạng thái')
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-10 w-10 rounded-full hover:bg-zinc-100 shrink-0"
                >
                    <Link href="/studio">
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-1.5">
                            {order.order_number}
                            <button
                                onClick={() => { navigator.clipboard.writeText(order.order_number); toast.success('Đã copy mã đơn') }}
                                className="text-zinc-300 hover:text-zinc-600 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </h1>
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 font-medium text-[10px] uppercase tracking-wider rounded-md", STATUS_COLORS[order.order_status])}>
                            {isUpdatingStatus && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                            {STATUS_LABELS[order.order_status]}
                        </Badge>
                        {isPhysical && (
                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium text-orange-600 border-orange-200 bg-orange-50 rounded-md">
                                Ship
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-normal">
                        <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                            {order.customer_name}
                        </span>
                        {order.customer_phone && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                <span className="font-medium text-zinc-500">{order.customer_phone}</span>
                            </>
                        )}
                        <span className="h-1 w-1 rounded-full bg-zinc-300" />
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.order_date || order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg font-medium text-xs bg-white border-zinc-200 hover:border-zinc-300 shadow-sm transition-all"
                    onClick={() => {
                        navigator.clipboard.writeText(portalUrl)
                        toast.success('Đã copy link Portal cho khách', {
                            description: 'Bạn có thể gửi link này qua Zalo/Messenger cho khách.'
                        })
                    }}
                >
                    <Copy className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    Copy link
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-9 rounded-lg font-medium text-xs bg-zinc-100 text-zinc-700 hover:bg-primary/5 hover:text-primary transition-all border border-zinc-200/50"
                >
                    <Link href={`/portal/order/${order.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Gửi portal cho khách
                    </Link>
                </Button>

                <div className="h-4 w-px bg-zinc-200 mx-1 hidden md:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-zinc-100 hover:bg-zinc-50">
                            <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-xl border-zinc-200 shadow-lg p-1">
                        <div className="px-3 py-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Chuyển trạng thái {isPhysical ? '(có ship)' : '(file mềm)'}
                            </p>
                        </div>
                        {statusFlow.map((status) => (
                            <DropdownMenuItem
                                key={status}
                                disabled={status === order.order_status || isUpdatingStatus}
                                className={cn(
                                    "rounded-lg h-10 cursor-pointer px-3 flex items-center gap-3",
                                    status === order.order_status && "opacity-50 cursor-default"
                                )}
                                onClick={() => handleStatusChange(status)}
                            >
                                <Circle className={cn("h-3 w-3 fill-current shrink-0", STATUS_DOT_COLORS[status])} />
                                <span className="font-medium text-sm">{STATUS_LABELS[status]}</span>
                                {status === order.order_status && <span className="ml-auto text-[10px] text-zinc-400 font-medium">Hiện tại</span>}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-zinc-100 my-1" />
                        <div className="px-3 py-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tác vụ đơn hàng</p>
                        </div>
                        <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer px-3">
                            <Link href={`/studio/${order.id}/edit`} className="flex items-center gap-3 w-full">
                                <Pencil className="h-4 w-4 text-zinc-400 shrink-0" />
                                <span className="font-medium text-sm text-left">Chỉnh sửa đơn hàng</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100 my-1" />
                        <DropdownMenuItem
                            disabled={order.order_status === 'cancelled' || isUpdatingStatus}
                            className="text-destructive focus:text-destructive focus:bg-destructive/5 rounded-lg h-10 cursor-pointer px-3 flex items-center gap-3"
                            onClick={() => handleStatusChange('cancelled')}
                        >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            <span className="font-medium text-sm text-left whitespace-nowrap">Hủy đơn hàng</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
