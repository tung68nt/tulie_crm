'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ArrowLeft, Save, Files } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PriceInput } from '@/components/ui/price-input'
import { createProduct } from '@/lib/supabase/services/product-service'
import { getProductCategories, getProductUnits } from '@/lib/supabase/services/settings-service'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { DocumentTemplate } from '@/types'
import { toast } from 'sonner'

const productSchema = z.object({
    name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
    sku: z.string().optional(),
    brand: z.enum(['agency', 'studio', 'academy']),
    category: z.string().optional(),
    description: z.string().optional(),
    unit: z.string().min(1, 'Đơn vị tính là bắt buộc'),
    price: z.number().min(0, 'Giá bán phải lớn hơn 0'),
    cost_price: z.number().optional(),
    is_active: z.boolean(),
    default_templates: z.array(z.string()).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isActive, setIsActive] = useState(true)
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [units, setUnits] = useState<string[]>([])
    const [templates, setTemplates] = useState<DocumentTemplate[]>([])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            is_active: true,
            unit: 'dự án',
            brand: 'agency',
            default_templates: [],
        },
    })

    useEffect(() => {
        async function loadData() {
            const [catData, unitData, templateData] = await Promise.all([
                getProductCategories(),
                getProductUnits(),
                getDocumentTemplates()
            ])
            setCategories(catData)
            setUnits(unitData)
            setTemplates(templateData)

            // Set default unit if available
            if (unitData.length > 0) {
                setValue('unit', unitData[0])
            }
        }
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onSubmit = async (data: ProductFormData) => {
        setIsLoading(true)
        try {
            await createProduct(data)
            toast.success('Thêm sản phẩm mới thành công!')
            router.push('/products')
            router.refresh()
        } catch (error) {
            console.error('Failed to create product:', error)
            toast.error('Có lỗi xảy ra khi thêm sản phẩm')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold">Thêm sản phẩm mới</h1>
                    <p className="text-muted-foreground font-normal">Thêm sản phẩm hoặc dịch vụ vào danh mục</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card className="rounded-xl border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Thông tin sản phẩm</CardTitle>
                            <CardDescription>Thông tin cơ bản của sản phẩm/dịch vụ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Tên sản phẩm <span className="text-destructive">*</span>
                                </Label>
                                <Input id="name" placeholder="Website Development" {...register('name')} />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">Mã SKU</Label>
                                    <Input id="sku" placeholder="WEB-DEV-001" {...register('sku')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Thương hiệu / Brand</Label>
                                    <Select
                                        value={watch('brand')}
                                        onValueChange={(value) => setValue('brand', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thương hiệu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="agency">Tulie Agency</SelectItem>
                                            <SelectItem value="studio">Tulie Studio</SelectItem>
                                            <SelectItem value="academy">Tulie Academy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Danh mục</Label>
                                    <Select
                                        value={watch('category')}
                                        onValueChange={(value) => setValue('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit">
                                        Đơn vị tính <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch('unit')}
                                        onValueChange={(value) => setValue('unit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn ĐVT" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((u) => (
                                                <SelectItem key={u} value={u}>
                                                    {u}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea id="description" placeholder="Mô tả chi tiết về sản phẩm/dịch vụ..." {...register('description')} rows={4} />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label>Trạng thái</Label>
                                    <p className="text-sm text-muted-foreground">Sản phẩm có sẵn để bán</p>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={(checked) => {
                                        setIsActive(checked)
                                        setValue('is_active', checked)
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing & Templates */}
                    <div className="space-y-6">
                        <Card className="rounded-xl border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Giá & Chi phí</CardTitle>
                                <CardDescription>Thiết lập giá bán và giá vốn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Giá bán <span className="text-destructive">*</span>
                                    </Label>
                                    <PriceInput
                                        id="price"
                                        placeholder="50.000.000"
                                        value={watch('price')}
                                        onChange={(val) => setValue('price', val)}
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost_price">Giá vốn (tùy chọn)</Label>
                                    <PriceInput
                                        id="cost_price"
                                        placeholder="30.000.000"
                                        value={watch('cost_price')}
                                        onChange={(val) => setValue('cost_price', val)}
                                    />
                                    <p className="text-xs text-muted-foreground font-normal">Dùng để tính biên lợi nhuận</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Files className="h-5 w-5 text-zinc-500" />
                                    Bộ chứng từ mặc định
                                </CardTitle>
                                <CardDescription>Chọn các mẫu giấy tờ tự động tạo khi báo giá dịch vụ này được duyệt</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors"
                                        >
                                            <Checkbox
                                                id={`template-${template.id}`}
                                                checked={watch('default_templates')?.includes(template.id)}
                                                onCheckedChange={(checked) => {
                                                    const current = watch('default_templates') || []
                                                    if (checked) {
                                                        setValue('default_templates', [...current, template.id])
                                                    } else {
                                                        setValue('default_templates', current.filter(id => id !== template.id))
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor={`template-${template.id}`}
                                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                            >
                                                {template.name}
                                            </Label>
                                        </div>
                                    ))}
                                    {templates.length === 0 && (
                                        <p className="text-sm text-muted-foreground col-span-2 py-8 text-center border border-dashed rounded-lg">
                                            Chưa có mẫu giấy tờ nào được cấu hình
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild className="rounded-lg h-10 px-6 font-medium">
                        <Link href="/products">Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading} className="rounded-lg h-10 px-6 font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu sản phẩm
                    </Button>
                </div>
            </form>
        </div>
    )
}
