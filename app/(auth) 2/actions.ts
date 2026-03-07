'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        console.log('Attempting login for:', email)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Supabase auth error:', error.message, 'Code:', error.code, 'Status:', error.status)
            return { error: `Đăng nhập thất bại [${error.code || error.status}]: ${error.message}` }
        }

        if (!data.user) {
            console.error('No user data returned after successful auth')
            return { error: 'Không tìm thấy thông tin người dùng' }
        }

        console.log('Login successful for UID:', data.user.id)
    } catch (err: any) {
        console.error('Login action critical error:', err.message || err)
        return { error: `Lỗi hệ thống: ${err.message || 'Unknown error'}` }
    }

    redirect('/dashboard')
}

export async function signout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/system-login')
}
