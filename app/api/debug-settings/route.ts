import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Try writing a test key
        const testKey = 'debug_test_key_' + Date.now()
        const { error: writeError } = await supabase
            .from('system_settings')
            .upsert(
                { key: testKey, value: { works: true }, updated_at: new Date().toISOString() },
                { onConflict: 'key' }
            )

        if (writeError) {
            return NextResponse.json({ success: false, phase: 'write', error: writeError })
        }

        // Try reading it back
        const { data, error: readError } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', testKey)
            .single()

        if (readError) {
            return NextResponse.json({ success: false, phase: 'read', error: readError })
        }

        // Clean up
        await supabase.from('system_settings').delete().eq('key', testKey)

        return NextResponse.json({ success: true, data })
    } catch (err: any) {
        return NextResponse.json({ success: false, phase: 'catch', message: err.message })
    }
}
