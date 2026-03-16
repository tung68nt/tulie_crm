'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Users, Calendar, AlertCircle, FileCheck, Plus, CheckCircle, Clock, Play, Eye, Save
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils/format'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants/status'
import { AcceptancePDFButton } from '@/components/projects/acceptance-pdf-button'
import { toast } from 'sonner'

interface ProjectSidebarProps {
    project: any
    teamMembers?: any[]
}

export function ProjectSidebar({ project, teamMembers = [] }: ProjectSidebarProps) {
    const router = useRouter()
    const [statusLoading, setStatusLoading] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [assignee, setAssignee] = useState(project.assigned_to || '')
    const [startDate, setStartDate] = useState(project.start_date?.split('T')[0] || '')
    const [endDate, setEndDate] = useState(project.end_date?.split('T')[0] || '')

    const handleStatusChange = async (newStatus: string) => {
        setStatusLoading(true)
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Đã cập nhật trạng thái dự án')
            router.refresh()
        } catch (err: any) {
            toast.error(`Lỗi cập nhật trạng thái: ${err?.message || 'Thử lại sau'}`)
        } finally {
            setStatusLoading(false)
        }
    }

    const handleSaveDetails = async () => {
        setSaving(true)
        try {
            const updates: any = {}
            if (startDate) updates.start_date = startDate
            if (endDate) updates.end_date = endDate
            if (assignee) updates.assigned_to = assignee

            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Đã lưu thông tin quản lý')
            router.refresh()
        } catch (err: any) {
            toast.error(`Lỗi lưu thông tin: ${err?.message || 'Thử lại sau'}`)
        } finally {
            setSaving(false)
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
            const data = await res.json()
            if (!res.ok) {
                const errMsg = data?.error || 'Lỗi không xác định'
                // Check common causes
                if (errMsg.includes('relation') && errMsg.includes('does not exist')) {
                    toast.error('Bảng acceptance_reports chưa tồn tại trong database. Cần chạy migration.', { duration: 8000 })
                } else if (errMsg.includes('permission') || errMsg.includes('RLS')) {
                    toast.error(`Lỗi quyền truy cập: ${errMsg}`, { duration: 6000 })
                } else {
                    toast.error(`Lỗi tạo nghiệm thu: ${errMsg}`, { duration: 6000 })
                }
                return
            }
            toast.success('Đã tạo biên bản nghiệm thu mới')
            router.refresh()
        } catch (error: any) {
            toast.error(`Lỗi hệ thống: ${error.message || 'Không thể kết nối server'}`, { duration: 6000 })
        } finally {
            setReportLoading(false)
        }
    }

    // Derive deadline
    const deadline = endDate || project.end_date
    const isOverdue = deadline && new Date(deadline) < new Date()

    const statusOptions = [
        { value: 'todo', label: 'Chờ triển khai', icon: Clock },
        { value: 'in_progress', label: 'Đang thực hiện', icon: Play },
        { value: 'review', label: 'Đang nghiệm thu', icon: Eye },
        { value: 'completed', label: 'Đã hoàn thành', icon: CheckCircle },
    ]

    return (
        <div className="space-y-6">
            {/* Status & Management */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Quản lý dự án</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Selector */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Trạng thái dự án</label>
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

                    {/* PM/Account Assignment */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Người quản lý (PM/Account)</label>
                        {teamMembers.length > 0 ? (
                            <Select value={assignee} onValueChange={setAssignee}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn người phụ trách" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm font-medium">{project.assigned_user?.full_name || "Chưa gán"}</p>
                        )}
                    </div>

                    {/* Timeline Setup */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Ngày Khởi tạo</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <ShadcnCalendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        locale={vi}
                                        selected={startDate ? new Date(startDate) : undefined}
                                        onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Ngày Đóng Dự án</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        {endDate ? format(new Date(endDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <ShadcnCalendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        locale={vi}
                                        selected={endDate ? new Date(endDate) : undefined}
                                        onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleSaveDetails}
                        disabled={saving}
                    >
                        {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Lưu thay đổi
                    </Button>

                    {/* Deadline Alert */}
                    {deadline && (
                        <>
                            <Separator />
                            <div className={cn(
                                "flex justify-between items-center p-3 rounded-lg border",
                                isOverdue ? "bg-destructive/10 border-destructive/20" : "bg-muted border-border"
                            )}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className={cn("h-4 w-4", isOverdue ? "text-destructive" : "text-muted-foreground")} />
                                    <span className={cn("text-[11px] font-semibold", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                        {isOverdue ? 'TRỄ HẠN DỰ KIẾN' : 'HẠN HOÀN THÀNH'}
                                    </span>
                                </div>
                                <span className={cn("text-xs font-semibold", isOverdue ? "text-destructive" : "text-foreground")}>
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
                    <CardTitle className="text-base font-semibold">Nghiệm thu</CardTitle>
                    <CardDescription>Biên bản giao nhận và nghiệm thu dự án</CardDescription>
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
                                        <Badge variant={report.is_signed ? "default" : "secondary"} className="text-[11px]">
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
                        <p className="text-sm text-muted-foreground text-center py-4">Chưa có biên bản nghiệm thu.</p>
                    )}
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleCreateReport}
                        disabled={reportLoading}
                    >
                        {reportLoading ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Tạo biên bản nghiệm thu mới
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
