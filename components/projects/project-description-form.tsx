'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Save, X } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { updateProject } from '@/lib/supabase/services/project-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProjectDescriptionFormProps {
    project: Project
}

export function ProjectDescriptionForm({ project }: ProjectDescriptionFormProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [description, setDescription] = useState(project.description || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateProject(project.id, { description })
            toast.success('Đã cập nhật mô tả dự án')
            setIsEditing(false)
            router.refresh()
        } catch (error: any) {
            toast.error(`Lỗi cập nhật mô tả: ${error?.message || 'Thử lại sau'}`)
        } finally {
            setIsSaving(false)
        }
    }

    if (!isEditing) {
        return (
            <div className="group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-2 bg-white/80 backdrop-blur-sm border-zinc-200 shadow-sm rounded-lg hover:shadow-md transition-all">
                        <Edit className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Chỉnh sửa</span>
                    </Button>
                </div>
                <div className="text-sm p-4 bg-muted/20 rounded-xl border border-dashed whitespace-pre-line leading-relaxed min-h-[100px]">
                    {project.description || "Chưa có mô tả chi tiết cho dự án này."}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết cho dự án..."
                className="min-h-[200px] text-sm leading-relaxed"
            />
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu mô tả
                </Button>
            </div>
        </div>
    )
}
