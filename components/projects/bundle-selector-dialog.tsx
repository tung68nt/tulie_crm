'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getDocumentBundles, getTemplateById, generateDocument, saveGeneratedDocument } from '@/lib/supabase/services/document-template-service'
import { updateWorkItem } from '@/lib/supabase/services/work-item-service'
import { DocumentBundle, RequiredDocument } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface BundleSelectorDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    workItem: any
    project: any
}

export function BundleSelectorDialog({ isOpen, onOpenChange, workItem, project }: BundleSelectorDialogProps) {
    const [bundles, setBundles] = useState<DocumentBundle[]>([])
    const [selectedBundleId, setSelectedBundleId] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            const fetchBundles = async () => {
                setIsLoading(true)
                try {
                    const data = await getDocumentBundles()
                    setBundles(data)
                } catch (err) {
                    toast.error('Không thể tải danh sách bộ chứng từ')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchBundles()
        }
    }, [isOpen])

    const handleApplyBundle = async () => {
        if (!selectedBundleId) return

        setIsSaving(true)
        try {
            const bundle = bundles.find(b => b.id === selectedBundleId)
            if (!bundle) return

            const generatedDocs: RequiredDocument[] = []

            for (const templateId of bundle.templates) {
                const template = await getTemplateById(templateId)
                if (!template) continue

                // 1. Generate content
                const { content } = await generateDocument(
                    templateId,
                    project.customer_id,
                    workItem.contract_id || undefined,
                    {
                        work_item_title: workItem.title,
                        project_name: project.title
                    }
                )

                // 2. Save generated document (Scoped to this project/work item)
                const doc = await saveGeneratedDocument({
                    bundle_id: bundle.id,
                    template_id: templateId,
                    template_name: template.name,
                    content: content,
                    status: 'draft'
                })

                generatedDocs.push({
                    title: template.name,
                    status: 'pending',
                    template_id: templateId,
                    generated_doc_id: doc.id
                })
            }

            // 3. Update work item with the new bundle and document set
            await updateWorkItem(workItem.id, {
                bundle_id: bundle.id,
                required_documents: generatedDocs
            } as any)

            toast.success('Đã áp dụng bộ chứng từ và khởi tạo văn bản')
            onOpenChange(false)
            router.refresh()
        } catch (err) {
            console.error(err)
            toast.error(`Lỗi áp dụng bộ chứng từ: ${(err as any)?.message || 'Thử lại sau'}`)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-zinc-500" />
                        Chọn bộ chứng từ
                    </DialogTitle>
                    <DialogDescription>
                        Chọn bộ mẫu giấy tờ phù hợp cho hạng mục <strong>{workItem?.title}</strong>.
                        Hệ thống sẽ tự động tạo dự thảo dựa trên thông tin dự án.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">Chọn bộ mẫu phù hợp</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <LoadingSpinner size="md" />
                                    <p className="text-xs text-zinc-400">Đang tải danh sách...</p>
                                </div>
                            ) : bundles.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl">
                                    <p className="text-xs text-zinc-400">Chưa có bộ mẫu nào. Vui lòng tạo trong Cài đặt.</p>
                                </div>
                            ) : (
                                bundles.map((b) => (
                                    <div
                                        key={b.id}
                                        className={cn(
                                            "relative p-4 rounded-lg border transition-all cursor-pointer group",
                                            selectedBundleId === b.id
                                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                                : "bg-card border-border hover:border-ring"
                                        )}
                                        onClick={() => setSelectedBundleId(b.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h6 className="font-semibold text-sm">{b.name}</h6>
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border flex items-center justify-center",
                                                selectedBundleId === b.id ? "border-primary-foreground bg-primary-foreground" : "border-muted-foreground/30 group-hover:border-muted-foreground"
                                            )}>                                                {selectedBundleId === b.id && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "text-[11px] mb-3 leading-relaxed",
                                            selectedBundleId === b.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}>
                                            {b.description || `Gồm ${b.templates.length} loại giấy tờ chuẩn cho dự án.`}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {b.templates.map((_, i) => (
                                                <div key={i} className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    selectedBundleId === b.id ? "bg-primary-foreground/40" : "bg-muted-foreground/30"
                                                )} />
                                            ))}
                                            <span className={cn(
                                                "text-[11px] font-medium ml-1",
                                                selectedBundleId === b.id ? "text-primary-foreground/60" : "text-muted-foreground"
                                            )}>
                                                {b.templates.length} FILES
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Bỏ qua</Button>
                    <Button
                        onClick={handleApplyBundle}
                        disabled={isSaving || !selectedBundleId}
                        className=""
                    >
                        {isSaving ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Đang khởi tạo...
                            </>
                        ) : (
                            'Áp dụng & Khởi tạo'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
