import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string, docId: string }> }
) {
    try {
        const { id, docId } = await params
        const body = await request.json()
        const is_visible = Boolean(body.is_visible)

        const supabase = await createClient()

        const { error } = await supabase
            .from('contract_documents')
            .update({ is_visible_on_portal: is_visible })
            .eq('id', docId)

        if (error) {
            console.error('Toggle visibility error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, is_visible })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
