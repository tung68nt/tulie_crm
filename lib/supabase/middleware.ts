import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        // Verify Supabase credentials are properly configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
            // In development, allow pass-through; in production, this is a critical misconfiguration
            if (process.env.NODE_ENV === 'production') {
                console.error('CRITICAL: Supabase credentials not configured in production!')
            }
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Protected routes - redirect to system-login if not authenticated
        const protectedPaths = [
            '/dashboard', '/customers', '/quotations', '/contracts',
            '/invoices', '/products', '/finance', '/team', '/reports',
            '/settings', '/studio', '/helpdesk', '/templates', '/bundles',
            '/leads', '/deals', '/projects', '/profile',
        ]
        const isProtectedPath = protectedPaths.some(path =>
            request.nextUrl.pathname.startsWith(path)
        )

        if (!user && isProtectedPath) {
            const url = request.nextUrl.clone()
            url.pathname = '/system-login'
            return NextResponse.redirect(url)
        }

        // Redirect authenticated users away from auth pages AND root
        if (user) {
            if (['/system-login', '/login', '/register'].includes(request.nextUrl.pathname)) {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
            if (request.nextUrl.pathname === '/') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    } catch (error) {
        console.error('Middleware session update error:', error)
        // In case of error, just return the response and let the page handle it
        return supabaseResponse
    }

    return supabaseResponse
}
