import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Standard templates with common variables for HTML fallback and variable definition
import { contractTemplate } from './lib/supabase/services/contract-template.js'
import { paymentTemplate } from './lib/supabase/services/payment-template.js'
import { quotationTemplate } from './lib/supabase/services/quotation-template.js'
import { deliveryMinutesTemplate } from './lib/supabase/services/delivery-minutes-template.js'

const defaultTemplates = [
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
        name: 'Báo giá / Đơn đặt hàng (Mẫu chuẩn)',
        type: 'quotation',
        content: quotationTemplate,
        variables: [
            'quotation_number', 'quotation_date', 'day', 'month', 'year',
            'customer_company', 'customer_address', 'customer_tax_code', 'customer_representative', 'customer_phone',
            'quotation_items_table', 'total_amount_number', 'amount_in_words', 'payment_schedule'
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
            'payment_number', 'day', 'month', 'year', 'service_description', 'payment_amount', 'amount_in_words',
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

async function run() {
    const client = new Client({ connectionString: process.env.DIRECT_URL });

    try {
        await client.connect();
        console.log("Connected to DB");

        // 1. Wipe existing document templates
        const delRes = await client.query('DELETE FROM public.document_templates;');
        console.log("Purged old document templates, deleted rows: ", delRes.rowCount);

        // 2. Insert new default templates
        for (const t of defaultTemplates) {
            await client.query(
                'INSERT INTO public.document_templates (name, type, content, variables, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
                [t.name, t.type, t.content, t.variables]
            );
            console.log(`Inserted template: ${t.name}`);
        }

        console.log("Seeding completed successfully");
    } catch (err) {
        console.error("PG ERROR:", err);
    } finally {
        await client.end();
    }
}
run();
