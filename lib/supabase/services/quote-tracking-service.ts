'use server'

import { createAdminClient } from '../admin'

// ============================================================
// Quotation View Tracking Service
// ============================================================

interface StartViewParams {
    quotationId: string
    sessionId: string
    ipAddress?: string
    userAgent?: string
    referrer?: string
    deviceType?: string
    country?: string
}

interface PingViewParams {
    viewId: string
    durationSeconds: number
    maxScrollPercent: number
}

interface ViewInteraction {
    action: string
    timestamp: string
    details?: Record<string, unknown>
}

/**
 * Start a new view session — called when customer opens the quotation page
 */
export async function startView(params: StartViewParams) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('quotation_views')
            .insert({
                quotation_id: params.quotationId,
                session_id: params.sessionId,
                ip_address: params.ipAddress || null,
                user_agent: params.userAgent || null,
                referrer: params.referrer || null,
                device_type: params.deviceType || 'desktop',
                country: params.country || null,
                started_at: new Date().toISOString(),
                last_ping_at: new Date().toISOString()
            })
            .select('id')
            .single()

        if (error) {
            console.error('Error starting view:', error)
            return null
        }

        // Also update the quotation view_count, viewed_at
        try {
            const { error: rpcError } = await supabase.rpc('increment_quotation_view', { quote_id: params.quotationId })
            if (rpcError) throw new Error(rpcError.message)
        } catch {
            // Fallback: manual increment if RPC doesn't exist
            const { data: q } = await supabase
                .from('quotations')
                .select('view_count')
                .eq('id', params.quotationId)
                .single()

            await supabase
                .from('quotations')
                .update({
                    view_count: ((q as any)?.view_count || 0) + 1,
                    viewed_at: new Date().toISOString()
                })
                .eq('id', params.quotationId)
        }

        return data?.id || null
    } catch (err) {
        console.error('Error in startView:', err)
        return null
    }
}

/**
 * Ping an active view — update duration and scroll progress
 */
export async function pingView(params: PingViewParams) {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('quotation_views')
            .update({
                duration_seconds: params.durationSeconds,
                max_scroll_percent: params.maxScrollPercent,
                last_ping_at: new Date().toISOString()
            })
            .eq('id', params.viewId)

        if (error) {
            console.error('Error pinging view:', error)
            return false
        }

        return true
    } catch (err) {
        console.error('Error in pingView:', err)
        return false
    }
}

/**
 * Record a user interaction (print, accept, reject, etc.)
 */
export async function addInteraction(viewId: string, action: string, details?: Record<string, unknown>) {
    try {
        const supabase = createAdminClient()

        const interaction: ViewInteraction = {
            action,
            timestamp: new Date().toISOString(),
            details
        }

        // Append to existing interactions array
        try {
            const { error: rpcError } = await supabase.rpc('append_view_interaction', {
                view_id: viewId,
                interaction_data: interaction
            })
            if (rpcError) throw new Error(rpcError.message)
        } catch {
            // Fallback: fetch + update if RPC doesn't exist
            const { data: view } = await supabase
                .from('quotation_views')
                .select('interactions')
                .eq('id', viewId)
                .single()

            const existing = (view as any)?.interactions || []
            existing.push(interaction)

            const { error: updateError } = await supabase
                .from('quotation_views')
                .update({ interactions: existing })
                .eq('id', viewId)

            if (updateError) {
                console.error('Error adding interaction:', updateError)
                return false
            }
        }

        return true
    } catch (err) {
        console.error('Error in addInteraction:', err)
        return false
    }
}

/**
 * Get all views for a quotation (for dashboard analytics)
 */
export async function getViewsByQuotation(quotationId: string) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('quotation_views')
            .select('*')
            .eq('quotation_id', quotationId)
            .order('started_at', { ascending: false })
            .limit(100)

        if (error) {
            console.error('Error fetching views:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Error in getViewsByQuotation:', err)
        return []
    }
}

/**
 * Get aggregated stats for a quotation
 */
export async function getViewStats(quotationId: string) {
    try {
        const views = await getViewsByQuotation(quotationId)

        if (!views.length) {
            return {
                totalViews: 0,
                uniqueVisitors: 0,
                avgDuration: 0,
                maxDuration: 0,
                avgScroll: 0,
                maxScroll: 0,
                deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
                interactions: [] as string[],
                lastViewedAt: null as string | null
            }
        }

        const uniqueIps = new Set(views.map(v => v.ip_address).filter(Boolean))
        const durations = views.map(v => v.duration_seconds || 0)
        const scrolls = views.map(v => v.max_scroll_percent || 0)

        const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 }
        views.forEach(v => {
            const dt = (v.device_type || 'desktop') as keyof typeof deviceBreakdown
            if (dt in deviceBreakdown) deviceBreakdown[dt]++
        })

        const allInteractions: string[] = []
        views.forEach(v => {
            const interactions = v.interactions as ViewInteraction[] || []
            interactions.forEach(i => {
                if (!allInteractions.includes(i.action)) allInteractions.push(i.action)
            })
        })

        return {
            totalViews: views.length,
            uniqueVisitors: uniqueIps.size,
            avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
            maxDuration: Math.max(...durations),
            avgScroll: Math.round(scrolls.reduce((a, b) => a + b, 0) / scrolls.length),
            maxScroll: Math.max(...scrolls),
            deviceBreakdown,
            interactions: allInteractions,
            lastViewedAt: views[0]?.started_at || null
        }
    } catch (err) {
        console.error('Error in getViewStats:', err)
        return {
            totalViews: 0,
            uniqueVisitors: 0,
            avgDuration: 0,
            maxDuration: 0,
            avgScroll: 0,
            maxScroll: 0,
            deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
            interactions: [] as string[],
            lastViewedAt: null as string | null
        }
    }
}

/**
 * Get portal views for analytics (by project, customer, or token)
 */
export async function getPortalViews(filters: { projectId?: string; customerId?: string; portalToken?: string }) {
    try {
        const supabase = createAdminClient()

        let query = supabase
            .from('portal_views')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(100)

        if (filters.projectId) query = query.eq('project_id', filters.projectId)
        else if (filters.customerId) query = query.eq('customer_id', filters.customerId)
        else if (filters.portalToken) query = query.eq('portal_token', filters.portalToken)
        else return []

        const { data, error } = await query
        if (error) {
            console.error('Error fetching portal views:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Error in getPortalViews:', err)
        return []
    }
}
