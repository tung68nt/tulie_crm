'use server'

import { createClient } from '../server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function setEntityPassword(tableName: string, entityId: string, password: string) {
    try {
        const supabase = await createClient()

        let passwordHash = null
        if (password) {
            passwordHash = await bcrypt.hash(password, 10)
        }

        const { error } = await supabase
            .from(tableName)
            .update({ password_hash: passwordHash })
            .eq('id', entityId)

        if (error) {
            throw error
        }

        revalidatePath(`/${tableName}/${entityId}`)
        return { success: true }
    } catch (err: any) {
        console.error('Error setting password:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}

// Deprecated: use setEntityPassword
export async function setQuotationPassword(quotationId: string, password: string) {
    return setEntityPassword('quotations', quotationId, password)
}

export async function verifyPortalPassword(token: string, password: string) {
    try {
        const supabase = await createClient()

        // 1. Fetch primary quotation and its project data
        const { data: quotation, error } = await supabase
            .from('quotations')
            .select('password_hash, project_id, project:projects(password_hash)')
            .eq('public_token', token)
            .single()

        if (error || !quotation) {
            return { success: false, error: 'Không tìm thấy trang yêu cầu' }
        }

        // Get effective hash (prefer quotation password, fallback to project password)
        const passwordHash = quotation.password_hash || (quotation.project as any)?.password_hash

        if (!passwordHash) {
            return { success: true } // No password required
        }

        // Compare hash
        const isValid = await bcrypt.compare(password, passwordHash)

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
