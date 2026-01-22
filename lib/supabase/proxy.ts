import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    // 1. Get User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // 2. Protect Routes
    // If accessing protected routes
    if (
        url.pathname.startsWith('/student') ||
        url.pathname.startsWith('/tutor') ||
        url.pathname.startsWith('/admin')
    ) {
        // A. Check Authentication
        if (!user) {
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        // B. Check Role Authorization
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // Student Routes
        if (url.pathname.startsWith('/student') && role !== 'student') {
            // Prevent Tutor/Admin from accessing Student Dashboard? 
            // Or maybe just redirect to their own dashboard.
            // For strictness: redirect to unauthorized or home.
            // Let's redirect to their correct dashboard to be helpful.
            if (role === 'tutor') {
                url.pathname = '/tutor/dashboard'
                return NextResponse.redirect(url)
            }
            if (role === 'admin') {
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // Tutor Routes
        if (url.pathname.startsWith('/tutor') && role !== 'tutor') {
            if (role === 'student') {
                url.pathname = '/student/dashboard'
                return NextResponse.redirect(url)
            }
            if (role === 'admin') {
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // Admin Routes
        if (url.pathname.startsWith('/admin') && role !== 'admin') {
            if (role === 'student') {
                url.pathname = '/student/dashboard'
                return NextResponse.redirect(url)
            }
            if (role === 'tutor') {
                url.pathname = '/tutor/dashboard'
                return NextResponse.redirect(url)
            }
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // 3. Auth Redirects (Login/Register)
    // If user is already logged in, redirect to their dashboard
    if (user && (url.pathname === '/auth/login' || url.pathname === '/auth/sign-up')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        if (role === 'student') {
            url.pathname = '/student/dashboard'
            return NextResponse.redirect(url)
        } else if (role === 'tutor') {
            url.pathname = '/tutor/dashboard'
            return NextResponse.redirect(url)
        } else if (role === 'admin') {
            url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
