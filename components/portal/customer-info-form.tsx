'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updatePortalCustomerInfo } from '@/lib/supabase/services/portal-service'
import { Building2, User, FileText, Mail, Phone, MapPin, Save, Lock } from 'lucide-react'

interface CustomerInfoFormProps {
    customer: any
    token: string
    onComplete: () => void
}

export function CustomerInfoForm({ customer, token, onComplete }: CustomerInfoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
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
                            required
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
                            required
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
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Chức vụ</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 rotate-180" /> {/* Position icon */}
                        <Input
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="pl-10 h-11 rounded-xl border-zinc-200 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                            placeholder="Giám đốc, Quản lý..."
                            required
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
                            required
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
                            required
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
                            required
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 italic bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                    <Lock className="h-3 w-3" />
                    Bằng việc nhấn Lưu, bạn xác nhận thông tin trên là chính xác.
                </div>
                <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full sm:w-auto px-10 h-12 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-xl shadow-zinc-950/10 font-bold uppercase tracking-widest text-[11px] transition-all active:scale-[0.98]"
                >
                    {isSubmitting ? 'Đang thực hiện...' : 'Lưu và Xác nhận'}
                </Button>
            </div>
        </form>
    )
}
