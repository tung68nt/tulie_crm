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
import { Loader2, User, CircleDollarSign, CheckCircle2, Trash2, Calendar as CalendarIcon, Package, Truck, Link as LinkIcon, QrCode, Hash, CreditCard, FileText, Clock, CircleCheck, CircleDashed } from 'lucide-react'
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
        customer_type: 'individual' as 'individual' | 'business',
        use_deposit: true, // Local UI state
    })

    const [brandConfig, setBrandConfig] = useState<any>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            const data = await getProducts()
            // Filter products for Studio brand, or those with no brand yet (migration period)
            const studioProducts = data.filter(p => !p.brand || p.brand === 'studio')
            setProducts(studioProducts)
        }
        const fetchConfig = async () => {
            const { getBrandConfig } = await import('@/lib/supabase/services/settings-service')
            const config = await getBrandConfig()
            setBrandConfig(config)
        }
        fetchProducts()
        fetchConfig()
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

    // Use STUDIO bank account (personal), not Agency
    const BANK_ID = brandConfig?.studio_bank_name || brandConfig?.bank_name || 'MB'
    const ACCOUNT_NO = brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '111222333'
    const ACCOUNT_NAME = brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'CONG TY TNHH TULIE'
    const balance = formData.total_amount - (formData.use_deposit ? formData.deposit_amount : 0)

    const depositQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${formData.deposit_amount}&addInfo=${encodeURIComponent('COC ' + orderIdPreview)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`
    const balanceQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${balance}&addInfo=${encodeURIComponent('CK ' + orderIdPreview)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-5 items-start">
                <div className="lg:col-span-3 space-y-4">
                    {/* Customer Info */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden h-full">
                        <CardHeader className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 py-3 px-5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                    <User className="h-3.5 w-3.5" />
                                    Thông tin khách hàng
                                </CardTitle>
                                <div className="flex bg-muted p-0.5 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, customer_type: 'individual' })}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                                            formData.customer_type === 'individual' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500"
                                        )}
                                    >Cá nhân</button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, customer_type: 'business' })}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                                            formData.customer_type === 'business' ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500"
                                        )}
                                    >Doanh nghiệp</button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="customer_name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Họ tên / Đơn vị *</Label>
                                    <Input
                                        id="customer_name"
                                        placeholder={formData.customer_type === 'individual' ? "Nguyễn Văn A" : "Tên công ty / Studio"}
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="h-9 border-zinc-200 dark:border-zinc-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="customer_phone" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Điện thoại</Label>
                                    <Input
                                        id="customer_phone"
                                        placeholder="09xx..."
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="h-9 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="customer_email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Email (không bắt buộc)</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className="h-9 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="order_date" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" /> Ngày lên đơn
                                    </Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        className="h-9 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4 h-full">
                    {/* Payment Summary - Balanced with Customer Info */}
                    <Card className="bg-zinc-950 text-zinc-50 border-none overflow-hidden shadow-lg rounded-xl h-full flex flex-col">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <CircleDollarSign className="h-3.5 w-3.5" /> Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 space-y-4 flex-1 flex flex-col justify-center">
                            <div className="space-y-0">
                                <span className="text-[9px] uppercase font-bold text-zinc-500">Tổng thanh toán</span>
                                <div className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(formData.total_amount)}</div>
                            </div>

                            <div className="space-y-2 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 mt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide">Yêu cầu đặt cọc</Label>
                                    <Switch
                                        checked={formData.use_deposit}
                                        onCheckedChange={(val) => setFormData({ ...formData, use_deposit: val })}
                                        className="scale-90 data-[state=checked]:bg-white data-[state=checked]:text-zinc-950"
                                    />
                                </div>
                                {formData.use_deposit && (
                                    <PriceInput
                                        value={formData.deposit_amount}
                                        onChange={(val) => setFormData({ ...formData, deposit_amount: val })}
                                        className="bg-zinc-800/80 border-zinc-700 text-white text-base font-bold h-8 py-0"
                                    />
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">{formData.use_deposit ? 'Còn phải thu:' : 'Thanh toán 100%:'}</span>
                                <span className="font-bold text-white text-base">{formatCurrency(formData.use_deposit ? balance : formData.total_amount)}</span>
                            </div>
                        </CardContent>
                        <div className="px-5 py-3 bg-zinc-900/30 border-t border-zinc-900 flex items-center justify-between text-[9px]">
                            <span className="text-zinc-500 uppercase font-bold flex items-center gap-1"><Hash className="h-3 w-3" />Mã đơn dự kiến</span>
                            <span className="text-zinc-300 font-mono tracking-wider">{orderIdPreview}</span>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-4">
                    {/* Product Selection */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                        <CardHeader className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 py-3 px-5 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                                <Package className="h-3.5 w-3.5" />
                                Sản phẩm & Dịch vụ
                            </CardTitle>
                            <Badge variant="outline" className="text-[9px] h-5 font-bold uppercase tracking-tight">{selectedItems.length} mục</Badge>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <ProductCombobox
                                products={products}
                                value=""
                                onSelect={addItem}
                                placeholder="Tìm và thêm sản phẩm..."
                            />

                            {selectedItems.length > 0 ? (
                                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-700 text-left">
                                            <tr>
                                                <th className="px-4 py-2.5">Sản phẩm</th>
                                                <th className="px-4 py-2.5 w-20 text-center">SL</th>
                                                <th className="px-4 py-2.5 text-right">Đơn giá</th>
                                                <th className="px-4 py-2.5 text-right">Thành tiền</th>
                                                <th className="px-4 py-2.5 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {selectedItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                                    <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{item.product_name}</td>
                                                    <td className="px-4 py-2.5">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="h-8 text-center px-1 w-16 mx-auto border-zinc-200 dark:border-zinc-700"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-400">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-4 py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(item.total_price)}</td>
                                                    <td className="px-4 py-2.5">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2.5 text-right text-[10px] font-bold text-zinc-500 uppercase">Tạm tính:</td>
                                                <td className="px-4 py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(selectedItems.reduce((s, i) => s + i.total_price, 0))}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                                    <p className="text-xs mt-1">Tìm kiếm và thêm sản phẩm ở trên</p>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-3 pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="shipping_fee" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1">
                                        <Truck className="h-3 w-3" /> Phí vận chuyển
                                    </Label>
                                    <PriceInput
                                        id="shipping_fee"
                                        value={formData.shipping_fee}
                                        onChange={(val) => setFormData({ ...formData, shipping_fee: val })}
                                        className="h-10 border-zinc-200 dark:border-zinc-700 font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="delivery_date" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" /> Hẹn trả file
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="h-10 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="resource_link" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-1">
                                        <LinkIcon className="h-3 w-3" /> Link Drive bàn giao
                                    </Label>
                                    <Input
                                        id="resource_link"
                                        placeholder="https://drive.google.com/..."
                                        value={formData.resource_link}
                                        onChange={(e) => setFormData({ ...formData, resource_link: e.target.value })}
                                        className="h-10 border-zinc-200 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="notes" className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Yêu cầu riêng, địa chỉ nhận hàng..."
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="border-zinc-200 dark:border-zinc-700"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {/* Payment Summary */}
                    <Card className="bg-zinc-950 text-zinc-50 border-none overflow-hidden shadow-lg rounded-xl">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <CircleDollarSign className="h-3.5 w-3.5" /> Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 space-y-4">
                            <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-zinc-500">Tổng thanh toán</span>
                                <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(formData.total_amount)}</div>
                            </div>

                            <div className="space-y-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide">Yêu cầu đặt cọc</Label>
                                    <Switch
                                        checked={formData.use_deposit}
                                        onCheckedChange={(val) => setFormData({ ...formData, use_deposit: val })}
                                    />
                                </div>
                                {formData.use_deposit && (
                                    <PriceInput
                                        value={formData.deposit_amount}
                                        onChange={(val) => setFormData({ ...formData, deposit_amount: val })}
                                        className="bg-zinc-800/80 border-zinc-700 text-white text-base font-bold h-9"
                                    />
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">{formData.use_deposit ? 'Còn phải thu:' : 'Thanh toán 100%:'}</span>
                                <span className="font-bold text-white text-lg">{formatCurrency(formData.use_deposit ? balance : formData.total_amount)}</span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] border-t border-zinc-800 pt-3">
                                <span className="text-zinc-500 uppercase font-bold flex items-center gap-1"><Hash className="h-3 w-3" />Mã đơn dự kiến</span>
                                <span className="text-zinc-300 font-mono tracking-wider">{orderIdPreview}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code Section - More Compact */}
                    <div className="grid grid-cols-2 gap-3">
                        {formData.use_deposit && formData.deposit_amount > 0 && (
                            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                                <CardHeader className="py-1.5 px-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                    <CardTitle className="text-[9px] uppercase font-bold text-blue-600 flex items-center gap-1">
                                        <QrCode className="h-3 w-3" /> 1. Cọc
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center py-2 px-2">
                                    <img src={depositQrUrl} alt="Deposit QR" className="w-full aspect-square object-contain max-w-[120px]" />
                                    <p className="text-[8px] text-zinc-400 mt-1 font-medium truncate w-full text-center">
                                        {ACCOUNT_NAME}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={cn(
                            "border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden",
                            !(formData.use_deposit && formData.deposit_amount > 0) && "col-span-2"
                        )}>
                            <CardHeader className="py-1.5 px-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                <CardTitle className="text-[9px] uppercase font-bold text-green-600 flex items-center gap-1">
                                    <QrCode className="h-3 w-3" /> {formData.use_deposit ? '2. Thanh toán nốt' : 'Thanh toán'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-2 px-2">
                                <img src={balanceQrUrl} alt="Balance QR" className={cn(
                                    "aspect-square object-contain",
                                    !(formData.use_deposit && formData.deposit_amount > 0) ? "w-32" : "w-full max-w-[120px]"
                                )} />
                                <p className="text-[8px] text-zinc-400 mt-1 font-medium truncate w-full text-center">
                                    {ACCOUNT_NAME}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Payment Status */}
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="py-2 px-4 border-b border-zinc-100 dark:border-zinc-800">
                                <CardTitle className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
                                    <CreditCard className="h-3 w-3" /> Trạng thái
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
                                >
                                    <SelectTrigger className="h-8 text-xs border-zinc-200 dark:border-zinc-700 bg-zinc-50/50">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <span className="flex items-center gap-2"><CircleDashed className="h-3.5 w-3.5 text-zinc-400" /> Chưa thanh toán</span>
                                        </SelectItem>
                                        <SelectItem value="partial">
                                            <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-zinc-500" /> Đã cọc / Một phần</span>
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            <span className="flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-zinc-900" /> Đã thanh toán 100%</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                className="w-full h-full text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-md active:scale-[0.98] transition-all rounded-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Tạo đơn hàng
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
