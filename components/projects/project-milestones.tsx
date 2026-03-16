'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Plus, Save, Trash2, Wallet, FileText } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ContractMilestone, Project } from '@/types'
import { updateProjectMilestones } from '@/lib/supabase/services/project-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectMilestonesProps {
    project: Project
}

export function ProjectMilestones({ project }: ProjectMilestonesProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [milestones, setMilestones] = useState<any[]>(
        project.milestones?.map(m => ({
            ...m,
            due_date: m.due_date ? new Date(m.due_date) : undefined,
            completed_at: m.completed_at ? new Date(m.completed_at) : undefined,
        })) || []
    )

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: `temp-${Date.now()}`, name: '', description: '', amount: 0, due_date: undefined, status: 'pending', type: 'work' },
        ])
    }

    const removeMilestone = (id: string) => {
        setMilestones(milestones.filter((m) => m.id !== id))
    }

    const updateMilestone = (id: string, field: string, value: any) => {
        setMilestones(
            milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        )
    }

    const handleSave = async () => {
        if (milestones.some(m => !m.name || !m.due_date)) {
            toast.error('Vui lòng nhập đầy đủ tên và hạn hoàn thành')
            return
        }

        setIsLoading(true)
        try {
            const dataToSave = milestones.map(m => ({
                ...m,
                due_date: m.due_date?.toISOString(),
                completed_at: m.completed_at?.toISOString(),
            }))
            await updateProjectMilestones(project.id, dataToSave)
            toast.success('Cập nhật lịch trình thành công')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(`Lỗi lưu lịch trình: ${error?.message || 'Thử lại sau'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Lịch trình triển khai & Thanh toán (Portal View)</CardTitle>
                        <CardDescription className="text-[11px] font-medium">Các mốc thời gian này sẽ hiển thị trực tiếp trên Portal của khách hàng.</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addMilestone}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm mốc
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu lịch trình
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {milestones.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg font-normal">
                        Chưa có mốc thời gian nào được thiết lập.
                    </div>
                )}
                <div className="space-y-4">
                    {milestones.map((m, index) => (
                        <div key={m.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">#{index + 1}</span>
                                    <Input
                                        placeholder="Tiêu đề đầu việc / Đợt thanh toán"
                                        value={m.name}
                                        onChange={(e) => updateMilestone(m.id, 'name', e.target.value)}
                                        className="h-9 font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={m.type} onValueChange={(val) => updateMilestone(m.id, 'type', val)}>
                                        <SelectTrigger className={cn(
                                            "h-9 w-32 text-[11px] font-semibold",
                                            m.type === 'payment' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                m.type === 'delivery' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="work" className="text-xs">Công việc</SelectItem>
                                            <SelectItem value="payment" className="text-xs">Thanh toán</SelectItem>
                                            <SelectItem value="delivery" className="text-xs">Bàn giao</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={m.status} onValueChange={(val) => updateMilestone(m.id, 'status', val)}>
                                        <SelectTrigger className={cn(
                                            "h-9 w-32 text-[11px] font-semibold",
                                            m.status === 'completed' ? "bg-primary text-primary-foreground" :
                                                m.status === 'overdue' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending" className="text-xs">Chờ xử lý</SelectItem>
                                            <SelectItem value="completed" className="text-xs">Hoàn thành</SelectItem>
                                            <SelectItem value="overdue" className="text-xs">Trễ hạn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)} className="h-9 w-9 text-red-300 hover:text-red-500 hover:bg-rose-50 rounded-full transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-muted-foreground font-medium">Mô tả / Sản phẩm bàn giao</Label>
                                    <Input
                                        placeholder="Ghi chú chi tiết..."
                                        value={m.description || ''}
                                        onChange={(e) => updateMilestone(m.id, 'description', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-muted-foreground font-medium">Hạn hoàn thành (Dự kiến)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full h-9 justify-start text-left font-normal text-xs">
                                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                {m.due_date ? format(m.due_date, 'dd/MM/yyyy') : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={m.due_date} onSelect={(date) => updateMilestone(m.id, 'due_date', date)} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-muted-foreground font-medium">
                                        {m.type === 'payment' ? 'Số tiền (VNĐ)' : 'Ngày thực tế'}
                                    </Label>
                                    {m.type === 'payment' ? (
                                        <Input
                                            type="number"
                                            value={m.amount}
                                            onChange={(e) => updateMilestone(m.id, 'amount', parseInt(e.target.value) || 0)}
                                            className="h-9 text-xs"
                                        />
                                    ) : (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full h-9 justify-start text-left font-normal text-xs border-dashed">
                                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                    {m.completed_at ? format(m.completed_at, 'dd/MM/yyyy') : 'Chưa hoàn thành'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={m.completed_at} onSelect={(date) => updateMilestone(m.id, 'completed_at', date)} />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
