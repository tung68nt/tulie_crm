'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuotationForm } from '@/components/quotations/quotation-form'
import QuotationPreview from '@/components/quotations/quotation-preview'
import { ArrowLeft, Eye, Save, Send, Loader2 } from 'lucide-react'
import { createQuotation } from '@/lib/supabase/services/quotation-service'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface NewQuotationClientProps {
    initialCustomers: any[]
    initialProducts: any[]
    units: string[]
    projects: any[]
    preselectedCustomerId?: string
    brandConfig?: any
}

export default function NewQuotationClient({ initialCustomers, initialProducts, units, projects, preselectedCustomerId, brandConfig }: NewQuotationClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const [formData, setFormData] = useState<any>({
        customer_id: preselectedCustomerId || '',
        items: [],
        vat_percent: 0,
        subtotal: 0,
        grand_total: 0
    })

    const handleFormChange = useCallback((data: any) => {
        setFormData(data)
    }, [])

    const handleSave = async (send: boolean = false) => {
        if (!formData.customer_id) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }

        if (!formData.items || formData.items.length === 0) {
            toast.error('Vui lòng thêm ít nhất một sản phẩm/dịch vụ')
            return
        }

        setIsLoading(true)
        const supabase = createClient()
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Bạn cần đăng nhập để thực hiện thao tác này')
                return
            }

            const quotationData = {
                customer_id: formData.customer_id,
                quotation_number: `BG-${Date.now()}`,
                title: formData.title || '',
                status: send ? 'sent' : 'draft',
                issue_date: new Date().toISOString(),
                valid_until: new Date(Date.now() + (formData.valid_days || 30) * 24 * 60 * 60 * 1000).toISOString(),
                subtotal: formData.subtotal,
                vat_percent: formData.vat_percent,
                vat_amount: formData.vat_amount,
                total_amount: formData.grand_total,
                terms: formData.terms,
                notes: formData.notes,
                bank_name: formData.bank_name,
                bank_account_no: formData.bank_account_no,
                bank_account_name: formData.bank_account_name,
                bank_branch: formData.bank_branch,
                created_by: user.id,
                type: formData.type || 'standard',
                proposal_content: formData.proposal_content || null,
                project_id: formData.project_id || null
            }

            const items = formData.items.map((item: any) => ({
                product_id: item.product_id || null,
                product_name: item.product_name || item.name || '',
                description: item.description || '',
                section_name: item.section_name || null,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price || item.price || 0,
                discount: item.discount || item.discount_percent || 0,
                total_price: item.total_price || item.total || 0,
                sort_order: item.sort_order || 0
            }))

            await createQuotation(quotationData as any, items)

            toast.success(send ? 'Đã lưu và gửi báo giá thành công!' : 'Đã lưu nháp báo giá!')
            router.push('/quotations')
            router.refresh()
        } catch (error) {
            console.error('Failed to save quotation:', error)
            toast.error('Có lỗi xảy ra khi lưu báo giá')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-zinc-100 h-10 w-10">
                        <Link href="/quotations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Tạo báo giá mới</h1>
                        <p className="text-[14px] text-muted-foreground">
                            Khởi tạo hồ sơ báo giá mới đa dịch vụ
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(true)} disabled={isLoading} className="rounded-xl font-bold h-10">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading} className="rounded-xl font-bold h-10">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu nháp
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isLoading} className="px-6 h-10 font-bold rounded-xl">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Lưu & Gửi
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <QuotationForm
                customers={initialCustomers}
                products={initialProducts}
                units={units}
                projects={projects}
                initialCustomerId={preselectedCustomerId}
                onChange={handleFormChange}
                onSave={(send) => handleSave(send)}
                isLoading={isLoading}
                hideHeader={true}
                brandConfig={brandConfig}
            />

            {/* Preview Modal */}
            <QuotationPreview
                data={{ ...formData, brandConfig }}
                open={showPreview}
                onOpenChange={setShowPreview}
            />
        </div>
    )
}
