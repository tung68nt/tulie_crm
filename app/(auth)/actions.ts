'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Auth error:', error.code || error.status)
            return { error: `Đăng nhập thất bại: ${error.message}` }
        }

        if (!data.user) {
            return { error: 'Không tìm thấy thông tin người dùng' }
        }
    } catch (err: any) {
        console.error('Login action error')
        return { error: 'Lỗi hệ thống. Vui lòng thử lại.' }
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
