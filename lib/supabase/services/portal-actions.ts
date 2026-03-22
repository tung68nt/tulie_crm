'use server'

import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

import { sanitizeText } from '../../security/sanitize'

// HMAC helper for portal auth cookie signing
const PORTAL_SECRET = process.env.PORTAL_SECRET || process.env.NEXTAUTH_SECRET
if (!PORTAL_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: PORTAL_SECRET environment variable is not set in production!')
}
const EFFECTIVE_PORTAL_SECRET = PORTAL_SECRET || 'dev-only-portal-secret'

export async function signPortalToken(token: string): Promise<string> {
    return crypto.createHmac('sha256', EFFECTIVE_PORTAL_SECRET).update(token).digest('hex')
}

// SECURITY: Only these tables support password protection
const ALLOWED_PASSWORD_TABLES = ['quotations', 'projects', 'contracts'] as const
type PasswordTable = typeof ALLOWED_PASSWORD_TABLES[number]

export async function setEntityPassword(tableName: string, entityId: string, password: string) {
    try {
        // SECURITY: Whitelist table names to prevent arbitrary table writes
        if (!ALLOWED_PASSWORD_TABLES.includes(tableName as PasswordTable)) {
            return { success: false, error: 'Table không được hỗ trợ' }
        }

        const supabase = await createClient()

        let passwordHash = null
        if (password) {
            passwordHash = await bcrypt.hash(password, 10)
        }

        const updateData: Record<string, unknown> = { password_hash: passwordHash }

        const { error } = await supabase
            .from(tableName)
            .update(updateData)
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

/**
 * @deprecated SECURITY: Plaintext password retrieval is disabled.
 * Passwords are stored as hashes only. This function always returns null.
 */
export async function getEntityPasswordPlain(_tableName: string, _entityId: string) {
    // SECURITY: Never return plaintext passwords — hash-only storage
    return { password: null }
}

// Deprecated: use setEntityPassword
export async function setQuotationPassword(quotationId: string, password: string) {
    return setEntityPassword('quotations', quotationId, password)
}

export async function verifyPortalPassword(token: string, password: string) {
    try {
        // SECURITY: Use admin client — portal visitors have no session,
        // and we verify token ownership before any data access
        const supabase = createAdminClient()

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

        // Set HMAC-signed secure cookie
        const cookieStore = await cookies()
        const signedValue = await signPortalToken(token)
        cookieStore.set(`portal_auth_${token}`, signedValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/portal'  // SECURITY: Scoped to portal paths only, not entire domain
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
        // SECURITY: Use admin client — called from public quote view (no session)
        const supabase = createAdminClient()

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
            // 1. Get original quotation with items for cloning
            const { data: original, error: fetchErr } = await supabase
                .from('quotations')
                .select('*, items:quotation_items(*)')
                .eq('id', quotationId)
                .single()
            
            if (fetchErr || !original) throw fetchErr || new Error('Không tìm thấy báo giá gốc')

            // 2. Filter items to keep only selected ones (or all if not specified)
            const selectedItemIds = metadata.selectedItemIds || []
            const confirmedItems = original.items.filter((item: any) => 
                !item.is_optional || selectedItemIds.includes(item.id)
            )

            // 3. Prepare the NEW record (The Accepted Version)
            const newQuotation: any = {
                ...original,
                id: undefined, // New ID
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                accepted_at: new Date().toISOString(),
                status: 'accepted',
                confirmer_info: {
                    name: sanitizeText(metadata.name || '', 200),
                    phone: sanitizeText(metadata.phone || '', 20),
                    email: sanitizeText(metadata.email || '', 320),
                    position: sanitizeText(metadata.position || '', 200)
                },
                // Append (Xác nhận) to number or just same? User said "tạo version mới"
                // Usually CRM shows version trail.
                quotation_number: `${original.quotation_number}-ACCEPTED` // Or something similar
            }
            
            // Remove identity / relation fields for insert
            delete newQuotation.id
            delete newQuotation.items
            delete newQuotation.public_token // Generate new token

            // 4. Insert THE ACCEPTED CLONE
            const { data: acceptedClone, error: cloneErr } = await supabase
                .from('quotations')
                .insert([newQuotation])
                .select()
                .single()
            
            if (cloneErr) throw cloneErr

            // 5. Insert CLONED ITEMS
            const clonedItems = confirmedItems.map((item: any) => ({
                ...item,
                id: undefined,
                quotation_id: acceptedClone.id,
                created_at: undefined,
                updated_at: undefined
            }))
            
            const { error: itemErr } = await supabase
                .from('quotation_items')
                .insert(clonedItems)
            
            if (itemErr) throw itemErr

            // 6. Update ORIGINAL and SIBLINGS to 'expired' or 'sent'
            // The original stays as record of proposal.
            await supabase
                .from('quotations')
                .update({ 
                    status: 'expired', 
                    updated_at: new Date().toISOString(),
                    notes: `Hết hạn do đã xác nhận phiên bản ${acceptedClone.quotation_number}`
                })
                .eq('deal_id', original.deal_id)
                .neq('id', acceptedClone.id)
                .in('status', ['draft', 'sent', 'viewed'])

            // 7. Auto-tick "Báo giá" in work item document procedures
            if (original.project_id) {
                const { data: workItems } = await supabase
                    .from('work_items')
                    .select('id, required_documents')
                    .eq('project_id', original.project_id)

                for (const wi of workItems || []) {
                    const docs = (wi.required_documents || []).map((d: any) =>
                        d.title?.includes('Báo giá')
                            ? { ...d, status: 'signed', date: new Date().toISOString() }
                            : d
                    )
                    await supabase.from('work_items').update({ required_documents: docs }).eq('id', wi.id)
                }
            }

            revalidatePath(`/quotations/${quotationId}`)
            revalidatePath(`/quotations/${acceptedClone.id}`)
            if (original.public_token) revalidatePath(`/quote/${original.public_token}`)
            if (acceptedClone.public_token) revalidatePath(`/quote/${acceptedClone.public_token}`)

            return { success: true }

        } else if (status === 'rejected') {
            const { error, data } = await supabase
                .from('quotations')
                .update({
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                    rejection_reason: metadata.reason ? sanitizeText(metadata.reason, 2000) : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', quotationId)
                .select('deal_id, public_token')
                .single()

            if (error) throw error

            revalidatePath(`/quotations/${quotationId}`)
            if (data?.public_token) revalidatePath(`/quote/${data.public_token}`)
            return { success: true }
        }
    } catch (err: any) {
        console.error('Error updating quotation status:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}

export async function confirmContractFromPortal(
    token: string,
    contractId: string,
    confirmerInfo: { name: string; phone: string; email: string; position?: string }
) {
    try {
        // SECURITY: Use admin client — portal visitors have no session,
        // token is verified below before any mutations
        const supabase = createAdminClient()

        // 1. Verify token → get project_id
        const { data: qData } = await supabase
            .from('quotations')
            .select('project_id')
            .eq('public_token', token)
            .single()

        if (!qData?.project_id) {
            throw new Error('Không tìm thấy dự án liên kết')
        }

        // 2. Verify contract belongs to this project
        const { data: contract } = await supabase
            .from('contracts')
            .select('id, project_id, status')
            .eq('id', contractId)
            .single()

        if (!contract || contract.project_id !== qData.project_id) {
            throw new Error('Hợp đồng không hợp lệ')
        }

        if (!['sent', 'viewed'].includes(contract.status)) {
            throw new Error('Hợp đồng không ở trạng thái chờ xác nhận')
        }

        // 3. Update contract → signed
        const { error: updateErr } = await supabase
            .from('contracts')
            .update({
                status: 'signed',
                signed_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', contractId)

        if (updateErr) throw updateErr

        // 4. Auto-tick "Hợp đồng" in work item document procedures
        const { data: workItems } = await supabase
            .from('project_work_items')
            .select('id, required_documents')
            .eq('project_id', qData.project_id)

        for (const wi of workItems || []) {
            const docs = (wi.required_documents || []).map((d: any) =>
                (d.title?.includes('Hợp đồng') || d.title?.includes('hợp đồng'))
                    ? { ...d, status: 'signed', date: new Date().toISOString() }
                    : d
            )
            await supabase.from('project_work_items').update({ required_documents: docs }).eq('id', wi.id)
        }

        revalidatePath(`/portal/${token}`)
        revalidatePath(`/contracts/${contractId}`)

        return { success: true }
    } catch (err: any) {
        console.error('Error confirming contract from portal:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}
