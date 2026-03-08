'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Users, Calendar, AlertCircle, FileCheck, Plus, Loader2, CheckCircle, Clock, Play, Eye
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants/status'
import { AcceptancePDFButton } from '@/components/projects/acceptance-pdf-button'
import { toast } from 'sonner'

interface ProjectSidebarProps {
    project: any
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
    const router = useRouter()
    const [statusLoading, setStatusLoading] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setStatusLoading(true)
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            toast.success('Da cap nhat trang thai du an')
            router.refresh()
        } catch (error) {
            toast.error('Loi khi cap nhat trang thai')
        } finally {
            setStatusLoading(false)
        }
    }

    const handleCreateReport = async () => {
        setReportLoading(true)
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_acceptance_report' })
            })
            if (!res.ok) throw new Error('Failed to create report')
            toast.success('Da tao bien ban nghiem thu moi')
            router.refresh()
        } catch (error) {
            toast.error('Loi khi tao bien ban nghiem thu')
        } finally {
            setReportLoading(false)
        }
    }

    // Derive deadline from contracts or project end_date
    const contractEndDates = project.contracts?.map((c: any) => c.end_date).filter(Boolean) || []
    const deadline = project.end_date || (contractEndDates.length > 0 ? contractEndDates.sort().pop() : null)

    // Check if overdue
    const isOverdue = deadline && new Date(deadline) < new Date()

    const statusOptions = [
        { value: 'todo', label: 'Cho trien khai', icon: Clock },
        { value: 'in_progress', label: 'Dang thuc hien', icon: Play },
        { value: 'review', label: 'Dang nghiem thu', icon: Eye },
        { value: 'completed', label: 'Da hoan thanh', icon: CheckCircle },
    ]

    return (
        <div className="space-y-6">
            {/* Status & Management */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Quan ly du an</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Selector */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Trang thai du an</label>
                        <Select
                            defaultValue={project.status}
                            onValueChange={handleStatusChange}
                            disabled={statusLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                            <opt.icon className="h-3.5 w-3.5" />
                                            <span>{opt.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* PM/Account */}
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Nguoi quan ly (PM/Account)</p>
                            <p className="text-sm font-medium">{project.assigned_user?.full_name || "Chua gan"}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Thoi gian thuc hien</p>
                            <p className="text-sm font-medium">
                                {project.start_date ? formatDate(project.start_date) : "Chua thiet lap"} - {deadline ? formatDate(deadline) : "Chua thiet lap"}
                            </p>
                        </div>
                    </div>

                    {/* Deadline */}
                    {deadline && (
                        <>
                            <Separator />
                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${isOverdue
                                ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                                : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                                    <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                        {isOverdue ? 'Qua han' : 'Thoi han cuoi'}
                                    </span>
                                </div>
                                <span className={`text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                                    {formatDate(deadline)}
                                </span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Acceptance Reports */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Nghiem thu</CardTitle>
                    <CardDescription>Bien ban giao nhan va nghiem thu du an</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {project.acceptance_reports && project.acceptance_reports.length > 0 ? (
                        <div className="space-y-2">
                            {project.acceptance_reports.map((report: any) => (
                                <div key={report.id} className="p-3 border rounded-lg text-sm flex justify-between items-center hover:bg-muted/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{report.report_number}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(report.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={report.is_signed ? "default" : "secondary"} className="text-[10px]">
                                            {report.is_signed ? "Da ky" : "Cho ky"}
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
                        <p className="text-sm text-muted-foreground text-center py-4">Chua co bien ban nghiem thu.</p>
                    )}
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleCreateReport}
                        disabled={reportLoading}
                    >
                        {reportLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Tao bien ban nghiem thu moi
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
