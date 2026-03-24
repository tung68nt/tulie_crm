'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { History, RotateCcw, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { getQuotationVersions, restoreQuotationVersion } from '@/lib/supabase/services/quotation-version-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface QuotationVersionHistoryProps {
    quotationId: string
}

export function QuotationVersionHistory({ quotationId }: QuotationVersionHistoryProps) {
    const [open, setOpen] = useState(false)
    const [versions, setVersions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const loadVersions = async () => {
        setLoading(true)
        try {
            const data = await getQuotationVersions(quotationId)
            setVersions(data)
        } catch (err) {
            console.error(err)
            toast.error('Không thể tải lịch sử phiên bản')
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async (versionId: string, versionNumber: number) => {
        if (!confirm(`Bạn có chắc muốn khôi phục phiên bản ${versionNumber}? Dữ liệu hiện tại sẽ được lưu trước khi khôi phục.`)) return

        startTransition(async () => {
            try {
                await restoreQuotationVersion(quotationId, versionId)
                toast.success(`Đã khôi phục phiên bản ${versionNumber}`)
                setOpen(false)
                router.refresh()
            } catch (err: any) {
                toast.error(err.message || 'Lỗi khi khôi phục')
            }
        })
    }

    return (
        <Sheet open={open} onOpenChange={(v) => {
            setOpen(v)
            if (v) loadVersions()
        }}>
            <SheetTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 font-medium">
                    <History className="h-4 w-4" />
                    Lịch sử
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[440px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Lịch sử phiên bản
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-zinc-400 text-sm">
                            Đang tải...
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 text-sm gap-2">
                            <Clock className="h-8 w-8 opacity-30" />
                            <p>Chưa có phiên bản nào được lưu</p>
                            <p className="text-xs opacity-60">Lịch sử sẽ tự động lưu mỗi khi bạn cập nhật báo giá</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-[2px] before:bg-zinc-100 before:rounded-full">
                            {versions.map((v) => (
                                <div key={v.id} className="relative mb-4 last:mb-0">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-6 top-3 w-[18px] h-[18px] rounded-full bg-zinc-900 border-[3px] border-white z-10 shadow-sm" />

                                    <div className="bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-100 rounded-xl p-4 transition-colors group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900">
                                                        v{v.version_number}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                                    {v.change_summary}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                                                    {formatDate(v.created_at)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                onClick={() => handleRestore(v.id, v.version_number)}
                                                disabled={isPending}
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                                Khôi phục
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
