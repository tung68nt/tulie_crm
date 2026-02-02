'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuotationForm } from '@/components/quotations/quotation-form'
import QuotationPreview from '@/components/quotations/quotation-preview'
import { ArrowLeft, Eye, Save, Send, Loader2 } from 'lucide-react'

// Mock Data (Replace with API fetch)
const mockProducts = [
    { id: '1', name: 'Website Development', unit_price: 50000000, unit: 'dự án', description: 'Thiết kế và lập trình website trọn gói' },
    { id: '2', name: 'SEO Package - Basic', unit_price: 10000000, unit: 'tháng', description: 'Tối ưu hóa công cụ tìm kiếm cơ bản' },
    { id: '3', name: 'Social Media Management', unit_price: 15000000, unit: 'tháng', description: 'Quản lý Fanpage, content, hình ảnh' },
    { id: '4', name: 'Logo Design', unit_price: 8000000, unit: 'thiết kế', description: 'Thiết kế Logo nhận diện thương hiệu' },
    { id: '5', name: 'Brand Identity Package', unit_price: 35000000, unit: 'gói', description: 'Bộ nhận diện thương hiệu đầy đủ' },
    { id: '6', name: 'Backdrop Event', unit_price: 1500000, unit: 'm2', description: 'In ấn & thi công backdrop (Hiflex/PP)' },
    { id: '7', name: 'Photobooth', unit_price: 5000000, unit: 'gói', description: 'Chụp hình lấy liền, thiết kế frame' },
]

const mockCustomers = [
    { id: '1', company_name: 'ABC Corporation', address: 'London, UK', phone: '0123456789' },
    { id: '2', company_name: 'XYZ Limited', address: 'New York, USA', phone: '0987654321' },
    { id: '3', company_name: 'DEF Industries' },
    { id: '4', company_name: 'GHI Company' },
]

export default function NewQuotationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // State to hold current form data for preview/save
    const [formData, setFormData] = useState<any>({
        items: [],
        vat_percent: 0,
        subtotal: 0,
        grand_total: 0
    })

    const handleFormChange = (data: any) => {
        setFormData(data)
    }

    const handleSave = async (send: boolean = false) => {
        if (!formData.customer_id) {
            alert('Vui lòng chọn khách hàng')
            return
        }

        setIsLoading(true)
        try {
            // TODO: API call to save quotation
            console.log('Saving quotation:', { ...formData, send })

            // Simulating API delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            if (send) {
                alert('Đã lưu và gửi báo giá thành công!')
            } else {
                alert('Đã lưu nháp báo giá!')
            }
            router.push('/quotations')
        } catch (error) {
            console.error('Failed to save quotation:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/quotations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Tạo báo giá mới</h1>
                        <p className="text-muted-foreground">
                            Tạo báo giá đa dịch vụ (Thiết kế, In ấn, Website...)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(true)} disabled={isLoading}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu nháp
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Lưu & Gửi
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <QuotationForm
                customers={mockCustomers}
                products={mockProducts}
                onChange={handleFormChange}
                onSave={handleSave}
                isLoading={isLoading}
            />

            {/* Preview Modal */}
            <QuotationPreview
                data={formData}
                open={showPreview}
                onOpenChange={setShowPreview}
            />
        </div>
    )
}
