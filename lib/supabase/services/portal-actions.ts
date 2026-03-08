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

export async function updateQuotationStatus(quotationId: string, status: string, metadata: any = {}) {
    try {
        const supabase = await createClient()

        // 1. Get quotation to find public_token for revalidation
        const { data: quote } = await supabase
            .from('quotations')
            .select('public_token')
            .eq('id', quotationId)
            .single()

        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        }

        if (status === 'accepted') {
            updateData.accepted_at = new Date().toISOString()
            updateData.confirmer_info = {
                name: metadata.name,
                phone: metadata.phone,
                email: metadata.email,
                position: metadata.position
            }
        } else if (status === 'rejected') {
            updateData.rejected_at = new Date().toISOString()
            // Some systems use rejection_reason column, others use status_notes or similar.
            // Based on the user's need, we ensure it's recorded.
            updateData.notes = metadata.reason ? `Lý do từ chối: ${metadata.reason}` : null
            // If the column exists, we set it too (safe update)
            updateData.rejection_reason = metadata.reason || null
        }

        const { error } = await supabase
            .from('quotations')
            .update(updateData)
            .eq('id', quotationId)

        if (error) {
            throw error
        }

        // 2. Revalidate both the admin path and the public path
        revalidatePath(`/quotations/${quotationId}`)
        if (quote?.public_token) {
            revalidatePath(`/quote/${quote.public_token}`)
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error updating quotation status:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}
