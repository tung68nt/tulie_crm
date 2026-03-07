import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { error } = await supabase.from('document_templates').delete().neq('id', 'default-0')
    if (error) {
        return NextResponse.json({ error: error.message })
    }
    return NextResponse.json({ success: true, message: "Deleted custom templates." })
}
