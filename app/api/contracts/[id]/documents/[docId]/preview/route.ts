import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/contracts/[id]/documents/[docId]/preview
 * Returns the stored HTML content of a specific generated document
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId, docId } = await params
        const supabase = createAdminClient()

        const { data: doc, error } = await supabase
            .from('contract_documents')
            .select('*')
            .eq('id', docId)
            .eq('contract_id', contractId)
            .single()

        if (error || !doc) {
            return new Response('Document not found', { status: 404 })
        }

        const DOC_LABELS: Record<string, string> = {
            contract: 'Hợp đồng kinh tế',
            order: 'Đơn đặt hàng',
            payment_request: 'Đề nghị thanh toán',
            delivery_minutes: 'Biên bản giao nhận',
        }
        const title = DOC_LABELS[doc.type] || 'Document'

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${doc.doc_number || contractId}</title>
    <style>
        @media print {
            @page { size: A4; margin: 15mm 20mm; }
            body > div { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
    </style>
</head>
<body>${doc.content}</body>
</html>`

        return new Response(fullHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (error: any) {
        console.error('Error previewing document:', error)
        return new Response('Failed to load document', { status: 500 })
    }
}
