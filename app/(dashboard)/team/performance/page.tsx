import { Suspense } from 'react'
import { getTeamOverview, getWorkloadDistribution } from '@/lib/supabase/services/team-performance-service'
import TeamStatsCards from '@/components/team/TeamStatsCards'
import TeamMemberTable from '@/components/team/TeamMemberTable'
import WorkloadChart from '@/components/team/WorkloadChart'
import { Loader2, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function Loading() {
    return (
        <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    )
}

export default async function TeamPerformancePage() {
    const [teamOverview, workload] = await Promise.all([
        getTeamOverview(),
        getWorkloadDistribution(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Hiệu suất đội ngũ</h1>
                    <p className="text-muted-foreground text-sm">
                        Theo dõi tiến độ và khối lượng công việc
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <Suspense fallback={<Loading />}>
                <TeamStatsCards overview={teamOverview} />
            </Suspense>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Member Performance Table */}
                <div className="lg:col-span-2">
                    <Suspense fallback={<Loading />}>
                        <TeamMemberTable members={teamOverview.members} />
                    </Suspense>
                </div>

                {/* Workload Distribution */}
                <Suspense fallback={<Loading />}>
                    <WorkloadChart workload={workload} />
                </Suspense>
            </div>
        </div>
    )
}
