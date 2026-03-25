import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    validateBody,
    quoteTrackingStartSchema,
    quoteTrackingPingSchema,
    quoteTrackingInteractionSchema,
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
 * POST /api/quote-tracking
 * 
 * Handles tracking events from the public quotation portal:
 * - start: Create a new view record
 * - ping: Update duration + scroll progress
 * - interaction: Record user actions (print, accept, reject)
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

        // Get IP & geo from headers
        const country = req.headers.get('x-vercel-ip-country') || null

        if (action === 'start') {
            const validation = validateBody(body, quoteTrackingStartSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            // Create view record
            const { data: result, error } = await supabase
                .from('quotation_views')
                .insert({
                    quotation_id: data.quotationId,
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
                console.error('Error creating view:', error)
                return NextResponse.json({ error: 'Failed to create view' }, { status: 500 })
            }

            // Increment quotation view_count (fire-and-forget)
            ;(async () => {
                try {
                    await supabase.rpc('increment_quotation_view', { quote_id: data.quotationId })
                } catch {
                    const { data: q } = await supabase
                        .from('quotations')
                        .select('view_count')
                        .eq('id', data.quotationId)
                        .single()

                    await supabase
                        .from('quotations')
                        .update({
                            view_count: ((q as any)?.view_count || 0) + 1,
                            viewed_at: new Date().toISOString()
                        })
                        .eq('id', data.quotationId)
                }
            })()

            return NextResponse.json({ viewId: result.id })
        }

        if (action === 'ping') {
            const validation = validateBody(body, quoteTrackingPingSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            const { error } = await supabase
                .from('quotation_views')
                .update({
                    duration_seconds: Math.min(data.durationSeconds || 0, 7200),
                    max_scroll_percent: Math.min(data.maxScrollPercent || 0, 100),
                    last_ping_at: new Date().toISOString()
                })
                .eq('id', data.viewId)

            if (error) {
                console.error('Error pinging view:', error)
                return NextResponse.json({ error: 'Failed to ping' }, { status: 500 })
            }

            return NextResponse.json({ ok: true })
        }

        if (action === 'interaction') {
            const validation = validateBody(body, quoteTrackingInteractionSchema)
            if (!validation.success) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }
            const data = validation.data

            // Fetch current interactions, append new one
            const { data: view } = await supabase
                .from('quotation_views')
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
                .from('quotation_views')
                .update({ interactions: existing })
                .eq('id', data.viewId)

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
