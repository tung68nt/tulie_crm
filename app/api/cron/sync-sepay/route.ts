import { NextRequest, NextResponse } from 'next/server'
import { syncTransactionsFromSePay } from '@/lib/supabase/services/payment-service'

/**
 * Cron Job: Auto-sync SePay transactions
 * 
 * GET /api/cron/sync-sepay?secret=CRON_SECRET
 * 
 * Dùng cho cron job tự động đối soát giao dịch.
 * Bảo mật bằng CRON_SECRET thay vì admin session (cron không có cookie).
 * 
 * Cấu hình cron (cron-job.org hoặc Cloud Scheduler):
 *   URL: https://crm.tulie.agency/api/cron/sync-sepay?secret=YOUR_SECRET
 *   Method: GET
 *   Schedule: every 10 minutes
 */
export async function GET(req: NextRequest) {
    try {
        // Verify cron secret
        const secret = req.nextUrl.searchParams.get('secret')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret) {
            console.error('[Cron SePay] CRON_SECRET not configured in environment')
            return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
        }

        if (secret !== cronSecret) {
            console.warn('[Cron SePay] Invalid secret — rejecting')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[Cron SePay] Starting auto-sync...')

        const result = await syncTransactionsFromSePay({ limit: 100 })

        console.log(`[Cron SePay] Done: ${result.processed}/${result.total} processed, ${result.matched} matched, ${result.errors} errors`)

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...result,
        })
    } catch (err: any) {
        console.error('[Cron SePay] Error:', err)
        return NextResponse.json({ 
            error: err.message || 'Internal server error',
            timestamp: new Date().toISOString(),
        }, { status: 500 })
    }
}
