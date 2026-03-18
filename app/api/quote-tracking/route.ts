import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/quote-tracking
 * 
 * Handles tracking events from the public quotation portal:
 * - start: Create a new view record
 * - ping: Update duration + scroll progress
 * - interaction: Record user actions (print, accept, reject)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action } = body

        const supabase = createAdminClient()

        // Get IP & geo from headers
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown'
        const country = req.headers.get('x-vercel-ip-country') || null

        if (action === 'start') {
            const { quotationId, sessionId, userAgent, referrer, deviceType } = body

            if (!quotationId || !sessionId) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            // Create view record
            const { data, error } = await supabase
                .from('quotation_views')
                .insert({
                    quotation_id: quotationId,
                    session_id: sessionId,
                    ip_address: ip,
                    user_agent: userAgent || null,
                    referrer: referrer || null,
                    device_type: deviceType || 'desktop',
                    country: country,
                    started_at: new Date().toISOString(),
                    last_ping_at: new Date().toISOString()
                })
                .select('id')
                .single()

            if (error) {
                console.error('Error creating view:', error)
                return NextResponse.json({ error: 'Failed to create view' }, { status: 500 })
            }

            // Increment quotation view_count (fire-and-forget)
            ;(async () => {
                try {
                    await supabase.rpc('increment_quotation_view', { quote_id: quotationId })
                } catch {
                    const { data: q } = await supabase
                        .from('quotations')
                        .select('view_count')
                        .eq('id', quotationId)
                        .single()

                    await supabase
                        .from('quotations')
                        .update({
                            view_count: ((q as any)?.view_count || 0) + 1,
                            viewed_at: new Date().toISOString()
                        })
                        .eq('id', quotationId)
                }
            })()

            return NextResponse.json({ viewId: data.id })
        }

        if (action === 'ping') {
            const { viewId, durationSeconds, maxScrollPercent } = body

            if (!viewId) {
                return NextResponse.json({ error: 'Missing viewId' }, { status: 400 })
            }

            const { error } = await supabase
                .from('quotation_views')
                .update({
                    duration_seconds: Math.min(durationSeconds || 0, 7200), // Cap at 2h
                    max_scroll_percent: Math.min(maxScrollPercent || 0, 100),
                    last_ping_at: new Date().toISOString()
                })
                .eq('id', viewId)

            if (error) {
                console.error('Error pinging view:', error)
                return NextResponse.json({ error: 'Failed to ping' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'interaction') {
            const { viewId, interactionType, details } = body

            if (!viewId || !interactionType) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
            }

            // Fetch current interactions, append new one
            const { data: view } = await supabase
                .from('quotation_views')
                .select('interactions')
                .eq('id', viewId)
                .single()

            const existing = (view?.interactions as any[]) || []
            existing.push({
                action: interactionType,
                timestamp: new Date().toISOString(),
                details: details || null
            })

            const { error } = await supabase
                .from('quotation_views')
                .update({ interactions: existing })
                .eq('id', viewId)

            if (error) {
                console.error('Error adding interaction:', error)
                return NextResponse.json({ error: 'Failed to add interaction' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (err) {
        console.error('Quote tracking error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
