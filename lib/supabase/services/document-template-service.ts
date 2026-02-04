'use server'
import { createClient } from '../server'

export interface DocumentTemplate {
    id: string
    name: string
    type: 'contract' | 'invoice' | 'payment_request' | 'quotation' | 'order'
    content: string  // HTML content with {{variables}}
    variables: string[]  // List of variable names used in template
    created_at: string
    updated_at: string
}

export interface DocumentBundle {
    id: string
    name: string
    customer_id: string
    contract_id?: string
    templates: string[]  // Template IDs included in bundle
    generated_documents: GeneratedDocument[]
    share_token?: string
    expires_at?: string
    created_at: string
}

export interface GeneratedDocument {
    id: string
    bundle_id: string
    template_id: string
    template_name: string
    content: string  // Filled HTML content
    status: 'draft' | 'pending_review' | 'approved' | 'signed'
    signed_at?: string
    created_at: string
}

// Default templates with common variables
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'Hợp đồng dịch vụ',
        type: 'contract',
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
    <h1 style="text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    </h1>
    <p style="text-align: center; font-weight: bold;">Độc lập – Tự do – Hạnh phúc</p>
    <p style="text-align: center;">---oOo---</p>
    
    <h2 style="text-align: center; margin-top: 30px;">HỢP ĐỒNG DỊCH VỤ</h2>
    <p style="text-align: center; font-style: italic;">Số: {{contract_number}}</p>
    
    <p style="margin-top: 20px;">Hôm nay, ngày {{contract_date}}, tại {{location}}, chúng tôi gồm:</p>
    
    <h3>BÊN A (Bên cung cấp dịch vụ):</h3>
    <ul>
        <li>Tên công ty: {{provider_company}}</li>
        <li>Địa chỉ: {{provider_address}}</li>
        <li>Mã số thuế: {{provider_tax_code}}</li>
        <li>Đại diện: {{provider_representative}}</li>
        <li>Chức vụ: {{provider_position}}</li>
    </ul>
    
    <h3>BÊN B (Bên sử dụng dịch vụ):</h3>
    <ul>
        <li>Tên công ty: {{customer_company}}</li>
        <li>Địa chỉ: {{customer_address}}</li>
        <li>Mã số thuế: {{customer_tax_code}}</li>
        <li>Đại diện: {{customer_representative}}</li>
        <li>Chức vụ: {{customer_position}}</li>
        <li>Email: {{customer_email}}</li>
        <li>Điện thoại: {{customer_phone}}</li>
    </ul>
    
    <h3>ĐIỀU 1: NỘI DUNG DỊCH VỤ</h3>
    <p>{{service_description}}</p>
    
    <h3>ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG</h3>
    <p>Tổng giá trị hợp đồng: <strong>{{total_amount}} VNĐ</strong></p>
    <p>(Bằng chữ: {{amount_in_words}})</p>
    
    <h3>ĐIỀU 3: TIẾN ĐỘ THANH TOÁN</h3>
    {{payment_schedule}}
    
    <h3>ĐIỀU 4: THỜI HẠN HỢP ĐỒNG</h3>
    <p>Từ ngày {{start_date}} đến ngày {{end_date}}</p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center; width: 45%;">
            <p><strong>ĐẠI DIỆN BÊN A</strong></p>
            <p style="margin-top: 80px;">{{provider_representative}}</p>
        </div>
        <div style="text-align: center; width: 45%;">
            <p><strong>ĐẠI DIỆN BÊN B</strong></p>
            <p style="margin-top: 80px;">{{customer_representative}}</p>
        </div>
    </div>
</div>
        `,
        variables: [
            'contract_number', 'contract_date', 'location',
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative', 'provider_position',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_position', 'customer_email', 'customer_phone',
            'service_description', 'total_amount', 'amount_in_words', 'payment_schedule',
            'start_date', 'end_date'
        ]
    },
    {
        name: 'Đề nghị thanh toán',
        type: 'payment_request',
        content: `
<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2>{{provider_company}}</h2>
        <p>{{provider_address}}</p>
        <p>MST: {{provider_tax_code}}</p>
    </div>
    
    <h2 style="text-align: center; margin-top: 30px;">ĐỀ NGHỊ THANH TOÁN</h2>
    <p style="text-align: center;">Số: {{payment_number}}</p>
    <p style="text-align: center;">Ngày: {{payment_date}}</p>
    
    <p style="margin-top: 20px;">Kính gửi: <strong>{{customer_company}}</strong></p>
    <p>Địa chỉ: {{customer_address}}</p>
    
    <p style="margin-top: 20px;">Căn cứ Hợp đồng số: <strong>{{contract_number}}</strong> ký ngày {{contract_date}}</p>
    
    <p>Chúng tôi kính đề nghị Quý công ty thanh toán khoản tiền sau:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Nội dung</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Số tiền</th>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">{{payment_description}}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">{{payment_amount}} VNĐ</td>
        </tr>
        <tr style="font-weight: bold;">
            <td style="border: 1px solid #ddd; padding: 10px;">Tổng cộng</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">{{payment_amount}} VNĐ</td>
        </tr>
    </table>
    
    <p>(Bằng chữ: {{amount_in_words}})</p>
    
    <h3>Thông tin chuyển khoản:</h3>
    <ul>
        <li>Ngân hàng: {{bank_name}}</li>
        <li>Số tài khoản: {{bank_account}}</li>
        <li>Chủ tài khoản: {{account_holder}}</li>
        <li>Nội dung CK: {{transfer_content}}</li>
    </ul>
    
    <p>Hạn thanh toán: <strong>{{due_date}}</strong></p>
    
    <p style="margin-top: 30px;">Trân trọng cảm ơn Quý công ty!</p>
    
    <div style="text-align: right; margin-top: 50px;">
        <p><strong>{{provider_company}}</strong></p>
        <p style="margin-top: 60px;">{{provider_representative}}</p>
    </div>
</div>
        `,
        variables: [
            'provider_company', 'provider_address', 'provider_tax_code', 'provider_representative',
            'customer_company', 'customer_address',
            'contract_number', 'contract_date',
            'payment_number', 'payment_date', 'payment_description', 'payment_amount', 'amount_in_words',
            'bank_name', 'bank_account', 'account_holder', 'transfer_content',
            'due_date'
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
            id: `default-${i}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })) as DocumentTemplate[]
    }

    return data as DocumentTemplate[]
}

// Get template by ID
export async function getTemplateById(id: string) {
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
}

// Fill template with variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
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
    const supabase = await createClient()

    // Get template
    const template = await getTemplateById(templateId)
    if (!template) throw new Error('Template not found')

    // Get customer data
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

    if (!customer) throw new Error('Customer not found')

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
        provider_company: 'Công ty TNHH Tulie Lab',
        provider_address: 'Tầng 5, Tòa nhà ABC, Quận 1, TP.HCM',
        provider_tax_code: '0123456789',
        provider_representative: '',
        provider_position: 'Giám đốc',

        // Date variables
        contract_date: new Date().toLocaleDateString('vi-VN'),
        location: 'TP. Hồ Chí Minh',

        ...additionalVariables
    }

    // Add contract variables if available
    if (contract) {
        variables.contract_number = contract.contract_number || ''
        variables.total_amount = new Intl.NumberFormat('vi-VN').format(contract.total_value || 0)
        variables.start_date = contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : ''
        variables.end_date = contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : ''
        variables.service_description = contract.description || ''
    }

    // Fill the template
    const filledContent = fillTemplate(template.content, variables)

    return {
        template,
        customer,
        contract,
        filledContent,
        variables,
        missingVariables: template.variables.filter(v => !variables[v] || variables[v] === '')
    }
}

// Create a shareable bundle
export async function createDocumentBundle(
    customerId: string,
    contractId: string,
    templateIds: string[],
    name: string
) {
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
}
