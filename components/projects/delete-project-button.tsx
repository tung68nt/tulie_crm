'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteProject } from '@/lib/supabase/services/project-service'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteProjectButton({ projectId }: { projectId: string }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                await deleteProject(projectId)
                toast.success('Đã xóa dự án')
                setOpen(false)
                router.push('/projects')
                router.refresh()
            } catch (err: any) {
                toast.error(`Lỗi xóa dự án: ${err?.message || 'Thử lại sau'}`)
                console.error(err)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa dự án?</DialogTitle>
                    <DialogDescription>
                        Hành động này sẽ xóa vĩnh viễn dự án này và toàn bộ dữ liệu liên quan (báo giá, hợp đồng, tasks, v.v.). Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Hủy</Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Xác nhận xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
