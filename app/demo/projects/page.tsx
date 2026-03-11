import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PROJECTS, formatCurrency } from '@/lib/demo/mock-data'
import { Rocket } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    design: { label: 'Thiết kế', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    in_progress: { label: 'Đang thi công', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
}

export default function DemoProjects() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <Rocket className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Dự án</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{PROJECTS.length} dự án · {PROJECTS.filter(p => p.status !== 'completed').length} đang thực hiện</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {PROJECTS.map((p) => {
                    const st = STATUS_MAP[p.status] || STATUS_MAP.in_progress
                    return (
                        <Link key={p.id} href={`/demo/projects/${p.id}`} className="block">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 p-6 hover:shadow-md transition-all space-y-4 cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{p.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{p.customerName}</p>
                                    </div>
                                    <Badge className={`text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg shrink-0 ${st.color}`}>
                                        {st.label}
                                    </Badge>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Tiến độ</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{p.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${p.progress === 100 ? 'bg-emerald-500' : 'bg-zinc-900 dark:bg-zinc-300'}`}
                                            style={{ width: `${p.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Designer</p>
                                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{p.designer}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Giá trị</p>
                                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{formatCurrency(p.value)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Thời gian</p>
                                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{p.startDate.slice(5)} → {p.endDate.slice(5)}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
