'use server'

import { createClient } from '../server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function setQuotationPassword(quotationId: string, password: string) {
    try {
        const supabase = await createClient()

        let passwordHash = null
        if (password) {
            passwordHash = await bcrypt.hash(password, 10)
        }

        const { error } = await supabase
            .from('quotations')
            .update({ password_hash: passwordHash })
            .eq('id', quotationId)

        if (error) {
            throw error
        }

        revalidatePath(`/quotations/${quotationId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Error setting password:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}

export async function verifyPortalPassword(token: string, password: string) {
    try {
        const supabase = await createClient()

        // Fetch just the hash to verify
        const { data: quotation, error } = await supabase
            .from('quotations')
            .select('password_hash')
            .eq('public_token', token)
            .single()

        if (error || !quotation) {
            return { success: false, error: 'Không tìm thấy trang yêu cầu' }
        }

        if (!quotation.password_hash) {
            return { success: true } // No password required
        }

        // Compare hash
        const isValid = await bcrypt.compare(password, quotation.password_hash)

        if (!isValid) {
            return { success: false, error: 'Mật khẩu không chính xác' }
        }

        // Set secure cookie
        const cookieStore = await cookies()
        cookieStore.set(`portal_auth_${token}`, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        })

        revalidatePath(`/portal/${token}`)
        return { success: true }
    } catch (err: any) {
        console.error('Password verification error:', err)
        return { success: false, error: 'Lỗi hệ thống' }
    }
}
