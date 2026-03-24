'use client'

import { useState, useTransition, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { History, RotateCcw, Clock, Eye, ChevronDown, ChevronUp, Package, FileText, Hash, X, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { getQuotationVersions, getQuotationVersionSnapshot, restoreQuotationVersion } from '@/lib/supabase/services/quotation-version-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface QuotationVersionHistoryProps {
    quotationId: string
}

function timeAgo(date: string) {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return formatDate(date)
}

export function QuotationVersionHistory({ quotationId }: QuotationVersionHistoryProps) {
    const [open, setOpen] = useState(false)
    const [versions, setVersions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<Record<string, any>>({})
    const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
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

    const togglePreview = useCallback(async (versionId: string) => {
        if (expandedId === versionId) {
            setExpandedId(null)
            return
        }

        setExpandedId(versionId)

        // Load snapshot data if not cached
        if (!previewData[versionId]) {
            setLoadingPreview(versionId)
            try {
                const data = await getQuotationVersionSnapshot(versionId)
                if (data?.snapshot) {
                    setPreviewData(prev => ({ ...prev, [versionId]: data.snapshot }))
                }
            } catch (err) {
                console.error(err)
                toast.error('Không thể tải dữ liệu phiên bản')
            } finally {
                setLoadingPreview(null)
            }
        }
    }, [expandedId, previewData])

    const handleRestore = async (versionId: string, versionNumber: number) => {
        if (!confirm(`Khôi phục phiên bản v${versionNumber}?\nDữ liệu hiện tại sẽ được tự động lưu trước khi khôi phục.`)) return

        startTransition(async () => {
            try {
                await restoreQuotationVersion(quotationId, versionId)
                toast.success(`Đã khôi phục phiên bản v${versionNumber}`)
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
            if (!v) { setExpandedId(null) }
        }}>
            <SheetTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 font-medium">
                    <History className="h-4 w-4" />
                    Lịch sử
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[460px] sm:w-[520px] p-0 flex flex-col">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2.5 text-base">
                            <div className="p-1.5 bg-zinc-900 text-white rounded-lg">
                                <History className="h-4 w-4" />
                            </div>
                            Lịch sử phiên bản
                            {versions.length > 0 && (
                                <Badge variant="secondary" className="ml-auto font-mono text-xs">
                                    {versions.length} phiên bản
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>
                    <p className="text-xs text-zinc-400 mt-2">
                        Mỗi thay đổi tự động lưu lại. Bấm xem chi tiết hoặc khôi phục bất kỳ phiên bản nào.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 text-sm gap-3">
                            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
                            <span>Đang tải lịch sử...</span>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 text-sm gap-3">
                            <div className="p-4 bg-zinc-50 rounded-2xl">
                                <Clock className="h-8 w-8 opacity-30" />
                            </div>
                            <p className="font-medium text-zinc-500">Chưa có phiên bản nào</p>
                            <p className="text-xs text-center max-w-[240px] leading-relaxed">Lịch sử sẽ tự động lưu khi bạn cập nhật báo giá</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {versions.map((v, idx) => {
                                const isExpanded = expandedId === v.id
                                const snapshot = previewData[v.id]
                                const isLoadingThis = loadingPreview === v.id
                                const isLatest = idx === 0

                                return (
                                    <div
                                        key={v.id}
                                        className={cn(
                                            "rounded-xl border transition-all duration-200",
                                            isExpanded
                                                ? "border-zinc-300 bg-white shadow-sm"
                                                : "border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-200"
                                        )}
                                    >
                                        {/* Version Header */}
                                        <div
                                            className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                                            onClick={() => togglePreview(v.id)}
                                        >
                                            {/* Version badge */}
                                            <div className={cn(
                                                "shrink-0 flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm",
                                                isLatest
                                                    ? "bg-zinc-900 text-white"
                                                    : "bg-zinc-100 text-zinc-600"
                                            )}>
                                                v{v.version_number}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-zinc-800 truncate">
                                                        {v.change_summary || `Phiên bản ${v.version_number}`}
                                                    </span>
                                                    {isLatest && (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                                                            Mới nhất
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                                    {timeAgo(v.created_at)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700"
                                                    onClick={(e) => { e.stopPropagation(); togglePreview(v.id) }}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Preview */}
                                        {isExpanded && (
                                            <div className="border-t border-zinc-100">
                                                {isLoadingThis ? (
                                                    <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
                                                        <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
                                                        Đang tải...
                                                    </div>
                                                ) : snapshot ? (
                                                    <div className="p-4 space-y-3">
                                                        {/* Quotation summary */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-center gap-2 p-2.5 bg-zinc-50 rounded-lg">
                                                                <Hash className="h-3.5 w-3.5 text-zinc-400" />
                                                                <div>
                                                                    <p className="text-zinc-400 text-[10px]">Mã báo giá</p>
                                                                    <p className="font-semibold text-zinc-700">{snapshot.quotation_number || '-'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 p-2.5 bg-zinc-50 rounded-lg">
                                                                <Package className="h-3.5 w-3.5 text-zinc-400" />
                                                                <div>
                                                                    <p className="text-zinc-400 text-[10px]">Tổng tiền</p>
                                                                    <p className="font-bold text-zinc-800">{formatCurrency(snapshot.total_amount || 0)}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {snapshot.title && (
                                                            <div className="flex items-start gap-2 p-2.5 bg-zinc-50 rounded-lg text-xs">
                                                                <FileText className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-zinc-400 text-[10px]">Tiêu đề</p>
                                                                    <p className="font-medium text-zinc-700">{snapshot.title}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Items preview */}
                                                        {snapshot.items && snapshot.items.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                                                    Danh sách hạng mục ({snapshot.items.length})
                                                                </p>
                                                                <div className="max-h-[200px] overflow-y-auto rounded-lg border border-zinc-100">
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="bg-zinc-50 text-zinc-500">
                                                                                <th className="text-left py-1.5 px-2.5 font-medium">#</th>
                                                                                <th className="text-left py-1.5 px-2.5 font-medium">Hạng mục</th>
                                                                                <th className="text-right py-1.5 px-2.5 font-medium">SL</th>
                                                                                <th className="text-right py-1.5 px-2.5 font-medium">Đơn giá</th>
                                                                                <th className="text-right py-1.5 px-2.5 font-medium">Thành tiền</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {snapshot.items.map((item: any, i: number) => (
                                                                                <tr key={i} className="border-t border-zinc-50">
                                                                                    <td className="py-1.5 px-2.5 text-zinc-400 tabular-nums">{i + 1}</td>
                                                                                    <td className="py-1.5 px-2.5 font-medium text-zinc-700 truncate max-w-[160px]">{item.product_name}</td>
                                                                                    <td className="py-1.5 px-2.5 text-right tabular-nums text-zinc-500">{item.quantity}</td>
                                                                                    <td className="py-1.5 px-2.5 text-right tabular-nums text-zinc-500">{formatCurrency(item.unit_price || 0).replace('₫', '')}</td>
                                                                                    <td className="py-1.5 px-2.5 text-right tabular-nums font-semibold text-zinc-700">{formatCurrency(item.total_price || (item.quantity * item.unit_price) || 0).replace('₫', '')}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Financial summary */}
                                                        <div className="flex items-center justify-between p-3 bg-zinc-900 text-white rounded-lg">
                                                            <span className="text-xs font-medium opacity-70">Tổng thanh toán</span>
                                                            <span className="text-base font-bold tabular-nums">
                                                                {formatCurrency(snapshot.total_amount || 0)}
                                                            </span>
                                                        </div>

                                                        {/* Restore button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full gap-2 text-xs font-medium h-9 border-dashed hover:border-zinc-400 hover:bg-zinc-50"
                                                            onClick={() => handleRestore(v.id, v.version_number)}
                                                            disabled={isPending}
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            Khôi phục phiên bản v{v.version_number}
                                                        </Button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
