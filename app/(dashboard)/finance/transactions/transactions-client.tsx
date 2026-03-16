'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowDownLeft, ArrowUpRight, Search, RefreshCw, CheckCircle2, XCircle, ArrowLeft, ExternalLink, Filter, ArrowDownToLine } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { syncTransactionsAction, loadTransactionsAction } from './actions'

interface TransactionsClientProps {
    initialData: any[]
    initialTotal: number
}

export function TransactionsClient({ initialData, initialTotal }: TransactionsClientProps) {
    const [transactions, setTransactions] = useState(initialData)
    const [total, setTotal] = useState(initialTotal)
    const [search, setSearch] = useState('')
    const [matchFilter, setMatchFilter] = useState<string>('all')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [page, setPage] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<any>(null)
    const [isFiltering, startFilterTransition] = useTransition()

    const PAGE_SIZE = 50

    const applyFilters = (overrides?: any) => {
        const params = {
            search: overrides?.search ?? search,
            matchFilter: overrides?.matchFilter ?? matchFilter,
            sourceFilter: overrides?.sourceFilter ?? sourceFilter,
            typeFilter: overrides?.typeFilter ?? typeFilter,
            page: overrides?.page ?? 0,
        }

        startFilterTransition(async () => {
            const result = await loadTransactionsAction({
                search: params.search || undefined,
                matchedOnly: params.matchFilter === 'matched',
                unmatchedOnly: params.matchFilter === 'unmatched',
                sourceSystem: params.sourceFilter,
                transferType: params.typeFilter === 'all' ? undefined : params.typeFilter,
                limit: PAGE_SIZE,
                offset: params.page * PAGE_SIZE,
            })
            setTransactions(result.data)
            setTotal(result.total)
            if (overrides?.page !== undefined) setPage(params.page)
        })
    }

    const handleSync = async () => {
        setIsSyncing(true)
        setSyncResult(null)
        try {
            const result = await syncTransactionsAction()
            setSyncResult(result)
            // Reload current view
            applyFilters()
        } catch (err: any) {
            setSyncResult({ error: err.message })
        } finally {
            setIsSyncing(false)
        }
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyFilters()
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/finance">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Giao dịch ngân hàng</h1>
                        <p className="text-sm text-muted-foreground">
                            Đồng bộ và kiểm tra giao dịch từ SePay • {total} giao dịch
                        </p>
                    </div>
                </div>
                <Button onClick={handleSync} disabled={isSyncing} className="font-bold rounded-xl shadow-md">
                    {isSyncing ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Đồng bộ SePay
                </Button>
            </div>

            {/* Sync Result */}
            {syncResult && (
                <div className={cn(
                    "p-4 rounded-xl border text-sm font-medium flex items-center gap-3",
                    syncResult.error
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-emerald-50 border-green-200 text-green-700"
                )}>
                    {syncResult.error ? (
                        <><XCircle className="h-4 w-4 shrink-0" /> {syncResult.error}</>
                    ) : (
                        <><CheckCircle2 className="h-4 w-4 shrink-0" /> Đã đồng bộ: {syncResult.total} giao dịch, {syncResult.processed} xử lý, {syncResult.matched} khớp đơn, {syncResult.errors} lỗi</>
                    )}
                    <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => setSyncResult(null)}>✕</Button>
                </div>
            )}

            {/* Filters */}
            <Card className="overflow-hidden rounded-xl border-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm theo nội dung CK, mã đơn..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-9 h-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <Select value={matchFilter} onValueChange={(v) => { setMatchFilter(v); applyFilters({ matchFilter: v }) }}>
                            <SelectTrigger className="w-[160px] h-10 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="matched">Đã khớp đơn</SelectItem>
                                <SelectItem value="unmatched">Chưa khớp</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); applyFilters({ sourceFilter: v }) }}>
                            <SelectTrigger className="w-[140px] h-10 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Mọi nguồn</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="lab">Lab</SelectItem>
                                <SelectItem value="unknown">Không xác định</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); applyFilters({ typeFilter: v }) }}>
                            <SelectTrigger className="w-[130px] h-10 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Vào + Ra</SelectItem>
                                <SelectItem value="in">Tiền vào</SelectItem>
                                <SelectItem value="out">Tiền ra</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => applyFilters()} disabled={isFiltering} className="h-10 rounded-xl font-bold">
                            {isFiltering ? <LoadingSpinner size="sm" className="mr-2" /> : <Filter className="mr-2 h-4 w-4" />}
                            Lọc
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden rounded-xl border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Thời gian</th>
                                <th className="px-4 py-3 text-left">Loại</th>
                                <th className="px-4 py-3 text-right">Số tiền</th>
                                <th className="px-4 py-3 text-left">Nội dung CK</th>
                                <th className="px-4 py-3 text-left">Mã đơn</th>
                                <th className="px-4 py-3 text-left">Khớp</th>
                                <th className="px-4 py-3 text-left">Nguồn</th>
                                <th className="px-4 py-3 text-left">Ngân hàng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <ArrowDownToLine className="h-8 w-8 opacity-20" />
                                            <p className="font-medium">Chưa có giao dịch nào</p>
                                            <p className="text-xs">Nhấn "Đồng bộ SePay" để kéo dữ liệu giao dịch về.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.map((tx: any) => {
                                const isIn = tx.transfer_type === 'in'
                                const amount = isIn ? tx.amount_in : tx.amount_out
                                const matchedOrder = tx.matched_order
                                const matchedInvoice = tx.matched_invoice
                                const isMatched = matchedOrder || matchedInvoice

                                return (
                                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs font-medium">
                                                {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('vi-VN') : '—'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {tx.transaction_date ? new Date(tx.transaction_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isIn ? (
                                                <Badge variant="outline" className="text-emerald-600 border-green-200 bg-emerald-50 gap-1 text-[11px] font-bold">
                                                    <ArrowDownLeft className="h-3 w-3" /> Vào
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-500 border-rose-200 bg-rose-50 gap-1 text-[11px] font-bold">
                                                    <ArrowUpRight className="h-3 w-3" /> Ra
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <span className={cn(
                                                "font-bold tabular-nums",
                                                isIn ? "text-emerald-600" : "text-red-500"
                                            )}>
                                                {isIn ? '+' : '-'}{formatCurrency(amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-[250px]">
                                            <p className="text-xs truncate font-medium" title={tx.content || tx.description}>
                                                {tx.content || tx.description || '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {tx.code ? (
                                                <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">{tx.code}</code>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {matchedOrder ? (
                                                <Link href={`/studio/${matchedOrder.id}`} className="group">
                                                    <Badge variant="secondary" className="text-[11px] font-bold gap-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {matchedOrder.order_number || 'Đơn hàng'}
                                                    </Badge>
                                                </Link>
                                            ) : matchedInvoice ? (
                                                <Link href={`/invoices/${matchedInvoice.id}`} className="group">
                                                    <Badge variant="secondary" className="text-[11px] font-bold gap-1 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 transition-colors">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {matchedInvoice.invoice_number || 'Hóa đơn'}
                                                    </Badge>
                                                </Link>
                                            ) : (
                                                <Badge variant="outline" className="text-[11px] font-bold text-amber-600 border-amber-200 bg-amber-50 gap-1">
                                                    <XCircle className="h-3 w-3" /> Chưa khớp
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Badge variant="outline" className={cn(
                                                "text-[11px] font-bold",
                                                tx.source_system === 'studio' && "text-violet-600 border-violet-200 bg-violet-50",
                                                tx.source_system === 'lab' && "text-cyan-600 border-cyan-200 bg-cyan-50",
                                                tx.source_system === 'unknown' && "text-zinc-400 border-zinc-200 bg-zinc-50",
                                            )}>
                                                {tx.source_system === 'studio' ? 'Studio' : tx.source_system === 'lab' ? 'Lab' : '—'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs text-muted-foreground font-medium">{tx.gateway || '—'}</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
                        <p className="text-xs text-muted-foreground font-medium">
                            Trang {page + 1} / {totalPages} • {total} giao dịch
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0 || isFiltering}
                                onClick={() => applyFilters({ page: page - 1 })}
                                className="h-8 text-xs rounded-lg font-bold"
                            >
                                Trang trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1 || isFiltering}
                                onClick={() => applyFilters({ page: page + 1 })}
                                className="h-8 text-xs rounded-lg font-bold"
                            >
                                Trang sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
