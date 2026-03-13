import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/health — Public endpoint
 * Returns system health status (DB connectivity, memory, uptime)
 * 
 * Use for monitoring/uptime checks
 */
export async function GET() {
    const start = Date.now()
    const checks: Record<string, any> = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }

    // Check DB connectivity
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('users')
            .select('id')
            .limit(1)

        checks.database = error ? { status: 'error', message: error.message } : { status: 'ok' }
    } catch (e: any) {
        checks.database = { status: 'error', message: e.message }
        checks.status = 'degraded'
    }

    // Memory usage
    const mem = process.memoryUsage()
    checks.memory = {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024),
    }

    checks.responseTimeMs = Date.now() - start

    const status = checks.status === 'ok' ? 200 : 503
    return NextResponse.json(checks, { status })
}
