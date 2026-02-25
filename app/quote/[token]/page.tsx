import { Metadata } from 'next'
import { QuotationContent } from './quotation-content'
import { getQuotationByToken } from '@/lib/supabase/services/quotation-service'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params
    const quotation = await getQuotationByToken(token)

    if (!quotation) {
        return {
            title: 'Không tìm thấy báo giá - Tulie CRM'
        }
    }

    return {
        title: `Báo giá #${quotation.quotation_number} - Tulie CRM`,
        description: `Xem chi tiết báo giá dành cho ${quotation.customer?.company_name}`,
    }
}

export default async function PublicQuotationPage({ params }: Props) {
    const { token } = await params
    const quotation = await getQuotationByToken(token)

    if (!quotation) {
        notFound()
    }

    return <QuotationContent quotation={quotation} />
}
