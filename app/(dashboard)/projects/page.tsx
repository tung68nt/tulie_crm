import { Suspense } from 'react'
import { getProjects } from '@/lib/supabase/services/project-service'
import { ProjectList } from '@/components/projects/project-list'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List, Rocket } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold ">Dự án</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý triển khai và bàn giao dịch vụ cho khách hàng.
                        </p>
                    </div>
                </div>
            </div>

            <Suspense fallback={<ProjectSkeleton />}>
                <ProjectDataWrapper />
            </Suspense>
        </div>
    )
}

async function ProjectDataWrapper() {
    const projects = await getProjects()
    return <ProjectList initialData={projects} />
}

function ProjectSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="border rounded-md">
                <div className="h-12 border-b bg-muted/50" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
