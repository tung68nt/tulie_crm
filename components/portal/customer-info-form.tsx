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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company_name" className="text-right">Tên công ty</Label>
                    <Input
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tax_code" className="text-right">Mã số thuế</Label>
                    <Input
                        id="tax_code"
                        name="tax_code"
                        value={formData.tax_code}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="representative" className="text-right">Người đại diện</Label>
                    <Input
                        id="representative"
                        name="representative"
                        value={formData.representative}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">Chức vụ</Label>
                    <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                    <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invoice_address" className="text-right">Địa chỉ xuất HĐ</Label>
                    <Input
                        id="invoice_address"
                        name="invoice_address"
                        value={formData.invoice_address}
                        onChange={handleChange}
                        className="col-span-3"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto italic">
                    <Lock className="h-3 w-3" />
                    Thông tin sẽ được khóa sau khi gửi
                </div>
                <Button type="submit" disabled={isSubmitting} className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black">
                    {isSubmitting ? 'Đang lưu...' : 'Lưu và Khóa thông tin'}
                </Button>
            </div>
        </form>
    )
}
