import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/types'
import {
    Resource,
    Action,
    hasPermission,
    getDataScope,
    getTeamMemberIds,
    UserContext,
} from './permissions'

export interface AuthResult {
    user: UserContext
    supabase: Awaited<ReturnType<typeof createClient>>
    /** Team member IDs (populated for leaders) */
    teamMemberIds: string[]
}

/**
 * Verifies authentication for API routes.
 * Returns the authenticated user with full context, or a 401 response.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch role and team from users table
        const { data: profile } = await supabase
            .from('users')
            .select('role, team_id')
            .eq('id', user.id)
            .single()

        const userCtx: UserContext = {
            id: user.id,
            email: user.email ?? undefined,
            role: (profile?.role as UserRole) ?? 'staff',
            team_id: profile?.team_id ?? undefined,
        }

        // Pre-fetch team member IDs for leaders
        let teamMemberIds: string[] = []
        if (userCtx.role === 'leader' && userCtx.team_id) {
            teamMemberIds = await getTeamMemberIds(supabase, userCtx.id, userCtx.team_id)
        }

        return { user: userCtx, supabase, teamMemberIds }
    } catch {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        )
    }
}

/**
 * Verifies authentication AND checks user role.
 * Pass allowed roles (e.g., ['admin', 'leader']).
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthResult | NextResponse> {
    const authResult = await requireAuth()
    if (isAuthError(authResult)) return authResult

    if (!authResult.user.role || !allowedRoles.includes(authResult.user.role)) {
        return NextResponse.json(
            { error: 'Forbidden: insufficient permissions' },
            { status: 403 }
        )
    }

    return authResult
}

/**
 * Verifies authentication AND checks specific resource+action permission.
 * 
 * Usage:
 * ```ts
 * const auth = await requirePermission('customers', 'delete')
 * if (isAuthError(auth)) return auth
 * // User is authenticated AND has permission to delete customers
 * ```
 */
export async function requirePermission(
    resource: Resource,
    action: Action,
): Promise<AuthResult | NextResponse> {
    const authResult = await requireAuth()
    if (isAuthError(authResult)) return authResult

    if (!hasPermission(authResult.user.role, resource, action)) {
        return NextResponse.json(
            { error: `Forbidden: you don't have ${action} permission on ${resource}` },
            { status: 403 }
        )
    }

    return authResult
}

/**
 * Shortcut: require admin role
 */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
    return requireRole(['admin'])
}

/**
 * Type guard to check if requireAuth returned an error response
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
    return result instanceof NextResponse
}

/**
 * Helper: get data scope for current user on a resource.
 * Use after requireAuth to determine query filtering.
 */
export function getUserDataScope(user: UserContext, resource: Resource) {
    return getDataScope(user.role, resource)
}
