'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updatePortalCustomerInfo, savePortalCustomerInfoDraft } from '@/lib/supabase/services/portal-service'
import { Building2, User, FileText, Mail, Phone, MapPin, Save, Lock, CheckCircle2 } from 'lucide-react'

interface CustomerInfoFormProps {
    customer: any
    token: string
    onComplete: () => void
    onDraftSave?: () => void
}

// Required fields for final submission
const REQUIRED_FIELDS = ['company_name', 'tax_code', 'representative', 'position', 'email', 'phone', 'address'] as const

export function CustomerInfoForm({ customer, token, onComplete, onDraftSave }: CustomerInfoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [formData, setFormData] = useState({
        company_name: customer.company_name || '',
        representative: customer.representative || '',
        position: customer.position || '',
        tax_code: customer.tax_code || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        invoice_address: customer.invoice_address || customer.address || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Check if all required fields are filled
    const allFieldsFilled = REQUIRED_FIELDS.every(f => formData[f]?.trim())

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await updatePortalCustomerInfo(token, customer.id, formData)
            if (result.success) {
                toast.success('Thông tin đã được cập nhật và lưu trữ thành công.')
                onComplete()
            } else {
                toast.error(result.error || 'Đã xảy ra lỗi khi cập nhật thông tin.')
            }
        } catch (error) {
            toast.error('Lỗi kết nối. Vui lòng thử lại sau.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveDraft = async () => {
        setIsSavingDraft(true)
        try {
            const result = await savePortalCustomerInfoDraft(token, customer.id, formData)
            if (result.success) {
                toast.success('Đã lưu tạm thông tin. Bạn có thể bổ sung sau.')
                onDraftSave?.()
            } else {
                toast.error(result.error || 'Đã xảy ra lỗi khi lưu tạm.')
            }
        } catch (error) {
            toast.error('Lỗi kết nối. Vui lòng thử lại sau.')
        } finally {
            setIsSavingDraft(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tên công ty / Tổ chức</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Tên pháp nhân trên hợp đồng"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tax_code" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mã số thuế</Label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="tax_code"
                            name="tax_code"
                            value={formData.tax_code}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Mã số thuế doanh nghiệp"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="representative" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Người đại diện</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="representative"
                            name="representative"
                            value={formData.representative}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Họ và tên người đại diện"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Chức vụ</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 rotate-180" />
                        <Input
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Giám đốc, Quản lý..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email giao dịch</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="email@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Số điện thoại</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Số điện thoại liên hệ"
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Địa chỉ trụ sở</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Địa chỉ đăng ký kinh doanh"
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="invoice_address" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Địa chỉ xuất hóa đơn (nếu khác)</Label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 opacity-50" />
                        <Input
                            id="invoice_address"
                            name="invoice_address"
                            value={formData.invoice_address}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Bỏ trống nếu trùng với địa chỉ trụ sở"
                        />
                    </div>
                </div>
            </div>

            {/* Filled status indicator */}
            {!allFieldsFilled && (
                <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                    <Save className="h-3.5 w-3.5" />
                    Còn trường chưa điền. Bạn có thể "Lưu tạm" và bổ sung sau.
                </div>
            )}

            {allFieldsFilled && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Thông tin đã đầy đủ. Nhấn "Lưu và Xác nhận" để hoàn tất.
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 italic bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <Lock className="h-3 w-3" />
                    Xác nhận = thông tin sẽ được dùng cho hợp đồng.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSavingDraft || isSubmitting}
                        onClick={handleSaveDraft}
                        className="flex-1 sm:flex-initial px-6 h-11 rounded-xl font-semibold text-[11px] transition-all"
                    >
                        <Save className="h-3.5 w-3.5 mr-2" />
                        {isSavingDraft ? 'Đang lưu...' : 'Lưu tạm'}
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || isSavingDraft || !allFieldsFilled} 
                        className="flex-1 sm:flex-initial px-8 h-11 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-xl shadow-zinc-950/10 font-bold text-[11px] transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Đang thực hiện...' : 'Lưu và Xác nhận'}
                    </Button>
                </div>
            </div>
        </form>
    )
}

/** Check if customer has all required fields filled */
export function isCustomerInfoComplete(customer: any): boolean {
    if (!customer) return false
    return REQUIRED_FIELDS.every(f => customer[f]?.toString().trim())
}
