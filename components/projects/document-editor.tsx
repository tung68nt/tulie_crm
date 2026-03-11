'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Save, X, Loader2, Eye, FileEdit, ArrowLeft } from 'lucide-react'
import { saveGeneratedDocument } from '@/lib/supabase/services/document-template-service'
import { GeneratedDocument } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { sanitizeHtml } from '@/lib/security/sanitize'

interface DocumentEditorProps {
    document: GeneratedDocument
    onBack: () => void
}

export function DocumentEditor({ document: initialDoc, onBack }: DocumentEditorProps) {
    const [content, setContent] = useState(initialDoc.content)
    const [isSaving, setIsSaving] = useState(false)
    const [isPreview, setIsPreview] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveGeneratedDocument({
                id: initialDoc.id,
                content: content
            })
            toast.success('Đã lưu thay đổi văn bản')
            router.refresh()
        } catch (err) {
            toast.error('Lỗi khi lưu văn bản')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                    >
                        {isPreview ? (
                            <><FileEdit className="w-4 h-4 mr-2" /> Sửa nội dung</>
                        ) : (
                            <><Eye className="w-4 h-4 mr-2" /> Xem trước</>
                        )}
                    </Button>
                    {!isPreview && (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-zinc-900 text-white"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Lưu thay đổi
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-none shadow-premium overflow-hidden">
                <CardHeader className="bg-zinc-50 border-b">
                    <CardTitle className="text-md font-bold">{initialDoc.template_name}</CardTitle>
                    <CardDescription>Bạn có thể chỉnh sửa nội dung văn bản này để phù hợp với thỏa thuận riêng cho dự án.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isPreview ? (
                        <div
                            className="p-8 prose prose-zinc max-w-none bg-white min-h-[600px] overflow-auto"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                        />
                    ) : (
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[600px] p-8 font-mono text-sm border-none focus-visible:ring-0 resize-none"
                            placeholder="Nhập mã HTML hoặc nội dung văn bản tại đây..."
                        />
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 py-4">
                <p className="text-[10px] text-muted-foreground flex items-center italic">
                    Lưu ý: Nội dung sẽ được cập nhật trực tiếp trên trang Portal của khách hàng sau khi lưu.
                </p>
            </div>
        </div>
    )
}
