import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthResult {
    user: { id: string; email?: string; role?: string }
    supabase: Awaited<ReturnType<typeof createClient>>
}

/**
 * Verifies authentication for API routes.
 * Returns the authenticated user and supabase client, or a 401 response.
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

        return { user: { id: user.id, email: user.email ?? undefined }, supabase }
    } catch {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        )
    }
}

/**
 * Type guard to check if requireAuth returned an error response
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
    return result instanceof NextResponse
}
