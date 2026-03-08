'use client'

import { useState, useEffect } from 'react'
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
import { createRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { Loader2, Save, Sparkles, Phone, User, Wallet, CheckCircle2, Trash2, Plus, Calendar as CalendarIcon, Package, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getProducts } from '@/lib/supabase/services/product-service'
import { ProductCombobox } from '@/components/quotations/product-combobox'

export function RetailOrderForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        total_amount: 0,
        deposit_amount: 0,
        shipping_fee: 0,
        payment_status: 'pending' as any,
        order_status: 'pending' as any,
        notes: '',
        delivery_date: '',
        needs_vat: false,
    })

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts()
            setProducts(data)
        }
        fetchProducts()
    }, [])

    // Recalculate total
    useEffect(() => {
        const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        const total = itemsTotal + (formData.shipping_fee || 0)
        setFormData(prev => ({ ...prev, total_amount: total }))
    }, [selectedItems, formData.shipping_fee])

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        const newItem = {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: product.price || 0,
            total_price: product.price || 0
        }
        setSelectedItems([...selectedItems, newItem])
    }

    const removeItem = (index: number) => {
        const newItems = [...selectedItems]
        newItems.splice(index, 1)
        setSelectedItems(newItems)
    }

    const updateItemQuantity = (index: number, quantity: number) => {
        const newItems = [...selectedItems]
        newItems[index].quantity = quantity
        newItems[index].total_price = quantity * newItems[index].unit_price
        setSelectedItems(newItems)
    }

    const [orderIdPreview, setOrderIdPreview] = useState('DH_YY_MMDD_STT_Value')

    useEffect(() => {
        const date = new Date()
        const yy = date.getFullYear().toString().slice(-2)
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')
        const kValue = Math.floor((formData.total_amount || 0) / 1000)
        setOrderIdPreview(`DH_${yy}_${mm}${dd}_XXX_${kValue}`)
    }, [formData.total_amount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customer_name) {
            toast.error('Vui lòng nhập tên khách hàng')
            return
        }

        setIsLoading(true)
        try {
            await createRetailOrder({
                ...formData,
                items: selectedItems
            })
            toast.success('Đã tạo đơn hàng mới thành công')
            router.push('/studio')
            router.refresh()
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo đơn hàng')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <User className="h-5 w-5 text-primary" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name" className="text-xs font-semibold text-muted-foreground">Tên khách hàng *</Label>
                                    <Input
                                        id="customer_name"
                                        placeholder="VD: Nguyễn Văn A"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="h-10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone" className="text-xs font-semibold text-muted-foreground">Điện thoại</Label>
                                    <Input
                                        id="customer_phone"
                                        placeholder="09xx..."
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Selection */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                    <Package className="h-5 w-5 text-primary" />
                                    Sản phẩm & Dịch vụ
                                </CardTitle>
                                <CardDescription className="text-[10px]">Chọn gói sản phẩm từ danh mục có sẵn.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <ProductCombobox
                                        products={products}
                                        value=""
                                        onSelect={addItem}
                                        placeholder="Tìm và thêm sản phẩm..."
                                    />
                                </div>
                            </div>

                            {selectedItems.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b text-left">
                                            <tr>
                                                <th className="px-3 py-2">Sản phẩm</th>
                                                <th className="px-3 py-2 w-20 text-center">SL</th>
                                                <th className="px-3 py-2 text-right">Đơn giá</th>
                                                <th className="px-3 py-2 text-right">Thành tiền</th>
                                                <th className="px-3 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-muted/20">
                                                    <td className="px-3 py-2 font-medium">{item.product_name}</td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="h-8 text-center px-1"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                                                    <td className="px-3 py-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-muted/30 border-t">
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold">Tạm tính sản phẩm:</td>
                                                <td className="px-3 py-2 text-right font-bold">{formatCurrency(selectedItems.reduce((s, i) => s + i.total_price, 0))}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Chưa có sản phẩm nào được chọn</p>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="shipping_fee" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <Truck className="h-3 w-3" /> Phí vận chuyển (nếu có)
                                    </Label>
                                    <Input
                                        id="shipping_fee"
                                        type="number"
                                        value={formData.shipping_fee}
                                        onChange={(e) => setFormData({ ...formData, shipping_fee: parseFloat(e.target.value) || 0 })}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delivery_date" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <CalendarIcon className="h-3 w-3" /> Hẹn bàn giao
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="h-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="font-semibold text-xs text-muted-foreground">Ghi chú đơn hàng</Label>
                        <Textarea
                            id="notes"
                            placeholder="Yêu cầu riêng của khách, địa chỉ nhận hàng..."
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-card/50"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Payment Summary Card */}
                    <Card className="bg-zinc-900 text-zinc-50 border-none overflow-hidden relative shadow-md rounded-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold opacity-80 flex items-center gap-2">
                                <Wallet className="h-4 w-4" /> Tổng thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500">Cần thanh toán</span>
                                    <div className="text-3xl font-bold text-primary">{formatCurrency(formData.total_amount)}</div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-xs font-semibold text-zinc-400">Tiền cọc trước (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        value={formData.deposit_amount}
                                        onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                                        className="bg-zinc-800 border-zinc-700 text-white text-lg font-bold h-11 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800 space-y-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-zinc-500 uppercase font-bold">Mã định danh đơn:</span>
                                    <Badge className="bg-zinc-800 text-primary font-mono border-none">{orderIdPreview}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <Card className="border-border/50 rounded-xl bg-card/50">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-xs font-semibold text-muted-foreground">Trạng thái thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(val: any) => setFormData({ ...formData, payment_status: val })}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">⏳ Chờ thanh toán</SelectItem>
                                        <SelectItem value="partial">🌗 Đã cọc/Một phần</SelectItem>
                                        <SelectItem value="paid">✅ Đã xong 100%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-md active:scale-95 transition-transform"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                            )}
                            Khởi tạo đơn hàng
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-muted-foreground font-semibold text-xs"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Hủy bỏ
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
