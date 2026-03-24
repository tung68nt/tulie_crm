'use server'
import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { DocumentTemplate, DocumentBundle, GeneratedDocument } from '@/types'
import { readNumberToWords } from '@/lib/utils/format'

// Parse date string to local Date, avoiding UTC timezone shift
// "2026-03-16T17:00:00+00:00" → local March 16 (not UTC which may differ)
function parseLocalDateString(dateStr: string): Date {
    const datePart = dateStr.substring(0, 10) // "2026-03-16"
    const [y, m, d] = datePart.split('-').map(Number)
    return new Date(y, m - 1, d)
}

import { contractTemplate } from './contract-template'
import { paymentTemplate } from './payment-template'
import { orderTemplate } from './order-template'
import { deliveryMinutesTemplate } from './delivery-minutes-template'
import { quotationTemplate } from './quotation-template'

/**
 * Standard templates with common variables for HTML fallback and variable definition
 * Variables map to {{variable_name}} placeholders in HTML templates
 */
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'Báo giá (Mẫu chuẩn)',
        type: 'quotation',
        content: quotationTemplate,
        variables: [
            'quotation_number', 'quotation_date', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'quotation_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address'
        ]
    },
    {
        name: 'Hợp đồng kinh tế (Mẫu chuẩn)',
        type: 'contract',
        content: contractTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address',
            'service_description'
        ]
    },
    {
        name: 'Đơn đặt hàng (Mẫu chuẩn)',
        type: 'order',
        content: orderTemplate,
        variables: [
            'order_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address'
        ]
    },
    {
        name: 'Đề nghị thanh toán (Mẫu chuẩn)',
        type: 'payment_request',
        content: paymentTemplate,
        variables: [
            'payment_number', 'day', 'month', 'year',
            'customer_company', 'contract_number', 'contract_date',
            'service_description', 'delivery_date',
            'payment_percentage', 'payment_amount', 'amount_in_words'
        ]
    },
    {
        name: 'Biên bản giao nhận (Mẫu chuẩn)',
        type: 'delivery_minutes',
        content: deliveryMinutesTemplate,
        variables: [
            'report_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_number', 'order_number', 'order_date',
            'delivery_items_table'
        ]
    }
]


// Get all templates - always includes built-in defaults
export async function getDocumentTemplates() {
    // Always include built-in defaults
    const builtInTemplates = defaultTemplates.map((t, i) => ({
        ...t,
        id: `default-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })) as DocumentTemplate[]

    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .order('created_at', { ascending: false })

        if (error || !data) {
            return builtInTemplates
        }

        // Merge: built-in first, then custom DB templates
        return [...builtInTemplates, ...(data as DocumentTemplate[])]
    } catch {
        return builtInTemplates
    }
}


// Get template by ID
export async function getTemplateById(id: string) {
    try {
        if (id.startsWith('default-')) {
            const index = parseInt(id.replace('default-', ''))
            const template = defaultTemplates[index]
            if (template) {
                return {
                    ...template,
                    id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as DocumentTemplate
            }
            return null
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching template:', error)
            return null
        }

        return data as DocumentTemplate
    } catch (err) {
        console.error('Error in getTemplateById:', err)
        return null
    }
}

// Create template
export async function createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('document_templates')
        .insert([template])
        .select()
        .single()

    if (error) throw error
    return data as DocumentTemplate
}

// Update template
export async function updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('document_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as DocumentTemplate
}

// Fill template with variables
export async function fillTemplate(template: string, variables: Record<string, string>): Promise<string> {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value || '')
    }
    // Clean up any remaining unfilled {{...}} placeholders so they appear blank
    result = result.replace(/\{\{[a-zA-Z_]+\}\}/g, '')
    return result
}

// Generate document from template and customer data (HTML version)
export async function generateDocument(
    templateId: string,
    customerId: string,
    contractId?: string,
    additionalVariables?: Record<string, string>
) {
    try {
        const supabase = await createClient()

        // Get template
        const template = await getTemplateById(templateId)
        if (!template) throw new Error('Template not found')

        // Get customer data (including abbreviation)
        const { data: customer, error: custError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (custError || !customer) throw new Error('Customer not found')

        // Get contract and its source quotation data
        let contract = null
        if (contractId) {
            const { data } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
                .eq('id', contractId)
                .single()

            if (data) {
                contract = {
                    ...data,
                    items: data.quotation?.items || []
                }

                // Auto-save snapshot if contract doesn't have one yet
                if (!data.customer_snapshot && customer) {
                    const snapshot = {
                        company_name: customer.company_name,
                        tax_code: customer.tax_code,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        invoice_address: customer.invoice_address,
                        representative: customer.representative,
                        position: customer.position,
                    }
                    await supabase
                        .from('contracts')
                        .update({ customer_snapshot: snapshot })
                        .eq('id', contractId)
                    contract.customer_snapshot = snapshot
                }
            }
        }

        // Use signed_date if available, otherwise fallback to now
        const signedDate = contract?.signed_date ? parseLocalDateString(contract.signed_date) : null
        const docDate = signedDate || new Date()
        const abbr = customer?.abbreviation || ''
        const dateStr = signedDate
            ? `${docDate.getFullYear()}${String(docDate.getMonth() + 1).padStart(2, '0')}${String(docDate.getDate()).padStart(2, '0')}`
            : ''

        // Use snapshot from contract if available, otherwise live customer data
        const custData = contract?.customer_snapshot || customer

        // Build document numbers based on format: yyyymmdd/TYPE-TL-ABBR
        const contractDocNumber = (dateStr && abbr)
            ? `${dateStr}/HDKT-TL-${abbr.toUpperCase()}`
            : contract?.contract_number || ''
        const paymentDocNumber = (dateStr && abbr)
            ? `${dateStr}/DNTT-TL-${abbr.toUpperCase()}`
            : ''
        const deliveryDocNumber = (dateStr && abbr)
            ? `${dateStr}/BGNT-TL-${abbr.toUpperCase()}`
            : ''

        // Build variables map
        const variables: Record<string, string> = {
            // Customer variables (from snapshot or live)
            customer_company: custData.company_name || customer.company_name || '',
            customer_address: custData.address || customer.address || '',
            customer_tax_code: custData.tax_code || customer.tax_code || '',
            customer_email: custData.email || customer.email || '',
            customer_phone: custData.phone || customer.phone || '',
            customer_representative_title: custData.representative_title || customer.representative_title || '',
            customer_representative: custData.representative || customer.representative || '',
            customer_position: custData.position || customer.position || '',
            customer_invoice_address: custData.invoice_address || custData.address || customer.address || '',
            customer_mobile: '',
            customer_bank_account: '',
            customer_bank_name: '',

            // Provider variables
            provider_company: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
            provider_address: 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Hà Nội',
            provider_tax_code: '0110163102',
            provider_representative: '',
            provider_position: '',
            bank_name: 'Techcombank',
            bank_account: '86683979',
            account_holder: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',

            // Date variables — use signed_date if available
            day: docDate.getDate().toString(),
            month: (docDate.getMonth() + 1).toString(),
            year: docDate.getFullYear().toString(),
            contract_date: signedDate ? signedDate.toLocaleDateString('vi-VN') : '',
            date_day: docDate.getDate().toString(),
            date_month: (docDate.getMonth() + 1).toString(),
            date_year: docDate.getFullYear().toString(),
            quotation_date: new Date().toLocaleDateString('vi-VN'),
            location: 'Hà Nội',

            // Document numbers — using new format
            contract_number: contractDocNumber,
            payment_number: paymentDocNumber,
            report_number: deliveryDocNumber,
            quotation_number: contract?.quotation?.quotation_number || '',

            // Defaults that may be overridden
            subtotal: '',
            vat_rate: '',
            vat_amount: '',
            total_amount_number: '',
            amount_in_words: '',
            payment_terms: '',
            delivery_time: '',
            delivery_address: '',
            delivery_date: '',
            service_description: '',
            payment_percentage: '',
            payment_amount: '',

            ...additionalVariables
        }

        // Handle amount_in_words
        if (additionalVariables?.payment_amount && !variables.amount_in_words) {
            const amountValue = parseFloat(additionalVariables.payment_amount.replace(/[^0-9]/g, ''))
            if (!isNaN(amountValue)) variables.amount_in_words = readNumberToWords(amountValue)
        }

        // Add contract variables
        if (contract) {
            variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)
            if (!variables.amount_in_words) variables.amount_in_words = readNumberToWords(contract.total_amount || 0)
            variables.start_date = contract.start_date ? parseLocalDateString(contract.start_date).toLocaleDateString('vi-VN') : ''
            variables.service_description = contract.description || contract.quotation?.title || contract.title || ''

            // Auto-fill delivery_time = contract end date
            if (contract.end_date) {
                variables.delivery_time = parseLocalDateString(contract.end_date).toLocaleDateString('vi-VN')
            }

            // Auto-fill delivery_address from customer address
            variables.delivery_address = custData.address || customer.address || ''

            // Build items table from quotation items
            const items = contract.items || []
            if (items.length > 0) {
                let grossTotal = 0
                let totalDiscountAmt = 0
                let totalVat = 0
                let totalAfterVat = 0
                let itemsRowsHtml = ''

                // Group items by section_name
                const sections: Record<string, any[]> = {}
                items.forEach((item: any) => {
                    const sectionName = item.section_name || ''
                    if (!sections[sectionName]) sections[sectionName] = []
                    sections[sectionName].push(item)
                })

                const sectionEntries = Object.entries(sections).sort((a, b) => {
                    if (a[0] === '') return 1
                    if (b[0] === '') return -1
                    return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0)
                })

                sectionEntries.forEach(([sectionName, sectionItems], sIdx) => {
                    // Section header row
                    if (sectionName) {
                        itemsRowsHtml += `<tr style="background:#f0f0f0;">
                            <td style="border:1px solid #000; padding:4px;" colspan="10"><strong>${sIdx + 1}. ${sectionName}</strong></td>
                        </tr>`
                    }

                    sectionItems.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                    sectionItems.forEach((item: any, iIdx: number) => {
                        const qty = item.quantity || 1
                        const unitPrice = item.unit_price || 0
                        const itemGross = qty * unitPrice
                        const discountPct = item.discount || 0 // discount is a percentage (0-100)
                        const discountAmount = Math.round(itemGross * discountPct / 100)
                        const afterDiscount = itemGross - discountAmount
                        const itemVatRate = item.vat_percent || 0
                        const itemVat = Math.round(afterDiscount * itemVatRate / 100)
                        const afterVat = afterDiscount + itemVat
                        
                        grossTotal += itemGross
                        totalDiscountAmt += discountAmount
                        totalVat += itemVat
                        totalAfterVat += afterVat

                        // Description: convert newlines to <br> for proper line breaks
                        const rawDesc = item.description || ''
                        const descHtml = rawDesc 
                            ? `<br><span style="font-size:7.5pt; color:#555; font-style:italic;">${rawDesc.replace(/\n/g, '<br>')}</span>` 
                            : ''

                        const itemNum = sectionName ? `${sIdx + 1}.${iIdx + 1}` : `${iIdx + 1}`

                        itemsRowsHtml += `<tr>
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top;">${itemNum}</td>
                            <td style="border:1px solid #000; padding:4px; vertical-align:top;"><strong>${item.product_name}</strong>${descHtml}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top;">${item.unit || 'Gói'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top;">${qty}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top;">${new Intl.NumberFormat('vi-VN').format(unitPrice)}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top;">${discountPct > 0 ? discountPct + '%' : '-'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top;">${discountAmount > 0 ? new Intl.NumberFormat('vi-VN').format(discountAmount) : '-'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top;">${new Intl.NumberFormat('vi-VN').format(afterDiscount)}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top;">${itemVatRate > 0 ? itemVatRate + '%' : '0%'}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top;">${new Intl.NumberFormat('vi-VN').format(afterVat)}</td>
                        </tr>`
                    })
                })

                variables.contract_items_table = itemsRowsHtml
                variables.quotation_items_table = itemsRowsHtml

                // Summary totals
                const subtotalAfterDiscount = grossTotal - totalDiscountAmt
                const overallDiscountAmount = contract.quotation?.discount_amount ?? 0
                const overallDiscountPercent = contract.quotation?.discount_percent ?? 0
                
                variables.gross_total = new Intl.NumberFormat('vi-VN').format(grossTotal)
                variables.total_discount = new Intl.NumberFormat('vi-VN').format(totalDiscountAmt)
                variables.subtotal = new Intl.NumberFormat('vi-VN').format(subtotalAfterDiscount)
                variables.vat_total = new Intl.NumberFormat('vi-VN').format(totalVat)
                variables.total_after_vat = new Intl.NumberFormat('vi-VN').format(totalAfterVat)
                
                // Final total = totalAfterVat - overall discount (if any)
                const finalTotal = contract.total_amount || (totalAfterVat - overallDiscountAmount)
                variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(finalTotal)

                // Keep legacy vars for backward compat
                variables.vat_rate = ''
                variables.vat_amount = ''

                // Optional overall discount row (separate from per-item discounts)
                if (overallDiscountAmount > 0) {
                    const pctString = overallDiscountPercent > 0 ? ` (${overallDiscountPercent}%)` : ''
                    variables.discount_row_html = `
                    <tr>
                      <td style="border:1px solid #000; padding:4px;" colspan="9">Chiết khấu tổng / Overall Discount${pctString}</td>
                      <td style="border:1px solid #000; padding:4px; text-align:right;">-${new Intl.NumberFormat('vi-VN').format(overallDiscountAmount)}</td>
                    </tr>`
                } else {
                    variables.discount_row_html = ''
                }
            } else {
                variables.contract_items_table = ''
                variables.quotation_items_table = ''
            }

            // Payment terms from milestones
            if (contract.milestones && contract.milestones.length > 0) {
                const paymentMilestones = contract.milestones.filter((m: any) => m.amount > 0)
                if (paymentMilestones.length > 0) {
                    const totalAmount = contract.total_amount || 0
                    const paymentTermsHtml = paymentMilestones.map((m: any, idx: number) => {
                        const percentage = totalAmount > 0 ? Math.round((m.amount / totalAmount) * 100) : 0
                        const dueStr = m.due_date ? `(Hạn: ${parseLocalDateString(m.due_date).toLocaleDateString('vi-VN')})` : ''
                        return `- Đợt ${idx + 1}: ${percentage}% giá trị Hợp đồng = ${new Intl.NumberFormat('vi-VN').format(m.amount)} VND — ${m.name} ${dueStr}`
                    }).join('<br/>')
                    
                    variables.payment_terms = paymentTermsHtml

                    // For payment request: use first pending milestone or total
                    if (!additionalVariables?.payment_amount) {
                        const pendingMilestone = paymentMilestones.find((m: any) => m.status === 'pending') || paymentMilestones[0]
                        if (pendingMilestone) {
                            const pct = totalAmount > 0 ? Math.round((pendingMilestone.amount / totalAmount) * 100) : 0
                            variables.payment_amount = new Intl.NumberFormat('vi-VN').format(pendingMilestone.amount) + ' VND'
                            variables.payment_percentage = `${pct}%`
                            // Only overwrite amount_in_words if this is a payment request
                            if (template.type === 'payment_request') {
                                if (!variables.amount_in_words || variables.amount_in_words === readNumberToWords(totalAmount)) {
                                    variables.amount_in_words = readNumberToWords(pendingMilestone.amount)
                                }
                            }
                        }
                    }
                }
            }
        }

        const filledContent = await fillTemplate(template.content, variables)

        return {
            content: filledContent,
            variables
        }
    } catch (error) {
        console.error('Error generating document:', error)
        throw error
    }
}

/**
 * Define which documents each contract type needs
 */
function getDocTypesForContract(contractType: string): string[] {
    if (contractType === 'order') {
        return ['order', 'payment_request', 'delivery_minutes']
    }
    // Default: contract (HĐ kinh tế)
    return ['contract', 'payment_request', 'delivery_minutes']
}

/**
 * Get all contract documents from DB
 */
export async function getContractDocuments(contractId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching contract documents:', error)
        return []
    }
    return data || []
}

/**
 * Auto-generate all documents for a contract.
 * Bundle composition depends on contract type:
 * - contract → [HĐ, N×ĐNTT, BBGN]  
 * - order → [ĐĐH, N×ĐNTT, BBGN]
 * 
 * Each payment milestone gets its own ĐNTT document.
 * Only regenerates draft documents (signed docs are preserved).
 */
export async function generateDocumentBundle(contractId: string) {
    const supabase = createAdminClient()

    // 1. Get contract with milestones and quotation items
    const { data: contract, error: cErr } = await supabase
        .from('contracts')
        .select('*, milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
        .eq('id', contractId)
        .single()

    if (cErr || !contract) {
        console.error('generateDocumentBundle: contract not found', cErr)
        return
    }

    // 2. Save visibility state of existing drafts before deleting
    const { data: existingDrafts } = await supabase
        .from('contract_documents')
        .select('type, milestone_id, is_visible_on_portal')
        .eq('contract_id', contractId)
        .eq('status', 'draft')
    
    // Build a map: "type:milestone_id" -> is_visible_on_portal
    const visibilityMap = new Map<string, boolean>()
    if (existingDrafts) {
        for (const d of existingDrafts) {
            const key = `${d.type}:${d.milestone_id || ''}`
            visibilityMap.set(key, d.is_visible_on_portal !== false)
        }
    }

    // Delete existing DRAFT documents (preserve signed ones)
    await supabase
        .from('contract_documents')
        .delete()
        .eq('contract_id', contractId)
        .eq('status', 'draft')

    // 3. Determine which doc types this contract needs
    const docTypes = getDocTypesForContract(contract.type || 'contract')

    // 4. Find templates
    const templates = await getDocumentTemplates()
    const docs: any[] = []

    for (const docType of docTypes) {
        const template = templates.find(t => t.type === docType)
        if (!template) continue

        if (docType === 'payment_request') {
            // One ĐNTT per milestone that has a payment amount
            // Any milestone with amount > 0 gets a payment request (regardless of type field)
            const paymentMilestones = (contract.milestones || []).filter((m: any) => 
                m.amount > 0
            )
            
            if (paymentMilestones.length === 0) {
                // No milestones → generate single generic ĐNTT
                try {
                    const result = await generateDocument(template.id, contract.customer_id, contractId)
                    docs.push({
                        contract_id: contractId,
                        type: docType,
                        milestone_id: null,
                        doc_number: result.variables?.payment_number || '',
                        content: result.content,
                        status: 'draft'
                    })
                } catch (e) {
                    console.error(`Error generating ${docType}:`, e)
                }
            } else {
                const totalAmount = contract.total_amount || 0

                for (let i = 0; i < paymentMilestones.length; i++) {
                    const milestone = paymentMilestones[i]
                    const pct = totalAmount > 0 ? Math.round((milestone.amount / totalAmount) * 100) : 0
                    
                    // Override payment-specific variables for this milestone
                    const mName = milestone.name || `Đợt ${i + 1}`
                    const mNameLower = mName.toLowerCase()
                    const isDeposit = mNameLower.includes('cọc') || mNameLower.includes('đặt cọc') || mNameLower.includes('tạm ứng')
                    
                    let milestoneReason: string
                    if (isDeposit) {
                        milestoneReason = `Theo điều khoản thanh toán tại Điều 2 của Hợp đồng, Bên sử dụng dịch vụ thanh toán đặt cọc cho Bên cung cấp dịch vụ để triển khai dự án.`
                    } else {
                        const deliveryDate = milestone.due_date 
                            ? parseLocalDateString(milestone.due_date).toLocaleDateString('vi-VN') 
                            : ''
                        milestoneReason = deliveryDate
                            ? `Căn cứ Biên bản bàn giao và nghiệm thu ngày ${deliveryDate}, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                            : `Căn cứ Biên bản bàn giao và nghiệm thu, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                    }

                    const milestoneVars: Record<string, string> = {
                        payment_amount: new Intl.NumberFormat('vi-VN').format(milestone.amount) + ' VND',
                        payment_percentage: `${pct}%`,
                        amount_in_words: readNumberToWords(milestone.amount),
                        milestone_name: mName,
                        milestone_reason: milestoneReason,
                        milestone_due_date: milestone.due_date 
                            ? parseLocalDateString(milestone.due_date).toLocaleDateString('vi-VN')
                            : '',
                    }

                    try {
                        const result = await generateDocument(template.id, contract.customer_id, contractId, milestoneVars)
                        // Append milestone index to doc number
                        const docNum = result.variables?.payment_number 
                            ? `${result.variables.payment_number}-${i + 1}` 
                            : ''
                        
                        docs.push({
                            contract_id: contractId,
                            type: docType,
                            milestone_id: milestone.id,
                            doc_number: docNum,
                            content: result.content,
                            status: 'draft'
                        })
                    } catch (e) {
                        console.error(`Error generating ĐNTT for milestone ${milestone.id}:`, e)
                    }
                }
            }
        } else {
            // Single document (HĐ, ĐĐH, BBGN)
            try {
                const result = await generateDocument(template.id, contract.customer_id, contractId)
                const docNum = docType === 'contract' ? result.variables?.contract_number
                    : docType === 'order' ? result.variables?.contract_number
                    : result.variables?.report_number || ''
                
                docs.push({
                    contract_id: contractId,
                    type: docType,
                    milestone_id: null,
                    doc_number: docNum,
                    content: result.content,
                    status: 'draft'
                })
            } catch (e) {
                console.error(`Error generating ${docType}:`, e)
            }
        }
    }

    // 5. Insert all generated documents (one by one to handle FK errors gracefully)
    if (docs.length > 0) {
        // Run a second delete right before insertion to clear any drafts 
        // that might have been inserted by concurrent requests during the slow generation phase
        await supabase
            .from('contract_documents')
            .delete()
            .eq('contract_id', contractId)
            .eq('status', 'draft')

        for (const doc of docs) {
            // Restore previous visibility state
            const visKey = `${doc.type}:${doc.milestone_id || ''}`
            const wasVisible = visibilityMap.get(visKey)
            if (wasVisible !== undefined) {
                doc.is_visible_on_portal = wasVisible
            }

            const { error: insertErr } = await supabase
                .from('contract_documents')
                .insert(doc)

            if (insertErr) {
                console.error(`Error inserting ${doc.type}:`, insertErr.message)
                // If FK error on milestone_id, retry without it
                if (insertErr.code === '23503' && doc.milestone_id) {
                    await supabase
                        .from('contract_documents')
                        .insert({ ...doc, milestone_id: null })
                }
            }
        }
    }

    return docs
}

/**
 * Fetches all necessary data to populate a PDF template (React-PDF)
 */
export async function getDocumentData(
    type: 'contract' | 'order' | 'payment_request' | 'delivery_minutes' | 'quotation',
    customerId: string,
    relationId?: string,
    additionalMetadata?: Record<string, any>
) {
    const supabase = createAdminClient()

    // 1. Get Customer
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

    // 2. Get Related Entity (Contract or Quotation or Invoice)
    let relationData: any = null
    let items: any[] = []

    if (relationId) {
        if (type === 'contract' || type === 'delivery_minutes' || type === 'payment_request') {
            const { data } = await supabase
                .from('contracts')
                .select('*, quotation:quotations(*, items:quotation_items(*))')
                .eq('id', relationId)
                .single()
            relationData = data
            items = data?.quotation?.items || []
        } else if (type === 'quotation') {
            const { data } = await supabase
                .from('quotations')
                .select('*, items:quotation_items(*)')
                .eq('id', relationId)
                .single()
            relationData = data
            items = data?.items || []
        }
    }

    const now = new Date()

    return {
        type,
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        customer,
        items,
        contract_number: relationData?.contract_number || relationData?.quotation_number,
        quotation_number: relationData?.quotation_number,
        total_amount: relationData?.total_amount || 0,
        amount_in_words: relationData?.total_amount ? readNumberToWords(relationData.total_amount) : '',
        start_date: relationData?.start_date ? parseLocalDateString(relationData.start_date).toLocaleDateString('vi-VN') : '',
        contract_date: relationData?.created_at ? parseLocalDateString(relationData.created_at).toLocaleDateString('vi-VN') : now.toLocaleDateString('vi-VN'),
        valid_until: relationData?.valid_until ? parseLocalDateString(relationData.valid_until).toLocaleDateString('vi-VN') : '30 ngày kể từ ngày báo giá',
        ...additionalMetadata
    }
}

// Create Document Bundle
export async function createDocumentBundle(bundle: Omit<DocumentBundle, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('document_bundles')
        .insert([bundle])
        .select()
        .single()

    if (error) throw error
    return data as DocumentBundle
}

export async function getDocumentBundles() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('document_bundles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []) as DocumentBundle[]
    } catch (err) {
        console.error('Error fetching bundles:', err)
        return []
    }
}

export async function deleteDocumentBundle(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('document_bundles')
        .delete()
        .eq('id', id)
    if (error) throw error
}

export async function updateDocumentBundle(id: string, bundle: Partial<DocumentBundle>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('document_bundles')
        .update(bundle)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as DocumentBundle
}

export async function saveGeneratedDocument(doc: Partial<GeneratedDocument>) {
    try {
        const supabase = await createClient()
        let query;

        if (doc.id) {
            query = supabase.from('generated_documents').update(doc).eq('id', doc.id)
        } else {
            query = supabase.from('generated_documents').insert([doc])
        }

        const { data, error } = await query.select().single()
        if (error) throw error
        return data as GeneratedDocument
    } catch (err) {
        console.error('Error saving generated doc:', err)
        throw err
    }
}

export async function getGeneratedDocumentById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('generated_documents')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as GeneratedDocument
    } catch (err) {
        console.error('Error fetching generated doc:', err)
        return null
    }
}

// Generate secure share token using global crypto (Node/Browser compatible)
export async function generateShareToken() {
    return (globalThis.crypto as any).randomUUID().replace(/-/g, '')
}
