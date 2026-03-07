import { Metadata } from 'next'
import { QuotationContent } from './quotation-content'
import { getQuotationByToken } from '@/lib/supabase/services/quotation-service'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
    try {
        const { token } = await params
        const quotation = await getQuotationByToken(token)

        if (!quotation) {
            notFound()
        }

        return <QuotationContent quotation={quotation} />
    } catch (error) {
        console.error('Error rendering public quotation page:', error)
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-muted-foreground">Không thể tải báo giá. Vui lòng thử lại sau.</p>
                </div>
            </div>
        )
    }
}
