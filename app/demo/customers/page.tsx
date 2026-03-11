import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CUSTOMERS, formatCurrency } from '@/lib/demo/mock-data'
import { Users } from 'lucide-react'

export default function DemoCustomers() {
    const activeCount = CUSTOMERS.filter(c => c.status === 'active').length

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <Users className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Khách hàng</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{CUSTOMERS.length} khách hàng · {activeCount} đang hoạt động</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50/50 dark:bg-zinc-800/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">Mã</div>
                    <div className="col-span-3">Khách hàng</div>
                    <div className="col-span-2">Liên hệ</div>
                    <div className="col-span-2">Loại</div>
                    <div className="col-span-2">Giá trị tích lũy</div>
                    <div className="col-span-2">Trạng thái</div>
                </div>
                <div className="divide-y divide-border/50">
                    {CUSTOMERS.map((c) => (
                        <Link key={c.id} href={`/demo/customers/${c.id}`} className="block">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors items-center cursor-pointer">
                                <div className="col-span-1">
                                    <span className="text-xs font-mono font-semibold text-muted-foreground">{c.id}</span>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">{c.name}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.company}</p>
                                </div>
                                <div className="col-span-2 space-y-0.5">
                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{c.phone}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                                </div>
                                <div className="col-span-2">
                                    <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${c.type === 'Doanh nghiệp' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                        {c.type}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{formatCurrency(c.totalValue)}</p>
                                </div>
                                <div className="col-span-2">
                                    <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                        {c.status === 'active' ? 'Đang hoạt động' : 'Hoàn thành'}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
