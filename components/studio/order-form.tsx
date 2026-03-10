'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { Loader2, User, CircleDollarSign, CheckCircle2, Trash2, Calendar as CalendarIcon, Package, Truck, Link as LinkIcon, QrCode, Hash, CreditCard, FileText, Clock, CircleCheck, CircleDashed, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getProducts } from '@/lib/supabase/services/product-service'
import { ProductCombobox } from '@/components/quotations/product-combobox'
import { PriceInput } from '@/components/ui/price-input'

export function RetailOrderForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        total_amount: 0,
        deposit_amount: 0,
        shipping_fee: 0,
        payment_status: 'pending' as any,
        order_status: 'pending' as any,
        resource_link: '',
        notes: '',
        order_date: today,
        delivery_date: '',
        needs_vat: false,
        brand: 'studio' as any,
        use_deposit: true,
    })

    const [brandConfig, setBrandConfig] = useState<any>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts()
            setProducts(data.filter(p => p.is_active))
        }
        const fetchConfig = async () => {
            const { getBrandConfig } = await import('@/lib/supabase/services/settings-service')
            const config = await getBrandConfig()
            setBrandConfig(config)
        }
        fetchProducts()
        fetchConfig()
    }, [])

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

    const updateItemPrice = (index: number, price: number) => {
        const newItems = [...selectedItems]
        newItems[index].unit_price = price
        newItems[index].total_price = newItems[index].quantity * price
        setSelectedItems(newItems)
    }

    const [orderIdPreview, setOrderIdPreview] = useState('DH_YY_MMDD_STT_Value')

    useEffect(() => {
        const dateStr = formData.order_date || today
        const d = new Date(dateStr)
        const yy = d.getFullYear().toString().slice(-2)
        const mm = (d.getMonth() + 1).toString().padStart(2, '0')
        const dd = d.getDate().toString().padStart(2, '0')
        const priceK = Math.floor((formData.total_amount || 0) / 1000)
        setOrderIdPreview(`DH_${yy}_${mm}${dd}_XXX_${priceK}`)
    }, [formData.total_amount, formData.order_date, today])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customer_name) {
            toast.error('Vui lòng nhập tên khách hàng')
            return
        }
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm')
            return
        }

        setIsLoading(true)
        try {
            await createRetailOrder({
                ...formData,
                paid_amount: 0,
                items: selectedItems
            } as any)
            toast.success('Đã tạo đơn hàng mới thành công')
            router.push('/studio')
            router.refresh()
        } catch (error) {
            console.error('Create order error:', error)
            toast.error('Có lỗi xảy ra khi tạo đơn hàng')
        } finally {
            setIsLoading(false)
        }
    }

    const BANK_ID = brandConfig?.studio_bank_name || brandConfig?.bank_name || 'MB'
    const ACCOUNT_NO = brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '111222333'
    const ACCOUNT_NAME = brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'CONG TY TNHH TULIE'
    const balance = formData.total_amount - (formData.use_deposit ? formData.deposit_amount : 0)

    const depositQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${formData.deposit_amount}&addInfo=${encodeURIComponent('COC ' + orderIdPreview)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`
    const balanceQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${balance}&addInfo=${encodeURIComponent('CK ' + orderIdPreview)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name" className="text-sm font-medium">Họ tên / Đơn vị *</Label>
                                    <Input
                                        id="customer_name"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="h-9"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone" className="text-sm font-medium">Điện thoại</Label>
                                    <Input
                                        id="customer_phone"
                                        placeholder="09xx..."
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_email" className="text-sm font-medium">Email</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order_date" className="flex items-center gap-2 text-sm font-medium">
                                        <CalendarIcon className="h-4 w-4" /> Ngày lên đơn
                                    </Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b py-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Sản phẩm & Dịch vụ
                            </CardTitle>
                            <Badge variant="secondary">{selectedItems.length} mục</Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <ProductCombobox
                                products={products}
                                value=""
                                onSelect={addItem}
                                placeholder="Tìm và thêm sản phẩm..."
                            />

                            {selectedItems.length > 0 ? (
                                <div className="rounded-md border overflow-hidden bg-background">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted text-xs font-medium text-muted-foreground border-b text-left">
                                            <tr>
                                                <th className="px-6 py-4">Sản phẩm</th>
                                                <th className="px-6 py-4 w-24 text-center">SL</th>
                                                <th className="px-6 py-4 text-right">Đơn giá</th>
                                                <th className="px-6 py-4 text-right">Thành tiền</th>
                                                <th className="px-6 py-4 w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                                            {selectedItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{item.product_name}</td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="h-8 w-16 text-center border-zinc-200 dark:border-zinc-700 bg-transparent mx-auto font-bold"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right tabular-nums">
                                                        <PriceInput
                                                            value={item.unit_price}
                                                            onChange={(val) => updateItemPrice(index, val)}
                                                            className="h-8 w-28 text-right bg-transparent border-none focus-visible:ring-0 p-0 font-bold ml-auto"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                                                        {formatCurrency(item.total_price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem(index)}
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                                                            type="button"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-zinc-50/30 dark:bg-zinc-900/30 font-bold border-t border-zinc-100 dark:border-zinc-800">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Tổng cộng tạm tính</td>
                                                <td className="px-6 py-4 text-right text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                                    {formatCurrency(formData.total_amount)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                                    <div className="bg-zinc-50 dark:bg-zinc-900 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Plus className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <p className="text-zinc-400 text-sm font-medium">Chưa chọn sản phẩm nào cho đơn hàng này.</p>
                                </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-2">
                                    <Label htmlFor="shipping_fee" className="text-sm font-medium flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Phí vận chuyển
                                    </Label>
                                    <PriceInput
                                        id="shipping_fee"
                                        value={formData.shipping_fee}
                                        onChange={(val) => setFormData({ ...formData, shipping_fee: val })}
                                        className="h-9 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delivery_date" className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Hẹn trả file
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resource_link" className="text-sm font-medium flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" /> Link Drive bàn giao
                                </Label>
                                <Input
                                    id="resource_link"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.resource_link}
                                    onChange={(e) => setFormData({ ...formData, resource_link: e.target.value })}
                                    className="h-9"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium">Mô tả sản phẩm (Ghi chú)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ví dụ: Giao tận nơi, đóng khung gỗ, in decal..."
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b py-4 px-6">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4" /> Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-8 space-y-6">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Tổng giá trị đơn hàng</span>
                                <div className="text-4xl font-bold tracking-tighter tabular-nums">{formatCurrency(formData.total_amount)}</div>
                            </div>

                            <div className="space-y-4 bg-muted/50 p-5 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Sử dụng cọc</Label>
                                    <Switch
                                        checked={formData.use_deposit}
                                        onCheckedChange={(val) => setFormData({ ...formData, use_deposit: val })}
                                    />
                                </div>
                                {formData.use_deposit && (
                                    <div className="space-y-2 transition-all">
                                        <PriceInput
                                            value={formData.deposit_amount}
                                            onChange={(val) => setFormData({ ...formData, deposit_amount: val })}
                                            className="h-10 text-lg font-bold"
                                        />
                                        <p className="text-xs text-muted-foreground italic">Gợi ý: Cọc 30-50% giá trị đơn hàng</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end border-t pt-4">
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground text-xs font-medium">{formData.use_deposit ? 'Còn lại:' : 'Thanh toán ngay:'}</span>
                                    <div className="font-bold text-2xl tabular-nums">{formatCurrency(formData.use_deposit ? balance : formData.total_amount)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-muted-foreground text-xs font-medium">Mã đơn</span>
                                    <p className="font-mono text-sm font-bold tracking-tight">{orderIdPreview}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        {formData.use_deposit && formData.deposit_amount > 0 && (
                            <Card className="overflow-hidden">
                                <div className="py-2 px-3 border-b bg-muted/50 text-center">
                                    <span className="text-xs font-bold text-blue-600">1. Tiền cọc</span>
                                </div>
                                <div className="p-3">
                                    <img src={depositQrUrl} alt="Deposit QR" className="w-full aspect-square object-contain rounded-md ring-1 ring-border" />
                                    <p className="text-xs text-muted-foreground mt-2 font-medium text-center truncate">{ACCOUNT_NAME}</p>
                                </div>
                            </Card>
                        )}

                        <Card className={cn(
                            "overflow-hidden",
                            !(formData.use_deposit && formData.deposit_amount > 0) && "col-span-2"
                        )}>
                            <div className="py-2 px-3 border-b bg-muted/50 text-center">
                                <span className="text-xs font-bold text-emerald-600">
                                    {formData.use_deposit ? '2. Thanh toán' : 'Thanh toán'}
                                </span>
                            </div>
                            <div className="p-3 flex flex-col items-center">
                                <img src={balanceQrUrl} alt="Balance QR" className={cn(
                                    "aspect-square object-contain rounded-md ring-1 ring-border",
                                    !(formData.use_deposit && formData.deposit_amount > 0) ? "w-32" : "w-full"
                                )} />
                                <p className="text-xs text-muted-foreground mt-2 font-medium text-center truncate w-full">{ACCOUNT_NAME}</p>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="py-3 px-5 border-b bg-muted/50">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Trạng thái hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
                                >
                                    <SelectTrigger className="h-10 text-sm">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <span className="flex items-center gap-2 font-medium"><CircleDashed className="h-4 w-4 text-muted-foreground" /> Chưa thanh toán</span>
                                        </SelectItem>
                                        <SelectItem value="partial">
                                            <span className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4 text-amber-500" /> Đã cọc / Một phần</span>
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            <span className="flex items-center gap-2 font-medium"><CircleCheck className="h-4 w-4 text-emerald-500" /> Đã thanh toán 100%</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Xác nhận tạo đơn hàng
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
