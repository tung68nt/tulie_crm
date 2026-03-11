import { Badge } from '@/components/ui/badge'
import { TEAM, formatCurrency } from '@/lib/demo/mock-data'
import { UserCheck, Mail, Phone } from 'lucide-react'

export default function DemoTeam() {
    const totalSalary = TEAM.reduce((s, t) => s + t.salary, 0)
    const departments = [...new Set(TEAM.map(t => t.department))]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-border/50">
                    <UserCheck className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Nhân sự</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{TEAM.length} nhân viên · {departments.length} phòng ban · Quỹ lương {formatCurrency(totalSalary)}/tháng</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {TEAM.map((member) => (
                    <div key={member.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                <span className="text-sm font-black text-zinc-600 dark:text-zinc-300">{member.name.split(' ').slice(-1)[0][0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{member.name}</p>
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">{member.role}</p>
                                <Badge className="mt-2 text-[10px] font-semibold border-none px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    {member.department}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <Phone className="w-3 h-3" />{member.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                <Mail className="w-3 h-3" />{member.email}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-muted-foreground">Từ {member.joinDate}</span>
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(member.salary)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
