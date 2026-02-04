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
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Customer, User } from '@/types'
import { updateCustomer, deleteCustomer } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

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
    assigned_to: z.string().min(1, 'Vui lòng chọn người phụ trách'),
    notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
    customer: Customer
}

export function CustomerForm({ customer }: CustomerFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [staff, setStaff] = useState<User[]>([])

    useState(() => {
        const fetchStaff = async () => {
            const users = await getUsers()
            setStaff(users)
        }
        fetchStaff()
    })

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            company_name: customer.company_name,
            tax_code: customer.tax_code || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            invoice_address: customer.invoice_address || '',
            industry: customer.industry || '',
            company_size: customer.company_size || '',
            website: customer.website || '',
            status: customer.status,
            assigned_to: customer.assigned_to || '',
            notes: customer.notes || '',
        },
    })

    const onSubmit = async (data: CustomerFormData) => {
        setIsLoading(true)
        try {
            await updateCustomer(customer.id, data)
            toast.success('Cập nhật khách hàng thành công')
            router.push(`/customers/${customer.id}`)
            router.refresh()
        } catch (error) {
            console.error('Failed to update customer:', error)
            toast.error('Có lỗi xảy ra khi cập nhật khách hàng')
        } finally {
            setIsLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteCustomer(customer.id)
            toast.success('Xóa khách hàng thành công')
            router.push('/customers')
            router.refresh()
        } catch (error) {
            console.error('Failed to delete customer:', error)
            toast.error('Có lỗi xảy ra khi xóa khách hàng')
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Khách hàng <strong>{customer.company_name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/customers/${customer.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chỉnh sửa khách hàng</h1>
                        <p className="text-muted-foreground">{customer.company_name}</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa khách hàng
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Thông tin chính của doanh nghiệp</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">
                                    Tên công ty <span className="text-destructive">*</span>
                                </Label>
                                <Input id="company_name" {...register('company_name')} />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">{errors.company_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_code">Mã số thuế</Label>
                                <Input id="tax_code" {...register('tax_code')} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" {...register('email')} />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" {...register('phone')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    defaultValue={customer.status}
                                    onValueChange={(value) => setValue('status', value as CustomerFormData['status'])}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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

                            <div className="space-y-2">
                                <Label htmlFor="assigned_to">Người phụ trách</Label>
                                <Select
                                    defaultValue={customer.assigned_to}
                                    onValueChange={(value) => setValue('assigned_to', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhân viên phụ trách" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staff.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.full_name} ({member.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.assigned_to && (
                                    <p className="text-sm text-destructive">{errors.assigned_to.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address & Other */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Địa chỉ & Thông tin khác</CardTitle>
                            <CardDescription>Thông tin địa chỉ và xuất hóa đơn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Textarea id="address" {...register('address')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invoice_address">Địa chỉ xuất hóa đơn</Label>
                                <Textarea id="invoice_address" placeholder="Để trống nếu giống địa chỉ công ty" {...register('invoice_address')} />
                            </div>

                            <Separator />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Ngành nghề</Label>
                                    <Select defaultValue={customer.industry} onValueChange={(value) => setValue('industry', value)}>
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
                                    <Select defaultValue={customer.company_size} onValueChange={(value) => setValue('company_size', value)}>
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
                                <Textarea id="notes" {...register('notes')} rows={4} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/customers/${customer.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
