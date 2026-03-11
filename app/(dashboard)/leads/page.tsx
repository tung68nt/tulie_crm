import { Suspense } from 'react'
import { getLeads, updateLead, deleteLead, Lead } from '@/lib/supabase/services/lead-service'
import { Skeleton } from '@/components/ui/skeleton'
import { Contact } from 'lucide-react'
import { LeadsList } from './leads-list'

export default function LeadsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                    <Contact className="h-6 w-6 text-zinc-900" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 tracking-tight">Leads</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Danh sách khách hàng tiềm năng từ Landing Page.</p>
                </div>
            </div>

            <Suspense fallback={<LeadsSkeleton />}>
                <LeadsListWrapper />
            </Suspense>
        </div>
    )
}

async function LeadsListWrapper() {
    const leads = await getLeads()

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
    }

    return <LeadsList initialData={leads} stats={stats} />
}

function LeadsSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-10 w-48" />
            </div>
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}
