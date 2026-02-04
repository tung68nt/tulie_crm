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

// Mock data
const mockProduct = {
 id: '1',
 name: 'Website Development',
 sku: 'WEB-DEV-001',
 category: 'Web Development',
 description: 'Thiết kế và phát triển website doanh nghiệp theo yêu cầu.',
 unit: 'dự án',
 unit_price: 50000000,
 cost_price: 30000000,
 is_active: true,
}

export default function EditProductPage() {
 const router = useRouter()
 const product = mockProduct

 const [isLoading, setIsLoading] = useState(false)
 const [name, setName] = useState(product.name)
 const [sku, setSku] = useState(product.sku)
 const [category, setCategory] = useState(product.category)
 const [description, setDescription] = useState(product.description)
 const [unit, setUnit] = useState(product.unit)
 const [unitPrice, setUnitPrice] = useState(product.unit_price)
 const [costPrice, setCostPrice] = useState(product.cost_price)
 const [isActive, setIsActive] = useState(product.is_active)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsLoading(true)
 try {
 console.log('Updating product:', {
 name,
 sku,
 category,
 description,
 unit,
 unitPrice,
 costPrice,
 isActive,
 })
 await new Promise((resolve) => setTimeout(resolve, 1000))
 router.push(`/products/${product.id}`)
 } catch (error) {
 console.error('Failed to update product:', error)
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
 <Link href={`/products/${product.id}`}>
 <ArrowLeft className="h-5 w-5" />
 </Link>
 </Button>
 <div>
 <h1 className="text-3xl font-semibold">Chỉnh sửa sản phẩm</h1>
 <p className="text-muted-foreground">{product.name}</p>
 </div>
 </div>
 <Button variant="destructive" size="sm">
 <Trash2 className="mr-2 h-4 w-4" />
 Xóa sản phẩm
 </Button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid gap-6 lg:grid-cols-2">
 {/* Basic Info */}
 <Card>
 <CardHeader>
 <CardTitle>Thông tin sản phẩm</CardTitle>
 <CardDescription>Thông tin cơ bản của sản phẩm/dịch vụ</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Tên sản phẩm <span className="text-destructive">*</span></Label>
 <Input value={name} onChange={(e) => setName(e.target.value)} />
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
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Web Development">Web Development</SelectItem>
 <SelectItem value="SEO">SEO</SelectItem>
 <SelectItem value="Marketing">Marketing</SelectItem>
 <SelectItem value="Design">Design</SelectItem>
 <SelectItem value="Consulting">Consulting</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-2">
 <Label>Đơn vị tính</Label>
 <Select value={unit} onValueChange={setUnit}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="dự án">Dự án</SelectItem>
 <SelectItem value="tháng">Tháng</SelectItem>
 <SelectItem value="giờ">Giờ</SelectItem>
 <SelectItem value="gói">Gói</SelectItem>
 <SelectItem value="thiết kế">Thiết kế</SelectItem>
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

 {/* Pricing */}
 <Card>
 <CardHeader>
 <CardTitle>Giá & Chi phí</CardTitle>
 <CardDescription>Thiết lập giá bán và giá vốn</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Giá bán <span className="text-destructive">*</span></Label>
 <Input
 type="number"
 value={unitPrice}
 onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
 />
 <p className="text-xs text-muted-foreground">Nhập số tiền VND</p>
 </div>

 <div className="space-y-2">
 <Label>Giá vốn</Label>
 <Input
 type="number"
 value={costPrice}
 onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
 />
 </div>

 {unitPrice > 0 && costPrice > 0 && (
 <div className="p-4 bg-green-500/10 rounded-lg">
 <p className="text-sm text-muted-foreground">Biên lợi nhuận</p>
 <p className="text-2xl font-semibold text-green-500">
 {(((unitPrice - costPrice) / unitPrice) * 100).toFixed(1)}%
 </p>
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-4">
 <Button type="button" variant="outline" asChild>
 <Link href={`/products/${product.id}`}>Hủy</Link>
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
