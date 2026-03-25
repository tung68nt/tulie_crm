import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    validateBody,
    portalTrackingStartSchema,
    portalTrackingPingSchema,
    portalTrackingInteractionSchema,
    portalTrackingPageSchema,
} from '@/lib/security/validation'

// SECURITY: Simple in-memory rate limiter per IP (30 req/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
        return false
    }
    entry.count++
    return entry.count > RATE_LIMIT
}

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
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown'

        // SECURITY: Rate limit per IP
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const body = await req.json()
        const { action } = body

        const supabase = createAdminClient()
        const country = req.headers.get('x-vercel-ip-country') || null

        if (action === 'start') {
            const validation = validateBody(body, portalTrackingStartSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            const { data: result, error } = await supabase
                .from('portal_views')
                .insert({
                    project_id: data.projectId || null,
                    customer_id: data.customerId || null,
                    portal_token: data.portalToken,
                    session_id: data.sessionId,
                    ip_address: ip,
                    user_agent: data.userAgent || null,
                    referrer: data.referrer || null,
                    device_type: data.deviceType || 'desktop',
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

            return NextResponse.json({ viewId: result.id })
        }

        if (action === 'ping') {
            const validation = validateBody(body, portalTrackingPingSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            const { error } = await supabase
                .from('portal_views')
                .update({
                    duration_seconds: Math.min(data.durationSeconds || 0, 7200),
                    max_scroll_percent: Math.min(data.maxScrollPercent || 0, 100),
                    last_ping_at: new Date().toISOString()
                })
                .eq('id', data.viewId)

            if (error) {
                console.error('Error pinging portal view:', error)
                return NextResponse.json({ error: 'Failed to ping' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'interaction') {
            const validation = validateBody(body, portalTrackingInteractionSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            const { data: view } = await supabase
                .from('portal_views')
                .select('interactions')
                .eq('id', data.viewId)
                .single()

            const existing = (view?.interactions as any[]) || []
            existing.push({
                action: data.interactionType,
                timestamp: new Date().toISOString(),
                details: data.details || null
            })

            const { error } = await supabase
                .from('portal_views')
                .update({ interactions: existing })
                .eq('id', data.viewId)

            if (error) {
                console.error('Error adding portal interaction:', error)
                return NextResponse.json({ error: 'Failed to add interaction' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'page') {
            const validation = validateBody(body, portalTrackingPageSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            const { data: view } = await supabase
                .from('portal_views')
                .select('pages_viewed')
                .eq('id', data.viewId)
                .single()

            const pages = (view?.pages_viewed as any[]) || []
            pages.push({
                page: data.pageName,
                timestamp: new Date().toISOString()
            })

            const { error } = await supabase
                .from('portal_views')
                .update({ pages_viewed: pages })
                .eq('id', data.viewId)

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
