'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DocumentEditor } from './document-editor'
import { getGeneratedDocumentById } from '@/lib/supabase/services/document-template-service'
import { GeneratedDocument } from '@/types'
import { Loader2 } from 'lucide-react'

interface DocumentEditorDialogProps {
    docId: string | null
    onClose: () => void
}

export function DocumentEditorDialog({ docId, onClose }: DocumentEditorDialogProps) {
    const [doc, setDoc] = useState<GeneratedDocument | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (docId) {
            const fetchDoc = async () => {
                setIsLoading(true)
                try {
                    const data = await getGeneratedDocumentById(docId)
                    setDoc(data)
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsLoading(false)
                }
            }
            fetchDoc()
        } else {
            setDoc(null)
        }
    }, [docId])

    return (
        <Dialog open={!!docId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                    </div>
                ) : doc ? (
                    <DocumentEditor document={doc} onBack={onClose} />
                ) : (
                    <div className="text-center p-20 text-muted-foreground">
                        Không tìm thấy tài liệu.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
