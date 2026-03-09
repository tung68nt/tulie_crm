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
import { Loader2, BookOpen, CheckCircle2 } from 'lucide-react'
import { getDocumentBundles, getTemplateById, generateDocument, saveGeneratedDocument } from '@/lib/supabase/services/document-template-service'
import { updateWorkItem } from '@/lib/supabase/services/work-item-service'
import { DocumentBundle, RequiredDocument } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
            toast.error('Lỗi khi áp dụng bộ chứng từ')
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

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Bộ chứng từ mẫu</Label>
                        <Select value={selectedBundleId} onValueChange={setSelectedBundleId}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoading ? "Đang tải..." : "Chọn bộ mẫu..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {bundles.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                        {b.name} ({b.templates.length} loại giấy tờ)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedBundleId && (
                        <div className="bg-zinc-50 p-3 rounded-xl border border-dashed border-zinc-200">
                            <h6 className="text-[11px] font-bold text-zinc-500 uppercase mb-2">Giấy tờ sẽ khởi tạo:</h6>
                            <div className="space-y-1.5">
                                {bundles.find(b => b.id === selectedBundleId)?.templates.map((tid, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        Mẫu ID: {tid}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Bỏ qua</Button>
                    <Button
                        onClick={handleApplyBundle}
                        disabled={isSaving || !selectedBundleId}
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
