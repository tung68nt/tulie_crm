import { Metadata } from 'next'
import { QuotationContent } from './quotation-content'

// Mock data - in real app, fetch by token from database
const mockQuotation = {
    id: '1',
    quote_number: 'QT-2026-0142',
    customer: {
        company_name: 'ABC Corporation',
        email: 'contact@abc.com',
        address: '123 Business St, Tech City',
        tax_code: '0101010101',
        contact_name: 'Mr. John Doe'
    },
    items: [
        { description: 'Thiết kế UI/UX Website', quantity: 1, unit: 'Gói', unit_price: 15000000 },
        { description: 'Lập trình Frontend (Next.js)', quantity: 1, unit: 'Gói', unit_price: 25000000 },
        { description: 'Lập trình Backend (Supabase)', quantity: 1, unit: 'Gói', unit_price: 20000000 },
        { description: 'Hosting & Domain (1 năm)', quantity: 1, unit: 'Năm', unit_price: 2000000 },
    ],
    total_amount: 62000000,
    valid_until: '2026-03-01',
    created_at: '2026-02-02',
    status: 'sent'
}

type Props = {
    params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params

    return {
        title: `Báo giá #${mockQuotation.quote_number} - Tulie CRM`,
        description: `Xem chi tiết báo giá dành cho ${mockQuotation.customer.company_name}`,
    }
}

export default async function PublicQuotationPage({ params }: Props) {
    const { token } = await params
    // In real app: const quotation = await getQuotationByToken(token)

    return <QuotationContent quotation={mockQuotation} />
}
