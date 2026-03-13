import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { applyScopeFilter } from '@/lib/security/permissions'

/**
 * GET /api/customers — Authenticated + Permission-scoped endpoint
 * Returns customer list filtered by user's role/data scope
 */
export async function GET() {
    try {
        const authResult = await requirePermission('customers', 'view')
        if (isAuthError(authResult)) return authResult

        const { supabase, user, teamMemberIds } = authResult

        let query = supabase
            .from('customers')
            .select('id, company_name, address, tax_code, email, phone, representative, position')
            .order('company_name', { ascending: true })
            .limit(200)

        // Apply role-based data scoping
        query = applyScopeFilter(query, user, 'customers', teamMemberIds)

        const { data, error } = await query

        if (error) {
            console.error('Error fetching customers:', error)
            return NextResponse.json([], { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Error:', error)
        return NextResponse.json([], { status: 500 })
    }
}
