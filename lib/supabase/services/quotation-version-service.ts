'use server'
import { createClient } from '../server'
import { revalidatePath } from 'next/cache'

/**
 * Create a version snapshot of a quotation before it gets updated.
 * Called automatically inside updateQuotation().
 */
export async function createVersionSnapshot(quotationId: string, changeSummary?: string) {
    const supabase = await createClient()

    // 1. Fetch current quotation + items
    const { data: quotation, error: qErr } = await supabase
        .from('quotations')
        .select('*, items:quotation_items(*)')
        .eq('id', quotationId)
        .single()

    if (qErr || !quotation) {
        console.error('Version snapshot: could not fetch quotation', qErr)
        return null
    }

    // 2. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Get next version number
    const { data: lastVersion } = await supabase
        .from('quotation_versions')
        .select('version_number')
        .eq('quotation_id', quotationId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

    const nextVersion = (lastVersion?.version_number || 0) + 1

    // 4. Build snapshot (strip nested relations to keep clean)
    const { items, ...quotationData } = quotation
    const snapshot = {
        ...quotationData,
        items: items || []
    }

    // 5. Insert version record
    const { data: version, error: insertErr } = await supabase
        .from('quotation_versions')
        .insert({
            quotation_id: quotationId,
            version_number: nextVersion,
            snapshot,
            change_summary: changeSummary || `Phiên bản ${nextVersion}`,
            created_by: user?.id || null
        })
        .select()
        .single()

    if (insertErr) {
        console.error('Version snapshot: insert failed', insertErr)
        return null
    }

    // 6. Update version_number on quotation
    await supabase
        .from('quotations')
        .update({ version_number: nextVersion + 1 })
        .eq('id', quotationId)

    return version
}

/**
 * List all versions of a quotation, newest first.
 */
export async function getQuotationVersions(quotationId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('quotation_versions')
        .select('id, version_number, change_summary, created_by, created_at')
        .eq('quotation_id', quotationId)
        .order('version_number', { ascending: false })

    if (error) {
        console.error('Error fetching quotation versions:', error)
        return []
    }

    return data || []
}

/**
 * Get a single version's full snapshot.
 */
export async function getQuotationVersionSnapshot(versionId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('quotation_versions')
        .select('*')
        .eq('id', versionId)
        .single()

    if (error) {
        console.error('Error fetching version snapshot:', error)
        return null
    }

    return data
}

/**
 * Restore a quotation to a previous version.
 * Creates a snapshot of current state first, then overwrites with the old version.
 */
export async function restoreQuotationVersion(quotationId: string, versionId: string) {
    const supabase = await createClient()

    // 1. Get the version to restore
    const version = await getQuotationVersionSnapshot(versionId)
    if (!version || !version.snapshot) {
        throw new Error('Không tìm thấy phiên bản cần khôi phục')
    }

    // 2. Snapshot current state before overwriting
    await createVersionSnapshot(quotationId, `Tự động lưu trước khi khôi phục v${version.version_number}`)

    const snapshot = version.snapshot as any
    const { items: snapshotItems, ...snapshotQuotation } = snapshot

    // 3. Update quotation with snapshot data (exclude system fields)
    const fieldsToRestore: Record<string, any> = {}
    const allowedFields = [
        'title', 'quotation_number', 'customer_id', 'terms', 'notes',
        'subtotal', 'discount_percent', 'discount_amount',
        'vat_percent', 'vat_amount', 'total_amount', 'valid_until',
        'type', 'proposal_content',
        'bank_name', 'bank_account_no', 'bank_account_name', 'bank_branch',
        'brand'
    ]

    for (const field of allowedFields) {
        if (snapshotQuotation[field] !== undefined) {
            fieldsToRestore[field] = snapshotQuotation[field]
        }
    }
    fieldsToRestore.updated_at = new Date().toISOString()

    const { error: updateErr } = await supabase
        .from('quotations')
        .update(fieldsToRestore)
        .eq('id', quotationId)

    if (updateErr) throw updateErr

    // 4. Replace items
    await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', quotationId)

    if (snapshotItems && snapshotItems.length > 0) {
        const restoredItems = snapshotItems.map((item: any) => ({
            quotation_id: quotationId,
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

        const { error: itemErr } = await supabase
            .from('quotation_items')
            .insert(restoredItems)

        if (itemErr) throw itemErr
    }

    revalidatePath(`/quotations/${quotationId}`)
    revalidatePath('/quotations')

    return { success: true, restoredVersion: version.version_number }
}
