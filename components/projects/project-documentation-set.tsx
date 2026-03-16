'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, Clock, Eye, FileSignature, Files } from 'lucide-react'
import { Project, ProjectWorkItem } from '@/types'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { DocumentEditorDialog } from './document-editor-dialog'

interface ProjectDocumentationSetProps {
    project: Project
    workItems: ProjectWorkItem[]
}

export function ProjectDocumentationSet({ project, workItems }: ProjectDocumentationSetProps) {
    const [viewingDocId, setViewingDocId] = useState<string | null>(null)

    // Aggregate docs from all work items
    const allDocs = useMemo(() => {
        const docs: any[] = []
        workItems.forEach(item => {
            if (item.required_documents) {
                (item.required_documents as any[]).forEach(doc => {
                    docs.push({
                        ...doc,
                        workItemTitle: item.title,
                        workItemId: item.id
                    })
                })
            }
        })
        return docs
    }, [workItems])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                        <Files className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-sm font-semibold text-zinc-950 tracking-tight leading-none">Bộ chứng từ dự án</CardTitle>
                        <CardDescription className="text-[11px] font-medium">Lộ trình hoàn thiện hồ sơ pháp lý và thủ tục cho toàn bộ dự án.</CardDescription>
                    </div>
                </div>
                <Badge variant="secondary" className="font-semibold">
                    Full Documents
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-50">
                    {allDocs.length === 0 ? (
                        <div className="py-12 text-center text-zinc-400 text-sm italic">
                            Chưa có chứng từ nào được gán cho các hạng mục dự án.
                        </div>
                    ) : (
                        allDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-6 p-4 px-6 hover:bg-zinc-50/50 transition-colors group">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        doc.status === 'signed' ? "bg-emerald-500 text-white" : "bg-amber-50 text-amber-600 font-bold text-xs"
                                    )}>
                                        {doc.status === 'signed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{doc.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                                            {doc.workItemTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden md:flex items-center gap-8 text-right shrink-0">
                                    {doc.date && (
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-semibold text-muted-foreground">{formatDate(doc.date)}</p>
                                            <p className="text-[11px] font-medium text-muted-foreground">HẠN HOÀN THÀNH</p>
                                        </div>
                                    )}
                                    <Badge variant="secondary" className={cn(
                                        "font-medium",
                                        doc.status === 'signed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" />
                                        {doc.status === 'signed' ? "Đã hoàn thành" : "Chờ xử lý"}
                                    </Badge>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {doc.generated_doc_id && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-lg hover:bg-zinc-100"
                                                onClick={() => setViewingDocId(doc.generated_doc_id)}
                                            >
                                                <Eye className="w-4 h-4 text-zinc-400" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>

            <DocumentEditorDialog
                docId={viewingDocId}
                onClose={() => setViewingDocId(null)}
            />
        </Card>
    )
}
