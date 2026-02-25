'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { PriceInput } from '@/components/ui/price-input'
import { Product } from '@/types'
import { updateProduct, deleteProduct } from '@/lib/supabase/services/product-service'
import { toast } from 'sonner'

interface ProductEditClientProps {
    product: Product
    categories: any[]
    units: string[]
}

export default function ProductEditClient({ product, categories, units }: ProductEditClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [name, setName] = useState(product.name)
    const [sku, setSku] = useState(product.sku || '')
    const [category, setCategory] = useState(product.category || '')
    const [description, setDescription] = useState(product.description || '')
    const [unit, setUnit] = useState(product.unit || 'Gói')
    const [price, setPrice] = useState(product.price)
    const [costPrice, setCostPrice] = useState(product.cost_price || 0)
    const [isActive, setIsActive] = useState(product.is_active)

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
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/products/${product.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold">Chỉnh sửa sản phẩm</h1>
                        <p className="text-muted-foreground">{product.name}</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting || isLoading}
                >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Xóa sản phẩm
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin sản phẩm</CardTitle>
                            <CardDescription>Thông tin cơ bản của sản phẩm/dịch vụ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tên sản phẩm <span className="text-destructive">*</span></Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Mã SKU</Label>
                                    <Input value={sku} onChange={(e) => setSku(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Danh mục</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
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
                                <Label>Đơn vị tính</Label>
                                <Select value={unit} onValueChange={setUnit}>
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

                            <div className="space-y-2">
                                <Label>Mô tả</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Trạng thái</Label>
                                    <p className="text-sm text-muted-foreground">Sản phẩm có sẵn để bán</p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
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
                                <p className="text-xs text-muted-foreground">Nhập số tiền VND</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Giá vốn</Label>
                                <PriceInput
                                    value={costPrice}
                                    onChange={setCostPrice}
                                />
                            </div>

                            {price > 0 && costPrice > 0 && (
                                <div className="p-4 bg-green-500/10 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Biên lợi nhuận</p>
                                    <p className="text-2xl font-semibold text-green-500">
                                        {(((price - costPrice) / price) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/products/${product.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading || isDeleting}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
