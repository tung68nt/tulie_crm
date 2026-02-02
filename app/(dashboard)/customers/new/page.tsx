'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const customerSchema = z.object({
    company_name: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
    tax_code: z.string().optional(),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    invoice_address: z.string().optional(),
    industry: z.string().optional(),
    company_size: z.string().optional(),
    website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    status: z.enum(['lead', 'prospect', 'customer', 'vip', 'churned']),
    notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function NewCustomerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            status: 'lead',
        },
    })

    const onSubmit = async (data: CustomerFormData) => {
        setIsLoading(true)
        try {
            // TODO: API call to create customer
            console.log('Creating customer:', data)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API
            router.push('/customers')
        } catch (error) {
            console.error('Failed to create customer:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/customers">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Thêm khách hàng mới</h1>
                    <p className="text-muted-foreground">
                        Nhập thông tin khách hàng để thêm vào hệ thống
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>
                                Thông tin chính của doanh nghiệp
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">
                                    Tên công ty <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="company_name"
                                    placeholder="Công ty TNHH ABC"
                                    {...register('company_name')}
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_code">Mã số thuế</Label>
                                <Input
                                    id="tax_code"
                                    placeholder="0123456789"
                                    {...register('tax_code')}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="contact@company.com"
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        placeholder="0901234567"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    placeholder="https://company.com"
                                    {...register('website')}
                                />
                                {errors.website && (
                                    <p className="text-sm text-destructive">
                                        {errors.website.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    defaultValue="lead"
                                    onValueChange={(value) =>
                                        setValue('status', value as CustomerFormData['status'])
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Tiềm năng</SelectItem>
                                        <SelectItem value="prospect">Đang theo dõi</SelectItem>
                                        <SelectItem value="customer">Khách hàng</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                        <SelectItem value="churned">Đã rời bỏ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address & Invoice */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Địa chỉ & Thông tin xuất hóa đơn</CardTitle>
                            <CardDescription>
                                Thông tin địa chỉ và xuất hóa đơn VAT
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    {...register('address')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invoice_address">
                                    Địa chỉ xuất hóa đơn
                                </Label>
                                <Textarea
                                    id="invoice_address"
                                    placeholder="Để trống nếu giống địa chỉ công ty"
                                    {...register('invoice_address')}
                                />
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Ngành nghề</Label>
                                    <Select onValueChange={(value) => setValue('industry', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn ngành nghề" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technology">Công nghệ</SelectItem>
                                            <SelectItem value="retail">Bán lẻ</SelectItem>
                                            <SelectItem value="manufacturing">Sản xuất</SelectItem>
                                            <SelectItem value="services">Dịch vụ</SelectItem>
                                            <SelectItem value="education">Giáo dục</SelectItem>
                                            <SelectItem value="healthcare">Y tế</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_size">Quy mô</Label>
                                    <Select
                                        onValueChange={(value) => setValue('company_size', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn quy mô" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-10">1-10 nhân viên</SelectItem>
                                            <SelectItem value="11-50">11-50 nhân viên</SelectItem>
                                            <SelectItem value="51-200">51-200 nhân viên</SelectItem>
                                            <SelectItem value="201-500">201-500 nhân viên</SelectItem>
                                            <SelectItem value="500+">500+ nhân viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ghi chú về khách hàng..."
                                    {...register('notes')}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/customers">Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu khách hàng
                    </Button>
                </div>
            </form>
        </div>
    )
}
