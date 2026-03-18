import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/portal-tracking
 * 
 * Handles tracking events from the public customer portal:
 * - start: Create a new portal view record
 * - ping: Update duration + scroll progress
 * - interaction: Record user actions (view doc, confirm contract, etc.)
 * - page: Record which sections the user visited
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action } = body

        const supabase = createAdminClient()

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown'
        const country = req.headers.get('x-vercel-ip-country') || null

        if (action === 'start') {
            const { projectId, customerId, portalToken, sessionId, userAgent, referrer, deviceType } = body

            if (!portalToken || !sessionId) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }

            const { data, error } = await supabase
                .from('portal_views')
                .insert({
                    project_id: projectId || null,
                    customer_id: customerId || null,
                    portal_token: portalToken,
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
                console.error('Error creating portal view:', error)
                return NextResponse.json({ error: 'Failed to create view' }, { status: 500 })
            }

            return NextResponse.json({ viewId: data.id })
        }

        if (action === 'ping') {
            const { viewId, durationSeconds, maxScrollPercent } = body

            if (!viewId) {
                return NextResponse.json({ error: 'Missing viewId' }, { status: 400 })
            }

            const { error } = await supabase
                .from('portal_views')
                .update({
                    duration_seconds: Math.min(durationSeconds || 0, 7200),
                    max_scroll_percent: Math.min(maxScrollPercent || 0, 100),
                    last_ping_at: new Date().toISOString()
                })
                .eq('id', viewId)

            if (error) {
                console.error('Error pinging portal view:', error)
                return NextResponse.json({ error: 'Failed to ping' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'interaction') {
            const { viewId, interactionType, details } = body

            if (!viewId || !interactionType) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
            }

            const { data: view } = await supabase
                .from('portal_views')
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
                .from('portal_views')
                .update({ interactions: existing })
                .eq('id', viewId)

            if (error) {
                console.error('Error adding portal interaction:', error)
                return NextResponse.json({ error: 'Failed to add interaction' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'page') {
            const { viewId, pageName } = body

            if (!viewId || !pageName) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
            }

            const { data: view } = await supabase
                .from('portal_views')
                .select('pages_viewed')
                .eq('id', viewId)
                .single()

            const pages = (view?.pages_viewed as any[]) || []
            pages.push({
                page: pageName,
                timestamp: new Date().toISOString()
            })

            const { error } = await supabase
                .from('portal_views')
                .update({ pages_viewed: pages })
                .eq('id', viewId)

            if (error) {
                console.error('Error recording portal page:', error)
                return NextResponse.json({ error: 'Failed' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (err) {
        console.error('Portal tracking error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
