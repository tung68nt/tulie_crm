import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText, isValidEmail, isValidPhone } from '@/lib/security/sanitize'
import { applyScopeFilter } from '@/lib/security/permissions'

// Use anon key for public form submissions only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/leads — Public endpoint for landing page form
 * Rate limited to prevent spam
 */
export async function POST(req: Request) {
    try {
        // Rate limit: 5 submissions per minute per IP
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 5,
            windowSeconds: 60,
            keyPrefix: 'leads:post',
        })
        if (rateLimitResult) return rateLimitResult

        const body = await req.json()
        const { full_name, company_name, phone, email, business_type, message } = body

        // Input validation
        const cleanName = sanitizeText(full_name, 200)
        const cleanPhone = sanitizeText(phone, 20)

        if (!cleanName || !cleanPhone) {
            return NextResponse.json(
                { error: 'Vui lòng điền họ tên và số điện thoại' },
                { status: 400 }
            )
        }

        if (!isValidPhone(cleanPhone)) {
            return NextResponse.json(
                { error: 'Số điện thoại không hợp lệ' },
                { status: 400 }
            )
        }

        if (email && !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Email không hợp lệ' },
                { status: 400 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data, error } = await supabase
            .from('leads')
            .insert({
                full_name: cleanName,
                company_name: sanitizeText(company_name, 200) || null,
                phone: cleanPhone,
                email: email ? sanitizeText(email, 320) : null,
                business_type: sanitizeText(business_type, 100) || null,
                message: sanitizeText(message, 2000) || null,
                status: 'new',
                source: 'landing_page',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}

/**
 * GET /api/leads — Authenticated endpoint for listing leads
 * Data scoped by role (admin=all, leader=team, staff=own)
 */
export async function GET() {
    try {
        const authResult = await requirePermission('leads', 'view')
        if (isAuthError(authResult)) return authResult

        const { supabase, user, teamMemberIds } = authResult

        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        query = applyScopeFilter(query, user, 'leads', teamMemberIds)

        const { data, error } = await query

        if (error) {
            console.error('Error fetching leads:', error)
            return NextResponse.json([], { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json([], { status: 500 })
    }
}

/**
 * PATCH /api/leads — Authenticated endpoint for updating leads
 * Requires 'edit' permission on leads resource
 */
export async function PATCH(req: Request) {
    try {
        const authResult = await requirePermission('leads', 'edit')
        if (isAuthError(authResult)) return authResult

        const { supabase } = authResult

        const body = await req.json()
        const { id, status, notes } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Validate status if provided
        const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost']
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const updates: Record<string, any> = { updated_at: new Date().toISOString() }
        if (status) updates.status = status
        if (notes !== undefined) updates.notes = sanitizeText(notes, 5000)

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
