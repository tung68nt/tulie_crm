'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createDeal } from '@/lib/supabase/services/deal-service'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DealFormProps {
    customers: any[]
    users: any[]
}

export function DealForm({ customers = [], users = [] }: DealFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        customer_id: '',
        budget: '0',
        priority: 'medium',
        status: 'new',
        description: '',
        assigned_to: '',
        brand: 'agency',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customer_id || !formData.title) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
            return
        }

        setIsLoading(true)
        try {
            await createDeal({
                ...formData,
                status: formData.status as any,
                priority: formData.priority as any,
                budget: parseFloat(formData.budget),
                assigned_to: formData.assigned_to === '' ? undefined : formData.assigned_to,
                brand: formData.brand as any
            })
            toast.success('Đã tạo cơ hội mới thành công')
            router.push('/deals')
            router.refresh()
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo cơ hội')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="title">Tên cơ hội / Dự án *</Label>
                            <Input
                                id="title"
                                placeholder="VD: Thiết kế Website & Landing page - Công ty A"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer_id">Khách hàng *</Label>
                            <Select
                                value={formData.customer_id}
                                onValueChange={(val) => setFormData({ ...formData, customer_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khách hàng..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">Ngân sách dự kiến (VNĐ)</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assigned_to">Sales phụ trách</Label>
                            <Select
                                value={formData.assigned_to}
                                onValueChange={(val) => setFormData({ ...formData, assigned_to: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhân viên phụ trách..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((u: any) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">Thương hiệu (Brand)</Label>
                            <Select
                                value={formData.brand}
                                onValueChange={(val) => setFormData({ ...formData, brand: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agency">Tulie Agency</SelectItem>
                                    <SelectItem value="studio">Tulie Studio</SelectItem>
                                    <SelectItem value="academy">Tulie Academy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Mức độ ưu tiên</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val) => setFormData({ ...formData, priority: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Thấp</SelectItem>
                                    <SelectItem value="medium">Trung bình</SelectItem>
                                    <SelectItem value="high">Cao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="description">Mô tả / Yêu cầu chi tiết</Label>
                            <Textarea
                                id="description"
                                placeholder="Ghi chú thêm về yêu cầu của khách hàng, các điểm cần lưu ý..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Tạo cơ hội
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
