import { getProjectById } from '@/lib/supabase/services/project-service'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants/status'
import { ArrowLeft, Edit, ExternalLink, Globe, FolderArchive, Link2, Layout, FileCheck, Users, Calendar, AlertCircle, FileDown } from 'lucide-react'
import Link from 'next/link'
import { ProjectMetadataForm } from '@/components/projects/project-metadata-form'
import { AcceptancePDFButton } from '@/components/projects/acceptance-pdf-button'
import { ProjectMilestones } from '@/components/projects/project-milestones'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { FileText as FileTextIcon, Receipt, ArrowUpRight } from 'lucide-react'
import { getQuotationByProjectId } from '@/lib/supabase/services/quotation-service'

export default async function ProjectDetailPage({ params }: any) {
    const { id } = await params
    const project = await getProjectById(id)

    if (!project) notFound()

    // Totals logic: sum of contracts IF ANY, otherwise sum of quotations
    const contracts = project.contracts || []
    const quotations = project.quotations || []

    // Calculate total project value
    const projectTotal = contracts.length > 0
        ? contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)
        : quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0)

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
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <Badge className={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_LABELS] || 'bg-gray-100'}>
                                {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] || project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Khách hàng: <Link href={`/customers/${project.customer?.id}`} className="hover:underline font-medium">{project.customer?.company_name}</Link>
                        </p>
                    </div>
                </div>
                {portalUrl && (
                    <Button variant="outline" asChild>
                        <Link href={portalUrl} target="_blank">
                            <Globe className="mr-2 h-4 w-4" />
                            Xem Customer Portal
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview & Metadata */}
                    <Card>
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="flex items-center gap-2">
                                <Layout className="h-5 w-5 text-slate-700" />
                                Tài nguyên dự án (Agency Assets)
                            </CardTitle>
                            <CardDescription>Các liên kết quan trọng phục vụ bàn giao và triển khai dự án.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ProjectMetadataForm project={project} />
                        </CardContent>
                    </Card>

                    {/* Milestones / Schedule */}
                    <ProjectMilestones project={project} />

                    {/* Financial Documents Section (Quotations & Contracts) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-slate-700" />
                                    Tài chính & Pháp lý
                                </CardTitle>
                                <CardDescription>Quản lý báo giá và hợp đồng liên quan đến dự án</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground font-bold">Tổng giá trị dự án</p>
                                <p className="text-2xl font-bold text-slate-900">{formatCurrency(projectTotal)}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                {/* Quotations List */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <FileTextIcon className="h-4 w-4 text-slate-700" />
                                            Danh sách Báo giá
                                        </h4>
                                        <Badge variant="outline" className="text-[10px]">{quotations.length} bản</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {quotations.length > 0 ? quotations.map((q: any) => (
                                            <Link
                                                key={q.id}
                                                href={`/quotations/${q.id}`}
                                                className="group flex items-center justify-between p-3 border rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                                                        <FileTextIcon className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{q.quotation_number}</p>
                                                        <p className="text-[10px] text-muted-foreground">{formatDate(q.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(q.total_amount)}</p>
                                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 opacity-80">
                                                            {q.status}
                                                        </Badge>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-slate-900 transition-colors" />
                                                </div>
                                            </Link>
                                        )) : (
                                            <p className="text-xs text-muted-foreground text-center py-2 font-medium">Chưa có báo giá nào.</p>
                                        )}
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                {/* Contracts List */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-slate-700" />
                                            Danh sách Hợp đồng / Đơn hàng
                                        </h4>
                                        <Badge variant="outline" className="text-[10px]">{contracts.length} bản</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {contracts.length > 0 ? contracts.map((c: any) => (
                                            <Link
                                                key={c.id}
                                                href={`/contracts/${c.id}`}
                                                className="group flex items-center justify-between p-3 border rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all font-sans cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                                                        <FileCheck className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{c.contract_number}</p>
                                                        <p className="text-[10px] text-muted-foreground">{formatDate(c.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(c.total_amount)}</p>
                                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 opacity-80">
                                                            {c.status}
                                                        </Badge>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-slate-900 transition-colors" />
                                                </div>
                                            </Link>
                                        )) : (
                                            <p className="text-xs text-muted-foreground text-center py-2 font-medium">Chưa có hợp đồng nào.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Tasks */}
                    <ProjectTasks project={project} />

                    {/* Description Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Mô tả dự án</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm p-4 bg-muted/20 rounded-xl border border-dashed border-slate-200 whitespace-pre-line leading-relaxed">
                                {project.description || "Chưa có mô tả chi tiết cho dự án này."}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Stats & Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chi tiết quản lý</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Người quản lý (PM/Account)</p>
                                    <p className="font-medium text-sm">{project.assigned_user?.full_name || "Chưa gán"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Thời gian thực hiện</p>
                                    <p className="font-medium text-sm">
                                        {project.start_date ? formatDate(project.start_date) : "N/A"} -
                                        {project.end_date ? formatDate(project.end_date) : "N/A"}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">Thời hạn cuối</span>
                                </div>
                                <span className="text-sm font-bold text-red-700 dark:text-red-300 underline">
                                    {project.end_date ? formatDate(project.end_date) : "-"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acceptance Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Nghiệm thu dứt điểm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.acceptance_reports && project.acceptance_reports.length > 0 ? (
                                <div className="space-y-2">
                                    {project.acceptance_reports.map((report: any) => (
                                        <div key={report.id} className="p-3 border rounded-md text-sm bg-muted/10 flex justify-between items-center group transition-all hover:border-slate-300">
                                            <div>
                                                <p className="font-medium">{report.report_number}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(report.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={report.is_signed ? "default" : "secondary"} className="text-[10px] scale-90">
                                                    {report.is_signed ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                                {project.customer && (
                                                    <AcceptancePDFButton
                                                        project={project}
                                                        report={report}
                                                        customer={project.customer}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4 font-medium">Chưa có biên bản nghiệm thu.</p>
                            )}
                            <Button className="w-full" variant="outline">Tạo biên bản nghiệm thu mới</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
