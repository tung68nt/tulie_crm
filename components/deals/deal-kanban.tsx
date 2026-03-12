'use client'

import { Deal, DealStatus } from '@/types'
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from '@/lib/constants/status'
import { formatCurrency } from '@/lib/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { updateDealStatus } from '@/lib/supabase/services/deal-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Users, Wallet, MoreVertical, FileText } from 'lucide-react'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

interface DealKanbanProps {
    deals: Deal[]
}

const COLUMNS: DealStatus[] = ['new', 'briefing', 'proposal_sent', 'closed_won', 'closed_lost']

export function DealKanban({ deals }: DealKanbanProps) {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState<string | null>(null)

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('dealId', id)
        setIsDragging(id)
    }

    const onDragEnd = () => {
        setIsDragging(null)
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const onDrop = async (e: React.DragEvent, status: DealStatus) => {
        e.preventDefault()
        const dealId = e.dataTransfer.getData('dealId')

        const deal = deals.find(d => d.id === dealId)
        if (deal && deal.status !== status) {
            try {
                await updateDealStatus(dealId, status)
                toast.success(`Đã chuyển sang ${DEAL_STATUS_LABELS[status]}`)
                router.refresh()
            } catch (error) {
                toast.error(`Lỗi cập nhật trạng thái cơ hội: ${(error as any)?.message || 'Thử lại sau'}`)
            }
        }
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] -mx-1 px-1">
            {COLUMNS.map((status) => (
                <div
                    key={status}
                    className="flex-shrink-0 w-80 flex flex-col gap-3"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, status)}
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground">
                                {DEAL_STATUS_LABELS[status]}
                            </h3>
                            <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px]">
                                {deals.filter(d => d.status === status).length}
                            </Badge>
                        </div>
                    </div>

                    <div className={cn(
                        "flex-1 rounded-xl bg-muted/30 p-2 space-y-3 transition-colors border-2 border-transparent",
                        isDragging && "border-dashed border-muted-foreground/20"
                    )}>
                        {deals
                            .filter((deal) => deal.status === status)
                            .map((deal) => (
                                <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, deal.id)}
                                    onDragEnd={onDragEnd}
                                    className={cn(
                                        "bg-background rounded-lg border shadow-sm p-4 space-y-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group relative",
                                        isDragging === deal.id && "opacity-50 ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <Link
                                            href={`/deals/${deal.id}`}
                                            className="font-bold text-sm leading-tight hover:underline flex-1"
                                        >
                                            {deal.title}
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/deals/${deal.id}`}>Chi tiết</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/quotations/new?deal_id=${deal.id}&customer_id=${deal.customer_id}`}>Tạo báo giá</Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                                            <Users className="h-3 w-3 shrink-0" />
                                            <span className="truncate group-hover:text-foreground transition-colors">
                                                {deal.customer?.company_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                <Wallet className="h-3 w-3" />
                                                {formatCurrency(deal.budget || 0)}
                                            </div>
                                            {deal.priority === 'high' && (
                                                <Badge variant="outline" className="text-[10px] text-red-600 bg-red-50 border-red-200">Gấp</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t mt-2 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(deal.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded italic">
                                            {deal.assigned_user?.full_name?.split(' ').pop()}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {deals.filter(d => d.status === status).length === 0 && (
                            <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground/40 text-xs italic">
                                Trống
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
