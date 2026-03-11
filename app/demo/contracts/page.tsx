import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, formatCurrency } from '@/lib/demo/mock-data'
import { FilePenLine } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function DemoContracts() {
    const totalValue = CONTRACTS.reduce((s, c) => s + c.value, 0)
    const totalPaid = CONTRACTS.reduce((s, c) => s + c.paid, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <FilePenLine className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Hợp đồng</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{CONTRACTS.length} hợp đồng · Đã thu {formatCurrency(totalPaid)}/{formatCurrency(totalValue)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50/50 dark:bg-zinc-800/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">Mã</div>
                    <div className="col-span-3">Dự án</div>
                    <div className="col-span-2">Khách hàng</div>
                    <div className="col-span-2">Giá trị / Đã thu</div>
                    <div className="col-span-2">Thời gian</div>
                    <div className="col-span-2">Trạng thái</div>
                </div>
                <div className="divide-y divide-border/50">
                    {CONTRACTS.map((c) => {
                        const st = STATUS_MAP[c.status] || STATUS_MAP.active
                        const paidPercent = Math.round((c.paid / c.value) * 100)
                        return (
                            <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors items-center">
                                <div className="col-span-1">
                                    <span className="text-xs font-mono font-semibold text-muted-foreground">{c.id}</span>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">{c.project}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.paymentTerms}</p>
                                </div>
                                <div className="col-span-2">
                                    <Link href={`/demo/customers/${c.customer}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                        {c.customerName}
                                    </Link>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(c.value)}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPercent}%` }} />
                                        </div>
                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{paidPercent}%</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[11px] text-muted-foreground">{c.startDate} → {c.endDate}</p>
                                </div>
                                <div className="col-span-2">
                                    <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${st.color}`}>
                                        {st.label}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
