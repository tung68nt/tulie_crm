'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createTaskAction } from '@/app/(dashboard)/workspace/actions'

const priorities = [
    { value: 'low', label: 'Thấp' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'high', label: 'Cao' },
    { value: 'urgent', label: 'Khẩn cấp' },
]

const categories = [
    { value: 'internal', label: 'Nội bộ' },
    { value: 'follow_up', label: 'Theo dõi' },
    { value: 'client_request', label: 'Yêu cầu KH' },
    { value: 'admin', label: 'Hành chính' },
]

interface QuickAddTaskDialogProps {
    defaultStatus?: string
    trigger?: React.ReactNode
    teamMembers?: { id: string; full_name: string }[]
}

export function QuickAddTaskDialog({ defaultStatus, trigger, teamMembers = [] }: QuickAddTaskDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        if (defaultStatus) {
            formData.set('status', defaultStatus)
        }

        const result = await createTaskAction(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        setLoading(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Tạo task mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề *</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Nhập tiêu đề task..."
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Mô tả chi tiết..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Priority + Category row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Ưu tiên</Label>
                            <Select name="priority" defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map(p => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Phân loại</Label>
                            <Select name="category" defaultValue="internal">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Due date + Assignee row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Deadline</Label>
                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Giao cho</Label>
                            <Select name="assigned_to">
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn người..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Huỷ
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Tạo task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
