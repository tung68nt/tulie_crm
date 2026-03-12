'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { ArrowLeft, Loader2, Save, Trash2, Files } from 'lucide-react'
import { PriceInput } from '@/components/ui/price-input'
import { Product, DocumentTemplate } from '@/types'
import { updateProduct, deleteProduct } from '@/lib/supabase/services/product-service'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/confirm-dialog'

interface ProductEditClientProps {
    product: Product
    categories: any[]
    units: string[]
}

export default function ProductEditClient({ product, categories, units }: ProductEditClientProps) {
    const router = useRouter()
    const { confirm } = useConfirm()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [templates, setTemplates] = useState<DocumentTemplate[]>([])

    const [name, setName] = useState(product.name)
    const [sku, setSku] = useState(product.sku || '')
    const [category, setCategory] = useState(product.category || '')
    const [description, setDescription] = useState(product.description || '')
    const [unit, setUnit] = useState(product.unit || 'Gói')
    const [price, setPrice] = useState(product.price)
    const [costPrice, setCostPrice] = useState(product.cost_price || 0)
    const [isActive, setIsActive] = useState(product.is_active)
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>(product.default_templates || [])

    useEffect(() => {
        async function loadTemplates() {
            const data = await getDocumentTemplates()
            setTemplates(data)
        }
        loadTemplates()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) {
            toast.error('Vui lòng nhập tên sản phẩm')
            return
        }

        setIsLoading(true)
        try {
            await updateProduct(product.id, {
                name,
                sku,
                category,
                description,
                unit,
                price,
                cost_price: costPrice,
                is_active: isActive,
                default_templates: selectedTemplates
            })
            toast.success('Cập nhật sản phẩm thành công')
            router.push(`/products/${product.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Failed to update product:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xóa sản phẩm',
            description: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động không thể hoàn tác.',
            variant: 'destructive',
            confirmText: 'Xóa sản phẩm',
        })
        if (!confirmed) return

        setIsDeleting(true)
        try {
            await deleteProduct(product.id)
            toast.success('Đã xóa sản phẩm')
            router.push('/products')
            router.refresh()
        } catch (error: any) {
            console.error('Failed to delete product:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href={`/products/${product.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold">Chỉnh sửa sản phẩm</h1>
                        <p className="text-muted-foreground font-normal">{product.name}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting || isLoading}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-9"
                >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Xóa sản phẩm
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-xl border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Thông tin sản phẩm</CardTitle>
                            <CardDescription>Thông tin cơ bản của sản phẩm/dịch vụ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tên sản phẩm <span className="text-destructive">*</span></Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-10 border-zinc-200" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Mã SKU</Label>
                                    <Input value={sku} onChange={(e) => setSku(e.target.value)} className="h-10 border-zinc-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Danh mục</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-10 border-zinc-200">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                            {categories.length === 0 && (
                                                <SelectItem value="Other">Khác</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Đơn vị tính <span className="text-destructive">*</span></Label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger className="h-10 border-zinc-200">
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

                            <div className="space-y-2">
                                <Label>Mô tả</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="border-zinc-200" />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label>Trạng thái</Label>
                                    <p className="text-sm text-muted-foreground font-normal">Sản phẩm có sẵn để bán</p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-xl border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Giá & Chi phí</CardTitle>
                                <CardDescription>Thiết lập giá bán và giá vốn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Giá bán <span className="text-destructive">*</span></Label>
                                    <PriceInput
                                        value={price}
                                        onChange={setPrice}
                                    />
                                    <p className="text-xs text-muted-foreground font-normal">Nhập số tiền VND</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Giá vốn (tùy chọn)</Label>
                                    <PriceInput
                                        value={costPrice}
                                        onChange={setCostPrice}
                                    />
                                    <p className="text-xs text-muted-foreground font-normal">Dùng để tính biên lợi nhuận</p>
                                </div>

                                {price > 0 && costPrice > 0 && (
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mt-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Biên lợi nhuận</p>
                                            <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                                                {(((price - costPrice) / price) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                                checked={selectedTemplates.includes(template.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedTemplates([...selectedTemplates, template.id])
                                                    } else {
                                                        setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
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

                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild className="rounded-lg h-10 px-6 font-medium">
                        <Link href={`/products/${product.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading || isDeleting} className="rounded-lg h-10 px-6 font-medium bg-zinc-900 text-white hover:bg-zinc-800">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
