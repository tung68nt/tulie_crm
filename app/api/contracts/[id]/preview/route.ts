import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { generateDocument, getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

/**
 * GET /api/contracts/[id]/preview?type=contract
 * Returns HTML document directly — opens with a real URL in the browser
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: contractId } = await params
        const url = new URL(request.url)
        const type = url.searchParams.get('type') || 'contract'

        // Find template
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.type === type)
        if (!template) {
            return new Response('Template not found', { status: 404 })
        }

        // Get contract
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminSupabase = createAdminClient()
        const { data: contract, error } = await adminSupabase
            .from('contracts')
            .select('id, customer_id')
            .eq('id', contractId)
            .single()

        if (error || !contract) {
            return new Response('Contract not found', { status: 404 })
        }

        // Generate document
        const result = await generateDocument(
            template.id,
            contract.customer_id,
            contractId
        )

        const html = result.content || ''
        const DOCUMENT_LABELS: Record<string, string> = {
            contract: 'Hợp đồng kinh tế',
            order: 'Đơn đặt hàng',
            payment_request: 'Đề nghị thanh toán',
            delivery_minutes: 'Biên bản giao nhận',
            quotation: 'Báo giá',
        }
        const title = DOCUMENT_LABELS[type] || 'Document'

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${result.variables?.contract_number || contractId}</title>
    <style>
        @media print {
            @page { size: A4; margin: 15mm 20mm; }
            body > div { padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
    </style>
</head>
<body>${html}</body>
</html>`

        return new Response(fullHtml, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        })
    } catch (error: any) {
        console.error('Error previewing document:', error)
        return new Response('Failed to generate document', { status: 500 })
    }
}
