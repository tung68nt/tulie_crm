import { getProjectById } from '@/lib/supabase/services/project-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { getWorkItemsByProject } from '@/lib/supabase/services/work-item-service'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants/status'
import { ArrowLeft, Globe, Layout, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { ProjectMetadataForm } from '@/components/projects/project-metadata-form'
import { ProjectMilestones } from '@/components/projects/project-milestones'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { ProjectSidebar } from '@/components/projects/project-sidebar'
import { WorkItemsManager } from '@/components/projects/work-items-manager'
import { FileText as FileTextIcon, Receipt, ArrowUpRight, Lock } from 'lucide-react'
import { ProjectDescriptionForm } from '@/components/projects/project-description-form'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectDocumentationSet } from '@/components/projects/project-documentation-set'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { getProjectTasks } from '@/lib/supabase/services/task-service'
import { PortalViewAnalytics } from '@/components/portal/portal-view-analytics'

export default async function ProjectDetailPage({ params }: any) {
    const { id } = await params
    const [project, teamMembers, workItems, tasks] = await Promise.all([
        getProjectById(id),
        getUsers(),
        getWorkItemsByProject(id),
        getProjectTasks(id)
    ])

    if (!project) notFound()

    // Totals logic: contracts if any, else primary quotation only
    const contracts = project.contracts || []
    const quotations = project.quotations || []

    // Fix: use contract total if exists, else sum accepted quotations, fallback to all
    const acceptedTotal = quotations.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const allQuoteTotal = quotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const contractTotal = contracts.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)
    const projectTotal = contractTotal > 0 ? contractTotal : (acceptedTotal > 0 ? acceptedTotal : allQuoteTotal)

    const portalUrl = quotations.length > 0 ? `/portal/${quotations[0].public_token}` : null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/projects">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{project.title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_LABELS] || 'bg-gray-100'}>
                                {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] || project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Khách hàng: <Link href={`/customers/${project.customer?.id}`} className="hover:underline font-medium">{project.customer?.company_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DeleteProjectButton projectId={project.id} />
                    <SetPasswordDialog
                        entityId={project.id}
                        tableName="projects"
                        hasPassword={!!project.password_hash}
                    />
                    {portalUrl && (
                        <Button variant="outline" asChild>
                            <Link href={portalUrl} target="_blank">
                                <Globe className="mr-2 h-4 w-4" />
                                Xem Customer Portal
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Work Items Manager */}
                    <WorkItemsManager project={project} workItems={workItems} />

                    {/* Overview & Metadata */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Layout className="w-5 h-5 text-zinc-900" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Tài nguyên dự án (Agency Assets)</CardTitle>
                                    <CardDescription className="text-[11px] font-medium">Các liên kết quan trọng phục vụ bàn giao và triển khai dự án.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProjectMetadataForm project={project} />
                        </CardContent>
                    </Card>

                    {/* Milestones / Schedule */}
                    <ProjectMilestones project={project} />

                    {/* Gantt Chart Progress */}
                    <ProjectGanttChart tasks={tasks} />

                    {/* Documentation Set (Bộ chứng từ dự án) */}
                    <ProjectDocumentationSet project={project} workItems={workItems} />

                    {/* Financial Documents Section (Quotations & Contracts) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Receipt className="w-5 h-5 text-zinc-900" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Tài chính &amp; Pháp lý</CardTitle>
                                    <CardDescription className="text-[11px] font-medium">Quản lý báo giá và hợp đồng liên quan đến dự án</CardDescription>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground font-semibold">Tổng giá trị dự án</p>
                                <p className="text-2xl font-bold">{formatCurrency(projectTotal)}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                {/* Quotations List */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                            Danh sách Báo giá
                                        </h4>
                                        <Badge variant="outline" className="text-[11px]">{quotations.length} bản</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {quotations.length > 0 ? quotations.map((q: any) => (
                                            <Link
                                                key={q.id}
                                                href={`/quotations/${q.id}?from=/projects/${id}`}
                                                className="group flex items-center justify-between p-3 border rounded-xl hover:border-slate-300 hover:bg-muted/30 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                                                        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{q.quotation_number}</p>
                                                        <p className="text-[11px] text-muted-foreground">{formatDate(q.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold">{formatCurrency(q.total_amount)}</p>
                                                        <Badge variant="secondary" className="text-[11px] h-4 px-1 opacity-80">
                                                            {q.status}
                                                        </Badge>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </Link>
                                        )) : (
                                            <p className="text-xs text-muted-foreground text-center py-2">Chưa có báo giá nào.</p>
                                        )}
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                {/* Contracts List */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                                            Danh sách Hợp đồng / Đơn hàng
                                        </h4>
                                        <Badge variant="outline" className="text-[11px]">{contracts.length} bản</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {contracts.length > 0 ? contracts.map((c: any) => (
                                            <Link
                                                key={c.id}
                                                href={`/contracts/${c.id}?from=/projects/${id}`}
                                                className="group flex items-center justify-between p-3 border rounded-xl hover:border-slate-300 hover:bg-muted/30 transition-all font-sans cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                                                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{c.contract_number}</p>
                                                        <p className="text-[11px] text-muted-foreground">{formatDate(c.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold">{formatCurrency(c.total_amount)}</p>
                                                        <Badge variant="secondary" className="text-[11px] h-4 px-1 opacity-80">
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                </div>
                                            </Link>
                                        )) : (
                                            <p className="text-xs text-muted-foreground text-center py-2">Chưa có hợp đồng nào.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Tasks */}
                    <ProjectTasks project={project} workItems={workItems} />

                    {/* Description Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <FileTextIcon className="w-5 h-5 text-zinc-900" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Mô tả dự án</CardTitle>
                                    <CardDescription className="text-[11px] font-medium">Thông tin chi tiết về dự án</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProjectDescriptionForm project={project} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - client component with status, PM, dates, acceptance reports */}
                <div className="space-y-6">
                    <ProjectSidebar project={project} teamMembers={teamMembers} />
                    <PortalViewAnalytics projectId={project.id} />
                    <ProjectActivityHistory projectId={project.id} />
                </div>
            </div>
        </div>
    )
}
