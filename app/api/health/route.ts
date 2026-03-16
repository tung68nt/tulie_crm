import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health — Public endpoint
 * Returns system health status (DB connectivity, memory, uptime)
 * 
 * Use for monitoring/uptime checks
 */
/**
 * GET /api/health — Public endpoint
 * Returns system health status (minimal info to prevent reconnaissance)
 * 
 * Use for monitoring/uptime checks
 */
export async function GET() {
    const start = Date.now()
    let dbStatus = 'ok'

    // Check DB connectivity
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('users')
            .select('id')
            .limit(1)

        if (error) dbStatus = 'error'
    } catch {
        dbStatus = 'error'
    }

    const status = dbStatus === 'ok' ? 'ok' : 'degraded'
    const httpStatus = status === 'ok' ? 200 : 503

    // SECURITY: Only expose minimal info publicly
    // Detailed metrics (memory, uptime) should require auth
    return NextResponse.json({
        status,
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - start,
    }, { status: httpStatus })
}
