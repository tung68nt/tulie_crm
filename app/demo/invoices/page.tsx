import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { INVOICES, formatCurrency } from '@/lib/demo/mock-data'
import { Receipt } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    paid: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    overdue: { label: 'Quá hạn', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function DemoInvoices() {
    const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const totalPending = INVOICES.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <Receipt className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Hóa đơn</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{INVOICES.length} hóa đơn · Đã thu {formatCurrency(totalPaid)} · Chờ thu {formatCurrency(totalPending)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50/50 dark:bg-zinc-800/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">Mã</div>
                    <div className="col-span-2">Khách hàng</div>
                    <div className="col-span-3">Diễn giải</div>
                    <div className="col-span-2">Số tiền</div>
                    <div className="col-span-2">Hạn TT</div>
                    <div className="col-span-2">Trạng thái</div>
                </div>
                <div className="divide-y divide-border/50">
                    {INVOICES.map((inv) => {
                        const st = STATUS_MAP[inv.status] || STATUS_MAP.pending
                        return (
                            <Link key={inv.id} href={`/demo/invoices/${inv.id}`} className="block">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors items-center cursor-pointer">
                                    <div className="col-span-1">
                                        <span className="text-xs font-mono font-semibold text-muted-foreground">{inv.id}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">{inv.customerName}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">{inv.description}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(inv.amount)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[11px] text-muted-foreground">{inv.dueDate}</p>
                                        {inv.paidDate && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">TT: {inv.paidDate}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${st.color}`}>
                                            {st.label}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
