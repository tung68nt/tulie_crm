'use client'

import { RetailOrder } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2, MoreVertical, Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
    const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/order/${order.id}`

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/studio">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2.5 mb-0.5">
                        <h1 className="text-xl font-semibold font-mono tracking-tight">{order.order_number}</h1>
                        <Badge variant={STATUS_VARIANTS[order.order_status] || 'secondary'}>
                            {STATUS_LABELS[order.order_status]}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Khách hàng: <span className="font-medium text-foreground">{order.customer_name}</span>
                        {order.customer_phone && ` • ${order.customer_phone}`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        navigator.clipboard.writeText(portalUrl)
                        toast.success('Đã copy link Portal cho khách')
                    }}
                >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy link portal
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/portal/order/${order.id}`} target="_blank">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Gửi portal cho khách
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/studio/${order.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Sửa đơn hàng
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.info('Tính năng xóa đang chờ phân quyền')}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hủy đơn hàng
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
