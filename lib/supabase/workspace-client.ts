import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for querying the `workspace` schema.
 * Use this in CRM pages that need the upgraded workspace data
 * (tasks with Eisenhower, cycles, etc.)
 * 
 * The default createClient() in server.ts continues to query `public` schema (CRM).
 * This is an additional client specifically for workspace operations.
 * 
 * Example usage:
 *   const ws = await createWorkspaceClient()
 *   const { data: tasks } = await ws.from('tasks').select('*')
 *   // This queries workspace.tasks (not public.workspace_tasks)
 */
export async function createWorkspaceClient() {
    const cookieStore = await cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        throw new Error('Supabase environment variables are missing')
    }

    return createServerClient(
        url,
        anonKey,
        {
            db: {
                schema: 'workspace',
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored in Server Components
                    }
                },
            },
        }
    )
}
