'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingCart, FileSignature, Loader2, ChevronDown } from 'lucide-react'
import { convertQuotationToOrder } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ConvertQuotationButton({ quotationId }: { quotationId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleConvert = async (type: 'order' | 'contract') => {
        setIsLoading(true)
        try {
            const res = await convertQuotationToOrder(quotationId, type)
            if (res.success) {
                toast.success(type === 'order' ? 'Đã tạo đơn hàng thành công' : 'Đã tạo hợp đồng thành công')
                router.push(`/contracts/${res.id}`)
            } else {
                toast.error(res.error || 'Có lỗi xảy ra')
            }
        } catch (err) {
            toast.error('Lỗi hệ thống')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isLoading}>
                <Button
                    className="h-10 px-4 bg-black hover:bg-zinc-900 text-white border-black font-semibold flex items-center gap-2 rounded-md"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    Chuyển thành Đơn hàng / Hợp đồng
                    <ChevronDown className="h-4 w-4 ml-1 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1">
                <DropdownMenuItem onClick={() => handleConvert('order')} className="cursor-pointer gap-2 py-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Chuyển thành Đơn hàng</span>
                        <span className="text-[10px] text-muted-foreground">Tạo đơn hàng triển khai (Studio)</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleConvert('contract')} className="cursor-pointer gap-2 py-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <FileSignature className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Chuyển thành Hợp đồng</span>
                        <span className="text-[10px] text-muted-foreground">Tạo hợp đồng ký kết (Agency)</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
