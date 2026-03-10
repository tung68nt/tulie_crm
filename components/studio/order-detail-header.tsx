'use client'

import { RetailOrder } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2, MoreVertical, CheckCircle2, QrCode } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OrderDetailHeaderProps {
    order: RetailOrder
}

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

export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/studio">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold italic   font-mono">{order.order_number}</h1>
                        <Badge variant="outline" className={cn("text-[10px] font-bold  ", STATUS_COLORS[order.order_status])}>
                            {STATUS_LABELS[order.order_status]}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-semibold">
                        Khách hàng: <span className="text-foreground">{order.customer_name}</span>
                        {order.customer_phone && ` • ${order.customer_phone}`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-bold text-xs " onClick={() => {
                    const url = `${window.location.origin}/portal/order/${order.id}`
                    navigator.clipboard.writeText(url)
                    alert('Đã copy link Portal cho khách: ' + url)
                }}>
                    <Share2 className="mr-2 h-4 w-4" /> Gửi portal cho khách
                </Button>
                <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
