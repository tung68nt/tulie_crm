'use server'
import { createClient } from '../server'
import crypto from 'crypto'
import { DocumentTemplate, DocumentBundle, GeneratedDocument } from '@/types'
import { readNumberToWords } from '@/lib/utils/format'

import { contractTemplate } from './contract-template'
import { paymentTemplate } from './payment-template'
import { quotationTemplate } from './quotation-template'

// Default templates with common variables
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'Hợp đồng dịch vụ',
        type: 'contract',
        content: contractTemplate,
        variables: [
            'contract_number', 'contract_date', 'location',
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative', 'provider_position',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_position', 'customer_email', 'customer_phone',
            'service_description', 'total_amount_number', 'amount_in_words', 'payment_schedule', 'contract_items_table',
            'start_date', 'end_date'
        ]
    },
    {
        name: 'Đề nghị thanh toán',
        type: 'payment_request',
        content: paymentTemplate,
        variables: [
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative',
            'customer_company', 'customer_address',
            'contract_number', 'contract_date',
            'payment_number', 'payment_date', 'payment_description', 'payment_amount', 'amount_in_words',
            'bank_name', 'bank_account', 'account_holder', 'transfer_content',
            'due_date'
        ]
    },
    {
        name: 'Báo giá / Đơn đặt hàng',
        type: 'quotation',
        content: quotationTemplate,
        variables: [
            'quotation_number', 'quotation_date',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_position', 'customer_email', 'customer_phone',
            'quotation_items_table', 'total_amount_number', 'amount_in_words', 'payment_schedule'
        ]
    }
]

// Get all templates
export async function getDocumentTemplates() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching templates:', error)
        // Return default templates if table doesn't exist
        return defaultTemplates.map((t, i) => ({
            ...t,
            id: `default -${i} `,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })) as DocumentTemplate[]
    }

    return data as DocumentTemplate[]
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
        console.error('Fatal error in getTemplateById:', err)
        return null
    }
}

// Create template
export async function createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('document_templates')
            .insert([template])
            .select()
            .single()

        if (error) {
            console.error('Error creating template:', error)
            throw error
        }

        return data as DocumentTemplate
    } catch (err: any) {
        console.error('Fatal error in createDocumentTemplate:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo mẫu')
    }
}

// Update template
export async function updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('document_templates')
            .update(template)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating template:', error)
            throw error
        }

        return data as DocumentTemplate
    } catch (err: any) {
        console.error('Fatal error in updateDocumentTemplate:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật mẫu')
    }
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

// Generate document from template and customer data
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
                .select('*, milestones:contract_milestones(*)')
                .eq('id', contractId)
                .single()
            contract = data
        }

        // Build variables map
        const variables: Record<string, string> = {
            // Customer variables
            customer_company: customer.company_name || '',
            customer_address: customer.address || '',
            customer_tax_code: customer.tax_code || '',
            customer_email: customer.email || '',
            customer_phone: customer.phone || '',
            customer_representative: '', // To be filled by user
            customer_position: '',

            // Provider variables (default company info)
            provider_company: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
            provider_address: 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam',
            provider_tax_code: '0110163102',
            provider_representative: 'Nguyễn Thanh Tùng',
            provider_position: 'Giám đốc',
            bank_name: 'TMCP Kỹ Thương Việt Nam (Techcombank)',
            bank_account: '86683979',
            account_holder: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',

            // Date variables
            contract_date: new Date().toLocaleDateString('vi-VN'),
            quotation_date: new Date().toLocaleDateString('vi-VN'),
            payment_date: new Date().toLocaleDateString('vi-VN'),
            location: 'Hà Nội',

            // Default specific numbers if not provided
            quotation_number: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            payment_number: `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,

            ...additionalVariables
        }

        // Handle amount_in_words if payment_amount or total_amount is in additionalVariables
        if (additionalVariables?.payment_amount && !variables.amount_in_words) {
            const amount = parseFloat(additionalVariables.payment_amount.replace(/[^0-9]/g, ''))
            if (!isNaN(amount)) {
                variables.amount_in_words = readNumberToWords(amount)
            }
        }

        // Add contract variables if available
        if (contract) {
            variables.contract_number = contract.contract_number || ''
            variables.contract_date = contract.created_at ? new Date(contract.created_at).toLocaleDateString('vi-VN') : variables.contract_date
            variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)
            if (!variables.amount_in_words) {
                variables.amount_in_words = readNumberToWords(contract.total_amount || 0)
            }
            variables.start_date = contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : ''
            variables.end_date = contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : ''
            variables.service_description = contract.description || ''

            // Build items table dynamically
            let itemsHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">'
            itemsHtml += '<tr><th style="border: 1px solid #000; padding: 8px; text-align: center;">STT</th><th style="border: 1px solid #000; padding: 8px;">Tên hàng hoá, dịch vụ</th><th style="border: 1px solid #000; padding: 8px; text-align: center;">ĐVT</th><th style="border: 1px solid #000; padding: 8px; text-align: center;">SL</th><th style="border: 1px solid #000; padding: 8px; text-align: right;">Đơn giá</th><th style="border: 1px solid #000; padding: 8px; text-align: right;">Thành tiền</th></tr>'
            if (contract.items && contract.items.length > 0) {
                contract.items.forEach((item: any, index: number) => {
                    itemsHtml += `<tr>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #000; padding: 8px;">${item.name}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.unit}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.unit_price)}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                    </tr>`
                })
            }
            itemsHtml += '</table>'
            variables.contract_items_table = itemsHtml
            variables.quotation_items_table = itemsHtml // Reuse for quotation if needed

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

        // Fill the template
        const filledContent = await fillTemplate(template.content, variables)

        return {
            template,
            customer,
            contract,
            filledContent,
            variables,
            missingVariables: template.variables.filter(v => !variables[v] || variables[v] === '')
        }
    } catch (err: any) {
        console.error('Fatal error in generateDocument:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo tài liệu')
    }
}

// Create a shareable bundle
export async function createDocumentBundle(
    customerId: string,
    contractId: string,
    templateIds: string[],
    name: string
) {
    try {
        // Generate a secure share token
        const shareToken = crypto.randomUUID().replace(/-/g, '')
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        const bundle: DocumentBundle = {
            id: crypto.randomUUID(),
            name,
            customer_id: customerId,
            contract_id: contractId,
            templates: templateIds,
            generated_documents: [],
            share_token: shareToken,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
        }

        // In a real implementation, save to database
        // For now, return the bundle structure
        return {
            bundle,
            shareUrl: `/portal/${shareToken}`
        }
    } catch (err) {
        console.error('Fatal error in createDocumentBundle:', err)
        return null
    }
}
