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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Left Side: Forms */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Customer Info */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 py-4 px-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                    <User className="h-4 w-4" />
                                    Thông tin khách hàng
                                </CardTitle>
                                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, customer_type: 'individual' })}
                                        className={cn(
                                            "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all",
                                            formData.customer_type === 'individual' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
                                        )}
                                    >Cá nhân</button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, customer_type: 'business' })}
                                        className={cn(
                                            "px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all",
                                            formData.customer_type === 'business' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
                                        )}
                                    >Doanh nghiệp</button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Họ tên / Đơn vị *</Label>
                                    <Input
                                        id="customer_name"
                                        placeholder={formData.customer_type === 'individual' ? "Nguyễn Văn A" : "Tên công ty / Studio"}
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30 focus:bg-white transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Điện thoại</Label>
                                    <Input
                                        id="customer_phone"
                                        placeholder="09xx..."
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_email" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order_date" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <CalendarIcon className="h-3.5 w-3.5" /> Ngày lên đơn
                                    </Label>
                                    <Input
                                        id="order_date"
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Selection */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 py-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <Package className="h-4 w-4" />
                                Sản phẩm & Dịch vụ
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px] h-6 font-bold px-3 rounded-full">{selectedItems.length} mục</Badge>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <ProductCombobox
                                products={products}
                                value=""
                                onSelect={addItem}
                                placeholder="Tìm và thêm sản phẩm..."
                            />

                            {selectedItems.length > 0 ? (
                                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 text-left">
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
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                            className="h-9 text-center px-1 w-20 mx-auto border-zinc-200 dark:border-zinc-700 rounded-lg"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-zinc-500">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(item.total_price)}</td>
                                                    <td className="px-6 py-4">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-zinc-50/30 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Tạm tính:</td>
                                                <td className="px-6 py-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100 text-lg">{formatCurrency(selectedItems.reduce((s, i) => s + i.total_price, 0))}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/20">
                                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold text-zinc-500">Chưa có sản phẩm nào</p>
                                    <p className="text-xs mt-1 text-zinc-400">Vui lòng chọn sản phẩm hỗ trợ dịch vụ</p>
                                </div>
                            )}

                            <div className="grid gap-6 md:grid-cols-2 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="shipping_fee" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <Truck className="h-3.5 w-3.5" /> Phí vận chuyển
                                    </Label>
                                    <PriceInput
                                        id="shipping_fee"
                                        value={formData.shipping_fee}
                                        onChange={(val) => setFormData({ ...formData, shipping_fee: val })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl font-bold bg-zinc-50/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delivery_date" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <CalendarIcon className="h-3.5 w-3.5" /> Hẹn trả file
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resource_link" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon className="h-3.5 w-3.5" /> Link Drive bàn giao
                                </Label>
                                <Input
                                    id="resource_link"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.resource_link}
                                    onChange={(e) => setFormData({ ...formData, resource_link: e.target.value })}
                                    className="h-11 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Yêu cầu riêng, địa chỉ nhận hàng..."
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/30 focus:bg-white resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Payment & QR & Action */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                    {/* Payment Summary */}
                    <Card className="bg-zinc-950 text-zinc-50 border-none overflow-hidden shadow-2xl rounded-[24px] ring-1 ring-white/10">
                        <CardHeader className="pb-4 pt-6 px-6 border-b border-white/5">
                            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2.5">
                                <CircleDollarSign className="h-4 w-4" /> Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-8 space-y-6">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Tổng giá trị đơn hàng</span>
                                <div className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">{formatCurrency(formData.total_amount)}</div>
                            </div>

                            <div className="space-y-4 bg-zinc-900/80 p-5 rounded-[20px] border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Sử dụng cọc</Label>
                                    <Switch
                                        checked={formData.use_deposit}
                                        onCheckedChange={(val) => setFormData({ ...formData, use_deposit: val })}
                                        className="data-[state=checked]:bg-white data-[state=checked]:text-zinc-950"
                                    />
                                </div>
                                {formData.use_deposit && (
                                    <div className="space-y-2 transition-all">
                                        <PriceInput
                                            value={formData.deposit_amount}
                                            onChange={(val) => setFormData({ ...formData, deposit_amount: val })}
                                            className="bg-zinc-800/80 border-white/10 text-white text-xl font-black h-12 rounded-xl focus:ring-white/20"
                                        />
                                        <p className="text-[10px] text-zinc-500 font-medium italic">Gợi ý: Cọc 30-50% giá trị đơn hàng</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end pt-2">
                                <div className="space-y-0.5">
                                    <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wider">{formData.use_deposit ? 'Còn lại:' : 'Thanh toán ngay:'}</span>
                                    <div className="font-extrabold text-white text-2xl tabular-nums">{formatCurrency(formData.use_deposit ? balance : formData.total_amount)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wider">Mã đơn</span>
                                    <p className="text-zinc-300 font-mono text-[11px] tracking-widest">{orderIdPreview}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code Section */}
                    <div className="grid grid-cols-2 gap-4">
                        {formData.use_deposit && formData.deposit_amount > 0 && (
                            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
                                <div className="py-2 px-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                                    <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">1. Tiền cọc</span>
                                </div>
                                <div className="p-3">
                                    <img src={depositQrUrl} alt="Deposit QR" className="w-full aspect-square object-contain rounded-lg shadow-sm ring-1 ring-zinc-100" />
                                    <p className="text-[10px] text-zinc-500 mt-2 font-bold text-center truncate">{ACCOUNT_NAME}</p>
                                </div>
                            </Card>
                        )}

                        <Card className={cn(
                            "border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-950",
                            !(formData.use_deposit && formData.deposit_amount > 0) && "col-span-2"
                        )}>
                            <div className="py-2 px-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                                <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">
                                    {formData.use_deposit ? '2. Thanh toán' : 'Thanh toán'}
                                </span>
                            </div>
                            <div className="p-3 flex flex-col items-center">
                                <img src={balanceQrUrl} alt="Balance QR" className={cn(
                                    "aspect-square object-contain rounded-lg shadow-sm ring-1 ring-zinc-100",
                                    !(formData.use_deposit && formData.deposit_amount > 0) ? "w-32" : "w-full"
                                )} />
                                <p className="text-[10px] text-zinc-500 mt-2 font-bold text-center truncate w-full">{ACCOUNT_NAME}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Status & Action */}
                    <div className="space-y-4">
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="py-3 px-5 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30">
                                <CardTitle className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-2">
                                    <CreditCard className="h-3.5 w-3.5" /> Trạng thái hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
                                >
                                    <SelectTrigger className="h-11 text-sm border-zinc-200 dark:border-zinc-700 rounded-xl bg-white focus:ring-zinc-900">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200">
                                        <SelectItem value="pending">
                                            <span className="flex items-center gap-2.5 font-medium"><CircleDashed className="h-4 w-4 text-zinc-400" /> Chưa thanh toán</span>
                                        </SelectItem>
                                        <SelectItem value="partial">
                                            <span className="flex items-center gap-2.5 font-medium"><Clock className="h-4 w-4 text-amber-500" /> Đã cọc / Một phần</span>
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            <span className="flex items-center gap-2.5 font-medium"><CircleCheck className="h-4 w-4 text-emerald-500" /> Đã thanh toán 100%</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-200 dark:shadow-none active:scale-[0.98] transition-all rounded-2xl disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-3 h-5 w-5" />
                            )}
                            Xác nhận tạo đơn hàng
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
