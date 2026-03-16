import { Suspense } from 'react'
import { getProjects } from '@/lib/supabase/services/project-service'
import { getInvoiceReconciliation, getUnissuedInvoices } from '@/lib/supabase/services/invoice-tracker-service'
import { createClient } from '@/lib/supabase/server'
import ProjectPipeline from '@/components/projects/ProjectPipeline'
import StaleProjectsPanel from '@/components/projects/StaleProjectsPanel'
import InvoiceTrackerPanel from '@/components/projects/InvoiceTrackerPanel'
import UpcomingMilestonesPanel from '@/components/projects/UpcomingMilestonesPanel'
import { Rocket } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function Loading() {
    return (
        <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" />
        </div>
    )
}

export default async function ProjectOverviewPage() {
    const supabase = await createClient()

    const [projects, reconciliation, unissuedInvoices] = await Promise.all([
        getProjects(),
        getInvoiceReconciliation(),
        getUnissuedInvoices(),
    ])

    // Get upcoming milestones (next 30 days)
    const now = new Date()
    const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: upcomingMilestones } = await supabase
        .from('contract_milestones')
        .select('*, project:projects!project_id(id, title)')
        .gte('due_date', now.toISOString())
        .lte('due_date', thirtyDaysOut)
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .limit(20)

    // Stale projects (no updates > 7 days, still active)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const staleProjects = projects.filter(
        p => ['todo', 'in_progress'].includes(p.status) && p.updated_at < sevenDaysAgo
    )

    // Pipeline stats
    const pipeline = {
        todo: projects.filter(p => p.status === 'todo'),
        in_progress: projects.filter(p => p.status === 'in_progress'),
        review: projects.filter(p => p.status === 'review'),
        completed: projects.filter(p => p.status === 'completed'),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Tổng quan Dự án</h1>
                        <p className="text-muted-foreground text-sm">
                            Pipeline, tiến độ, hoá đơn, milestones
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/projects">
                        <Button variant="outline" size="sm">Danh sách dự án</Button>
                    </Link>
                </div>
            </div>

            {/* Pipeline */}
            <Suspense fallback={<Loading />}>
                <ProjectPipeline pipeline={pipeline} />
            </Suspense>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Stale Projects */}
                <Suspense fallback={<Loading />}>
                    <StaleProjectsPanel projects={staleProjects} />
                </Suspense>

                {/* Upcoming Milestones */}
                <Suspense fallback={<Loading />}>
                    <UpcomingMilestonesPanel milestones={upcomingMilestones || []} />
                </Suspense>
            </div>

            {/* Invoice Tracker */}
            <Suspense fallback={<Loading />}>
                <InvoiceTrackerPanel
                    reconciliation={reconciliation}
                    unissuedInvoices={unissuedInvoices}
                />
            </Suspense>
        </div>
    )
}
