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
import { Project, ProjectTask } from '@/types'
import { updateProjectTasks, getProjectTasks } from '@/lib/supabase/services/task-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface ProjectTasksProps {
    project: Project
}

export function ProjectTasks({ project }: ProjectTasksProps) {
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
            case 'completed': return 'bg-green-100 text-green-700 border-green-200'
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'blocked': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-primary" />
                        Danh sách công việc chi tiết (To-do List)
                    </CardTitle>
                    <CardDescription className="font-normal">Quản lý các đầu việc cụ thể để hiển thị tiến độ chi tiết cho khách hàng.</CardDescription>
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
                <div className="space-y-3">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border rounded-lg items-center bg-card transition-colors hover:bg-muted/30">
                            <div className="md:col-span-4 flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                                <Input
                                    placeholder="Tên công việc..."
                                    value={task.title}
                                    onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                    className="h-9 font-medium"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Select value={task.status} onValueChange={(v) => updateTask(task.id, 'status', v)}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">Chưa làm</SelectItem>
                                        <SelectItem value="in_progress">Đang làm</SelectItem>
                                        <SelectItem value="completed">Xong</SelectItem>
                                        <SelectItem value="blocked">Vướng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-9 justify-start text-left font-normal text-xs">
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                            {task.start_date ? format(task.start_date, 'dd/MM') : 'Bắt đầu'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={task.start_date} onSelect={(d) => updateTask(task.id, 'start_date', d)} />
                                    </PopoverContent>
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-9 justify-start text-left font-normal text-xs">
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                                    <SelectTrigger className="h-9 w-24 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Thấp</SelectItem>
                                        <SelectItem value="medium">Vừa</SelectItem>
                                        <SelectItem value="high">Cao</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)} className="h-9 w-9 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
