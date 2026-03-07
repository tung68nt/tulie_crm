'use server'
import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { DocumentTemplate, DocumentBundle } from '@/types'
import { readNumberToWords } from '@/lib/utils/format'

import { contractTemplate } from './contract-template'
import { paymentTemplate } from './payment-template'
import { quotationTemplate } from './quotation-template'

import { deliveryMinutesTemplate } from './delivery-minutes-template'

/**
 * Standard templates with common variables for HTML fallback and variable definition
 */
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'Hợp đồng dịch vụ (Mẫu chuẩn)',
        type: 'contract',
        content: contractTemplate,
        variables: [
            'contract_number', 'contract_date', 'day', 'month', 'year',
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative', 'provider_position',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_position', 'customer_email', 'customer_phone',
            'service_description', 'total_amount_number', 'amount_in_words', 'payment_schedule', 'contract_items_table',
            'start_date', 'end_date'
        ]
    },
    {
        name: 'Đơn đặt hàng (Mẫu chuẩn)',
        type: 'order',
        content: quotationTemplate,
        variables: [
            'order_number', 'day', 'month', 'year',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_phone',
            'items_table', 'total_amount', 'amount_in_words', 'delivery_time', 'payment_method'
        ]
    },
    {
        name: 'Đề nghị thanh toán (Mẫu chuẩn)',
        type: 'payment_request',
        content: paymentTemplate,
        variables: [
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative',
            'customer_company', 'customer_address',
            'contract_number', 'contract_date',
            'payment_number', 'day', 'month', 'year', 'payment_description', 'payment_amount', 'amount_in_words',
            'bank_name', 'bank_account', 'account_holder', 'transfer_content',
            'due_date'
        ]
    },
    {
        name: 'Biên bản nghiệm thu & bàn giao (Mẫu chuẩn)',
        type: 'delivery_minutes',
        content: deliveryMinutesTemplate,
        variables: [
            'report_number', 'day', 'month', 'year',
            'customer_company', 'customer_address', 'customer_representative',
            'contract_number', 'delivery_items_table'
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

        // Get customer data
        const { data: customer, error: custError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single()

        if (custError || !customer) throw new Error('Customer not found')

        // Get contract data if provided
        let contract = null
        if (contractId) {
            const { data } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*), items:quotation_items(*)')
                .eq('id', contractId)
                .single()
            contract = data
        }

        const now = new Date()

        // Build variables map
        const variables: Record<string, string> = {
            // Customer variables
            customer_company: customer.company_name || customer.name || '',
            customer_address: customer.address || '',
            customer_tax_code: customer.tax_code || '',
            customer_email: customer.email || '',
            customer_phone: customer.phone || '',
            customer_representative: customer.representative || '',
            customer_position: customer.position || '',

            // Provider variables
            provider_company: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
            provider_address: 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Hà Nội',
            provider_tax_code: '0110163102',
            provider_representative: 'Nguyễn Thanh Tùng',
            provider_position: 'Giám đốc',
            bank_name: 'Techcombank',
            bank_account: '86683979',
            account_holder: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',

            // Date variables
            contract_date: now.toLocaleDateString('vi-VN'),
            date_day: now.getDate().toString(),
            date_month: (now.getMonth() + 1).toString(),
            date_year: now.getFullYear().toString(),
            quotation_date: now.toLocaleDateString('vi-VN'),
            location: 'Hà Nội',

            // Default specific numbers
            quotation_number: `QT-${now.getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            payment_number: `REQ-${now.getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            ...additionalVariables
        }

        // Handle amount_in_words
        if (additionalVariables?.payment_amount && !variables.amount_in_words) {
            const amountValue = parseFloat(additionalVariables.payment_amount.replace(/[^0-9]/g, ''))
            if (!isNaN(amountValue)) variables.amount_in_words = readNumberToWords(amountValue)
        }

        // Add contract variables
        if (contract) {
            variables.contract_number = contract.contract_number || ''
            variables.contract_date = contract.created_at ? new Date(contract.created_at).toLocaleDateString('vi-VN') : variables.contract_date
            variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)
            if (!variables.amount_in_words) variables.amount_in_words = readNumberToWords(contract.total_amount || 0)
            variables.start_date = contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : ''
            variables.service_description = contract.description || ''

            // Build items table (HTML)
            let itemsHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">'
            itemsHtml += '<tr><th style="border: 1px solid #000; padding: 8px; text-align: center;">STT</th><th style="border: 1px solid #000; padding: 8px;">Tên hàng hoá, dịch vụ</th><th style="border: 1px solid #000; padding: 8px; text-align: center;">ĐVT</th><th style="border: 1px solid #000; padding: 8px; text-align: center;">SL</th><th style="border: 1px solid #000; padding: 8px; text-align: right;">Đơn giá</th><th style="border: 1px solid #000; padding: 8px; text-align: right;">Thành tiền</th></tr>'
            if (contract.items && contract.items.length > 0) {
                contract.items.forEach((item: any, index: number) => {
                    itemsHtml += `<tr>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #000; padding: 8px;">${item.product_name}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.unit}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.unit_price)}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.total_price)}</td>
                    </tr>`
                })
            }
            itemsHtml += '</table>'
            variables.contract_items_table = itemsHtml
            variables.quotation_items_table = itemsHtml

            // Payment schedule
            let paymentHtml = '<ul style="margin-top: 5px;">'
            if (contract.milestones && contract.milestones.length > 0) {
                const paymentMilestones = contract.milestones.filter((m: any) => m.type !== 'work')
                paymentMilestones.forEach((m: any) => {
                    paymentHtml += `<li>${m.name}: Thanh toán ${new Intl.NumberFormat('vi-VN').format(m.amount)} VNĐ (Hạn: ${m.due_date ? new Date(m.due_date).toLocaleDateString('vi-VN') : ''})</li>`
                })
            }
            paymentHtml += '</ul>'
            variables.payment_schedule = paymentHtml
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
                .select('*, items:quotation_items(*)')
                .eq('id', relationId)
                .single()
            relationData = data
            items = data?.items || []
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
        total_amount: relationData?.total_amount || 0,
        amount_in_words: relationData?.total_amount ? readNumberToWords(relationData.total_amount) : '',
        start_date: relationData?.start_date ? new Date(relationData.start_date).toLocaleDateString('vi-VN') : '',
        contract_date: relationData?.created_at ? new Date(relationData.created_at).toLocaleDateString('vi-VN') : now.toLocaleDateString('vi-VN'),
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

// Generate secure share token using global crypto (Node/Browser compatible)
export async function generateShareToken() {
    return (globalThis.crypto as any).randomUUID().replace(/-/g, '')
}
