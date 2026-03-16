'use server'
import { createClient } from '../server'
import { Quotation, QuotationItem } from '@/types'
import { revalidatePath } from 'next/cache'
import {
    sendTelegramNotification,
    formatNewQuotation,
    formatQuotationViewed,
    formatQuotationAccepted
} from './telegram-service'
import { logActivity, logDestructiveAction } from './activity-service'
import { getDealById } from './deal-service'
import { getCustomerById } from './customer-service'

export async function checkQuotationNumberExists(quotationNumber: string, excludeId?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('quotations')
            .select('id')
            .eq('quotation_number', quotationNumber)

        if (excludeId) {
            query = query.neq('id', excludeId)
        }

        const { data, error } = await query.limit(1)

        if (error) {
            console.error('Error checking quotation number:', error)
            return false
        }

        return data && data.length > 0
    } catch (err) {
        console.error('Fatal error checking quotation number:', err)
        return false
    }
}

// Auto-expire helper
async function checkAndExpireQuotation(quotation: any, fastUpdate = false) {
    if (!quotation || !quotation.valid_until) return quotation;
    if (['draft', 'sent', 'viewed'].includes(quotation.status)) {
        const validDate = new Date(quotation.valid_until);
        validDate.setHours(23, 59, 59, 999); // valid until end of the day

        if (new Date() > validDate) {
            quotation.status = 'expired';

            if (fastUpdate) {
                (async () => {
                    try {
                        const supabase = await createClient();
                        await supabase.from('quotations').update({ status: 'expired' }).eq('id', quotation.id);
                    } catch (err) {
                        // Suppress background errors
                    }
                })();
            }
        }
    }
    return quotation;
}

export async function getQuotations(customerId?: string, brand?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('quotations')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (brand) {
            query = query.eq('brand', brand)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching quotations:', error)
            return []
        }

        // Apply auto-expire check in memory
        const quotations = data as Quotation[];
        return Promise.all(quotations.map(q => checkAndExpireQuotation(q, true))) as Promise<Quotation[]>;
    } catch (err) {
        console.error('Fatal error in getQuotations:', err)
        return []
    }
}

export async function getQuotationById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), creator:users!created_by(*), items:quotation_items(*)')
            .eq('id', id)
            .order('sort_order', { foreignTable: 'quotation_items', ascending: true })
            .single()

        if (error) {
            console.error('Error fetching quotation by id:', error)
            return null
        }

        return (await checkAndExpireQuotation(data as Quotation, true)) as Quotation
    } catch (err) {
        console.error('Fatal error in getQuotationById:', err)
        return null
    }
}

export async function getQuotationByToken(token: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), creator:users!created_by(id, full_name), items:quotation_items(*)')
            .eq('public_token', token)
            .order('sort_order', { foreignTable: 'quotation_items', ascending: true })
            .single()

        if (error || !data) {
            console.error('Error fetching quotation by token:', error)
            return null
        }

        const quotation = data as Quotation;

        // Fetch sibling quotations for the same deal if deal_id exists
        if (quotation.deal_id) {
            const { data: siblings } = await supabase
                .from('quotations')
                .select('*, items:quotation_items(*)')
                .eq('deal_id', quotation.deal_id)
                .order('created_at', { ascending: false });
            
            if (siblings) {
                (quotation as any).siblings = siblings;
            }
        }

        return quotation;
    } catch (err) {
        console.error('Fatal error in getQuotationByToken:', err)
        return null
    }
}

export async function createQuotation(quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
    try {
        const supabase = await createClient()

        // Prepare quotation data (map empty UUIDs to null to prevent Postgres errors)
        const quoteDataToInsert = {
            ...quotation,
            customer_id: quotation.customer_id || null
        }

        // Check duplicate quotation number
        if (quoteDataToInsert.quotation_number) {
            const isDuplicate = await checkQuotationNumberExists(quoteDataToInsert.quotation_number)
            if (isDuplicate) {
                throw new Error('Mã báo giá đã tồn tại. Vui lòng chọn mã khác.')
            }
        }

        // 1. Insert quotation
        const { data: quoteData, error: quoteError } = await supabase
            .from('quotations')
            .insert([quoteDataToInsert])
            .select()
            .single()

        if (quoteError) {
            console.error('Error creating quotation:', quoteError)
            throw quoteError
        }
        // Filter out empty rows (no product_id and no product_name)
        const validItems = items.filter(item => item.product_id || (item.product_name && item.product_name.trim() !== ''))

        // 2. Insert items with specific field selection to ensure database compatibility
        const quoteItems = validItems.map(item => ({
            quotation_id: quoteData.id,
            product_id: item.product_id || null,
            product_name: item.product_name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || '',
            unit_price: Number(item.unit_price) || 0,
            discount: Number(item.discount) || 0,
            vat_percent: Number(item.vat_percent) || 0,
            total_price: Number(item.total_price) || 0,
            sort_order: Number(item.sort_order) || 0,
            section_name: item.section_name || null,
            is_optional: item.is_optional || false,
            alternative_group: item.alternative_group || null
        }))

        const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quoteItems)

        if (itemsError) {
            console.error('Error creating quotation items:', itemsError)
            throw itemsError
        }

        // 3. Notify via Telegram (don't fail the whole process if notification fails)
        try {
            const quoteWithDetails = await getQuotationById(quoteData.id)
            if (quoteWithDetails) {
                await sendTelegramNotification(await formatNewQuotation(quoteWithDetails), 'notify_new_quotation')
            }
        } catch (notifierError) {
            console.error('Telegram notification failed:', notifierError)
        }

        revalidatePath('/quotations')

        await logActivity({
            action: 'create',
            entity_type: 'quotation',
            entity_id: quoteData.id,
            description: `Tạo báo giá mới: ${quoteData.title}`
        })

        return quoteData
    } catch (err: any) {
        console.error('Fatal error in createQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo báo giá')
    }
}

export async function updateQuotation(id: string, quotation: Partial<Quotation>, items: Partial<QuotationItem>[]) {
    try {
        const supabase = await createClient()

        // Prepare quotation data (map empty UUIDs to null)
        const quoteDataToUpdate = {
            ...quotation,
            customer_id: quotation.customer_id || null
        }

        // Check duplicate quotation number
        if (quoteDataToUpdate.quotation_number) {
            const isDuplicate = await checkQuotationNumberExists(quoteDataToUpdate.quotation_number, id)
            if (isDuplicate) {
                throw new Error('Mã báo giá đã tồn tại. Vui lòng chọn mã khác.')
            }
        }

        // 1. Update quotation
        const { error: quoteError } = await supabase
            .from('quotations')
            .update(quoteDataToUpdate)
            .eq('id', id)

        if (quoteError) {
            console.error('Error updating quotation:', quoteError)
            throw quoteError
        }

        // 2. Refresh items (Delete old and insert new for simplicity)
        const { error: deleteError } = await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', id)

        if (deleteError) {
            console.error('Error deleting old quotation items:', deleteError)
            throw deleteError
        }

        // Filter out empty rows (no product_id and no product_name)
        const validItems = items.filter(item => item.product_id || (item.product_name && item.product_name.trim() !== ''))

        const quoteItems = validItems.map(item => ({
            quotation_id: id,
            product_id: item.product_id || null,
            product_name: item.product_name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || '',
            unit_price: Number(item.unit_price) || 0,
            discount: Number(item.discount) || 0,
            vat_percent: Number(item.vat_percent) || 0,
            total_price: Number(item.total_price) || 0,
            sort_order: Number(item.sort_order) || 0,
            section_name: item.section_name || null,
            is_optional: item.is_optional || false,
            alternative_group: item.alternative_group || null
        }))

        const { error: itemsError } = await supabase
            .from('quotation_items')
            .insert(quoteItems)

        if (itemsError) {
            console.error('Error inserting new quotation items:', itemsError)
            throw itemsError
        }

        revalidatePath('/quotations')
        revalidatePath(`/quotations/${id}`)

        await logActivity({
            action: 'update',
            entity_type: 'quotation',
            entity_id: id,
            description: `Cập nhật báo giá: ${quotation.title || 'Mã ' + (quotation.quotation_number || id)}`
        })

        return true
    } catch (err: any) {
        console.error('Fatal error in updateQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật báo giá')
    }
}

export async function duplicateQuotation(id: string) {
    try {
        const supabase = await createClient()

        // 1. Get original quotation with items
        const original = await getQuotationById(id)
        if (!original) throw new Error('Không tìm thấy báo giá gốc')

        // 2. Get current user for ownership
        const { data: { user } } = await supabase.auth.getUser()

        // 3. Prepare new quotation data
        const newQuotation: Partial<Quotation> = {
            quotation_number: `BG-COPY-${Date.now()}`,
            customer_id: original.customer_id,
            title: original.title ? `${original.title} (Bản sao)` : '(Bản sao)',
            // Removing description because it's not in the database schema for quotations
            terms: original.terms,
            notes: original.notes,
            subtotal: original.subtotal,
            discount_percent: original.discount_percent,
            discount_amount: original.discount_amount,
            vat_percent: original.vat_percent,
            vat_amount: original.vat_amount,
            total_amount: original.total_amount,
            valid_until: original.valid_until,
            status: 'draft',
            type: original.type,
            proposal_content: original.proposal_content,
            deal_id: original.deal_id,
            project_id: original.project_id,
            bank_name: original.bank_name,
            bank_account_no: original.bank_account_no,
            bank_account_name: original.bank_account_name,
            bank_branch: original.bank_branch,
            brand: original.brand,
            created_by: user?.id
        }

        // 4. Create the new quotation and items using existing createQuotation logic
        const response = await createQuotation(newQuotation, original.items || [])

        revalidatePath('/quotations')
        return response
    } catch (err: any) {
        console.error('Fatal error in duplicateQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi sao chép báo giá')
    }
}

export async function deleteQuotation(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quotations')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting quotation:', error)
            throw error
        }

        revalidatePath('/quotations')
        await logDestructiveAction('quotation', id, 'delete')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteQuotation:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa báo giá')
    }
}

export async function deleteQuotations(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quotations')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting quotations:', error)
            throw error
        }

        revalidatePath('/quotations')
        await logDestructiveAction('quotation', ids[0], 'bulk_delete', { affected_count: ids.length })
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteQuotations:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều báo giá')
    }
}
export async function recordQuotationView(id: string) {
    try {
        const supabase = await createClient()

        // 1. Increment view count
        const { data: quote, error } = await supabase.rpc('increment_quotation_view', { quote_id: id })

        // If RPC doesn't exist, we fallback to manual update (though RPC is safer for race conditions)
        if (error) {
            const current = await getQuotationById(id)
            if (current) {
                await supabase
                    .from('quotations')
                    .update({
                        view_count: (current.view_count || 0) + 1,
                        viewed_at: new Date().toISOString()
                    })
                    .eq('id', id)

                // 2. Notify via Telegram
                await sendTelegramNotification(await formatQuotationViewed(current), 'notify_quotation_viewed')
            }
        }

        revalidatePath(`/portal/quotation/${id}`)
        return true
    } catch (err) {
        console.error('Error recording quotation view:', err)
        return false
    }
}

export async function acceptQuotationPortal(id: string, confirmerInfo: any) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quotations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
                confirmer_info: confirmerInfo
            })
            .eq('id', id)

        if (error) throw error

        const quote = await getQuotationById(id)
        if (quote) {
            await sendTelegramNotification(await formatQuotationAccepted(quote), 'notify_quotation_accepted')

            await logActivity({
                action: 'accept',
                entity_type: 'quotation',
                entity_id: id,
                description: `Khách hàng đã chấp nhận báo giá qua Portal: ${quote.title}`
            })
        }

        revalidatePath(`/portal/quotation/${id}`)
        revalidatePath('/quotations')
        return true
    } catch (err) {
        console.error('Error accepting quotation:', err)
        throw err
    }
}

export async function getQuotationByProjectId(projectId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quotations')
            .select('public_token')
            .eq('project_id', projectId)
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data as any
    } catch (err) {
        console.error('Error fetching quotation by project ID:', err)
        return null
    }
}
