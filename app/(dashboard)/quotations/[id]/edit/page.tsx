import { getQuotationById } from '@/lib/supabase/services/quotation-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getProducts } from '@/lib/supabase/services/product-service'
import { getProductUnits } from '@/lib/supabase/services/settings-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import { notFound } from 'next/navigation'
import { QuotationForm } from '@/components/quotations/quotation-form'

interface EditQuotationPageProps {
    params: Promise<{ id: string }>
}

export default async function EditQuotationPage({ params }: EditQuotationPageProps) {
    let id: string;
    try {
        const p = await params;
        id = p.id;
    } catch (e) {
        console.error("Error awaiting params:", e);
        return <div className="p-8 text-red-500">Lỗi tham số đường dẫn</div>;
    }

    try {
        const [quotation, customers, products, units, projects] = await Promise.all([
            getQuotationById(id),
            getCustomers(),
            getProducts(),
            getProductUnits(),
            getProjects()
        ])

        if (!quotation) {
            console.error(`Quotation with ID ${id} not found`);
            notFound()
        }

        return (
            <QuotationForm
                quotation={quotation}
                customers={customers || []}
                products={products || []}
                units={units || []}
                projects={projects || []}
            />
        )
    } catch (err) {
        console.error('Fatal error rendering EditQuotationPage:', err)
        return (
            <div className="p-8 space-y-4">
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    <h2 className="font-semibold text-lg">Đã có lỗi xảy ra khi tải dữ liệu</h2>
                    <p>Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
                </div>
                <pre className="p-4 bg-gray-50 text-xs overflow-auto rounded-md">
                    {JSON.stringify(err, null, 2)}
                </pre>
            </div>
        )
    }
}
