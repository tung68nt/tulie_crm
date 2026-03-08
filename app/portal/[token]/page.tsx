import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalContent from './portal-content'
import PortalPasswordForm from './password-form'
import { getPortalDataByToken } from '@/lib/supabase/services/portal-service'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params
    const data = await getPortalDataByToken(token)

    if (!data) {
        return {
            title: 'Không tìm thấy thông tin - Tulie Agency'
        }
    }

    return {
        title: `Dự án: ${data.customer?.company_name || 'Khách hàng'} - Tulie Agency`,
        description: `Theo dõi tiến độ triển khai dành cho ${data.customer?.company_name}`,
    }
}

export default async function PublicPortalPage({ params }: Props) {
    try {
        const { token } = await params
        const data = await getPortalDataByToken(token)

        if (!data) {
            notFound()
        }

        // Check for password protection (Quotation password takes precedence, then Project password)
        const passwordHash = data.quotation.password_hash || data.project?.password_hash

        if (passwordHash) {
            const cookieStore = await cookies()
            const isAuthenticated = cookieStore.get(`portal_auth_${token}`)?.value === 'true'

            if (!isAuthenticated) {
                return <PortalPasswordForm token={token} companyName={data.customer?.company_name} />
            }
        }

        return <PortalContent data={data} token={token} />
    } catch (error) {
        console.error('Error rendering portal page:', error)
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-muted-foreground">Không thể tải trang portal. Vui lòng thử lại sau.</p>
                </div>
            </div>
        )
    }
}
