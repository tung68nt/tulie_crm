import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Skip Supabase auth check if credentials are not configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url') {
        // Allow all routes in development without Supabase
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

    // Do not run code between createServerClient and supabase.auth.getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes - redirect to system-login if not authenticated
    const protectedPaths = ['/dashboard', '/customers', '/quotations', '/contracts', '/invoices', '/products', '/finance', '/team', '/reports', '/settings']
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Public paths that don't require auth
    const publicPaths = ['/system-login', '/register', '/forgot-password', '/quote']
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (!user && isProtectedPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/system-login'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages AND root
    if (user) {
        // If on login page, go to dashboard
        if (request.nextUrl.pathname === '/system-login' || request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
        // If on root (now public welcome page), optionally redirect to dashboard? 
        // User might want to see the landing page. But usually a logged in user wants the app.
        // Let's redirect to dashboard for convenience if they hit root.
        if (request.nextUrl.pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
