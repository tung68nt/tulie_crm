'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Plus, Save, Trash2, Loader2, ListTodo, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Project, ProjectTask, ProjectWorkItem } from '@/types'
import { updateProjectTasks, getProjectTasks } from '@/lib/supabase/services/task-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectTasksProps {
    project: Project
    workItems: ProjectWorkItem[]
}

export function ProjectTasks({ project, workItems }: ProjectTasksProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        const fetchTasks = async () => {
            const data = await getProjectTasks(project.id)
            setTasks(data.map(t => ({
                ...t,
                start_date: t.start_date ? new Date(t.start_date) : undefined,
                end_date: t.end_date ? new Date(t.end_date) : undefined,
            })))
        }
        fetchTasks()
    }, [project.id])

    const addTask = () => {
        setTasks([
            ...tasks,
            {
                id: `temp-${Date.now()}`,
                title: '',
                status: 'todo',
                priority: 'medium',
                work_item_id: null,
                start_date: new Date(),
                end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
        ])
    }

    const removeTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id))
    }

    const updateTask = (id: string, field: string, value: any) => {
        setTasks(
            tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        )
    }

    const handleSave = async () => {
        if (tasks.some(t => !t.title)) {
            toast.error('Vui lòng nhập tiêu đề cho tất cả các công việc')
            return
        }

        setIsLoading(true)
        try {
            const dataToSave = tasks.map(t => ({
                ...t,
                start_date: t.start_date?.toISOString(),
                end_date: t.end_date?.toISOString(),
            }))
            await updateProjectTasks(project.id, dataToSave)
            toast.success('Cập nhật danh sách công việc thành công')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold'
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'blocked': return 'bg-red-50 text-red-700 border-red-200'
            default: return 'bg-zinc-100 text-zinc-600 border-zinc-200'
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-zinc-900" />
                        Danh sách công việc chi tiết (To-do List)
                    </CardTitle>
                    <CardDescription className="font-normal text-xs">Quản lý tất cả đầu việc trong dự án, bao gồm các đầu việc thuộc hạng mục (Module).</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addTask}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm việc
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu công việc
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {tasks.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg font-normal">
                        Chưa có đầu việc nào được tạo.
                    </div>
                )}
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border rounded-xl items-center bg-card transition-all hover:border-slate-300">
                            <div className="md:col-span-4 flex items-center gap-3">
                                <span className="text-[10px] font-bold text-muted-foreground w-4">{index + 1}</span>
                                <div className="flex-1 space-y-1">
                                    <Input
                                        placeholder="Tên công việc..."
                                        value={task.title}
                                        onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                        className="h-8 border-none focus-visible:ring-0 px-0 font-semibold text-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={task.work_item_id || "none"}
                                            onValueChange={(v) => updateTask(task.id, 'work_item_id', v === "none" ? null : v)}
                                        >
                                            <SelectTrigger className="h-6 text-[10px] w-auto border-none bg-muted/50 px-2 rounded-full">
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="h-3 w-3 text-muted-foreground" />
                                                    <SelectValue placeholder="Chọn hạng mục..." />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-[11px]">Không thuộc hạng mục</SelectItem>
                                                {workItems.map((item) => (
                                                    <SelectItem key={item.id} value={item.id} className="text-[11px]">
                                                        {item.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Select value={task.status} onValueChange={(v) => updateTask(task.id, 'status', v)}>
                                    <SelectTrigger className={cn("h-8 text-[11px] font-bold rounded-full border-none", getStatusColor(task.status))}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo" className="text-[11px]">Chưa làm</SelectItem>
                                        <SelectItem value="in_progress" className="text-[11px]">Đang làm</SelectItem>
                                        <SelectItem value="completed" className="text-[11px]">Xong</SelectItem>
                                        <SelectItem value="blocked" className="text-[11px]">Vướng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-8 justify-start text-left font-normal text-[10px] rounded-lg border-zinc-100">
                                            <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                            {task.start_date ? format(task.start_date, 'dd/MM') : 'Bắt đầu'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={task.start_date} onSelect={(d) => updateTask(task.id, 'start_date', d)} />
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-8 justify-start text-left font-normal text-[10px] rounded-lg border-zinc-100">
                                            <CalendarIcon className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                            {task.end_date ? format(task.end_date, 'dd/MM') : 'Kết thúc'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={task.end_date} onSelect={(d) => updateTask(task.id, 'end_date', d)} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-1">
                                <Select value={task.priority} onValueChange={(v) => updateTask(task.id, 'priority', v)}>
                                    <SelectTrigger className="h-8 w-20 text-[10px] border-zinc-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low" className="text-[11px]">Thấp</SelectItem>
                                        <SelectItem value="medium" className="text-[11px]">Vừa</SelectItem>
                                        <SelectItem value="high" className="text-[11px]">Cao</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)} className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
