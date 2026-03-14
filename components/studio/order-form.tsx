'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createRetailOrder, getNextStt, updateRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { getBankAccounts, getNoteTemplates } from '@/lib/supabase/services/settings-service'
import { Loader2, User, CircleDollarSign, CheckCircle2, Trash2, Calendar as CalendarIcon, Package, Truck, Link as LinkIcon, QrCode, Hash, CreditCard, FileText, Clock, CircleCheck, CircleDashed, Plus, Copy, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { buildVietQrUrl } from '@/lib/utils/vietqr'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getProducts } from '@/lib/supabase/services/product-service'
import { ProductCombobox } from '@/components/quotations/product-combobox'
import { PriceInput } from '@/components/ui/price-input'

interface RetailOrderFormProps {
    initialData?: any
    isEdit?: boolean
}

export function RetailOrderForm({ initialData, isEdit = false }: RetailOrderFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>(
        initialData?.items?.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })) || []
    )
    const today = new Date().toISOString().split('T')[0]
    const [formData, setFormData] = useState({
        customer_name: initialData?.customer_name || '',
        customer_phone: initialData?.customer_phone || '',
        customer_email: initialData?.customer_email || '',
        total_amount: initialData?.total_amount || 0,
        deposit_amount: initialData?.deposit_amount || (initialData?.paid_amount || 0),
        shipping_fee: initialData?.shipping_fee || 0,
        payment_status: initialData?.payment_status || 'pending',
        order_status: initialData?.order_status || 'pending',
        resource_link: initialData?.resource_link || '',
        notes: initialData?.notes || '',
        order_date: initialData?.order_date || today,
        delivery_date: initialData?.delivery_date || '',
        needs_vat: initialData?.needs_vat || false,
        brand: initialData?.brand || 'studio',
        use_deposit: initialData ? (initialData.deposit_amount > 0 || initialData.paid_amount > 0) : true,
        metadata: initialData?.metadata || {}
    })

    const [brandConfig, setBrandConfig] = useState<any>(null)
    const [availableBanks, setAvailableBanks] = useState<any[]>([])
    const [availableNotes, setAvailableNotes] = useState<any[]>([])

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
        const fetchResources = async () => {
            const [banks, notes] = await Promise.all([
                getBankAccounts(),
                getNoteTemplates()
            ])
            setAvailableBanks(banks)
            setAvailableNotes(notes)
        }
        fetchProducts()
        fetchConfig()
        fetchResources()
    }, [])

    // Auto-select first bank and first note template for new orders
    useEffect(() => {
        if (!isEdit && availableBanks.length > 0 && !formData.metadata?.bank_info) {
            const b = availableBanks.find((x: any) => (x.default_for || []).includes('retail_order')) || availableBanks[0]
            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    bank_info: {
                        bank_name: b.bank_name,
                        account_no: b.account_no,
                        account_name: b.account_name,
                        bank_branch: b.bank_branch
                    }
                }
            }))
        }
    }, [isEdit, availableBanks, formData.metadata?.bank_info])

    useEffect(() => {
        if (!isEdit && availableNotes.length > 0 && formData.notes === '') {
            const n = availableNotes[0]
            setFormData(prev => ({
                ...prev,
                notes: n.notes || n.payment_terms || ''
            }))
        }
    }, [isEdit, availableNotes, formData.notes])

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
    const [nextStt, setNextStt] = useState<number | null>(null)
    useEffect(() => {
        if (initialData?.items) {
            setSelectedItems(initialData.items)
        }
    }, [initialData])

    useEffect(() => {
        if (!isEdit) {
            getNextStt().then(stt => setNextStt(stt))
        }
    }, [isEdit])

    useEffect(() => {
        if (isEdit && initialData?.order_number) {
            setOrderIdPreview(initialData.order_number)
            return
        }
        const dateStr = formData.order_date || today
        const d = new Date(dateStr)
        const yy = d.getFullYear().toString().slice(-2)
        const mm = (d.getMonth() + 1).toString().padStart(2, '0')
        const dd = d.getDate().toString().padStart(2, '0')
        const priceK = Math.floor((formData.total_amount || 0) / 1000)
        const sttStr = nextStt !== null ? String(nextStt) : 'XXX'
        setOrderIdPreview(`DH_${yy}_${mm}${dd}_${sttStr}_${priceK}`)
    }, [formData.total_amount, formData.order_date, today, nextStt, isEdit, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customer_name) {
            toast.error('Vui lòng nhập họ tên / đơn vị khách hàng')
            return
        }
        if (!formData.order_date) {
            toast.error('Vui lòng chọn ngày lên đơn')
            return
        }
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm hoặc dịch vụ')
            return
        }

        setIsLoading(true)
        try {
            // Strip non-DB fields before sending
            const { use_deposit, needs_vat, ...submitData } = formData

            if (isEdit && initialData?.id) {
                await updateRetailOrder(initialData.id, {
                    ...submitData,
                    needs_vat: needs_vat || false,
                    items: selectedItems,
                } as any)
                toast.success('Đã cập nhật đơn hàng thành công')
            } else {
                await createRetailOrder({
                    ...submitData,
                    needs_vat: needs_vat || false,
                    paid_amount: 0,
                    items: selectedItems
                } as any)
                toast.success('Đã tạo đơn hàng mới thành công')
            }
            router.push('/studio')
        } catch (error: any) {
            console.error('Create order error:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng kiểm tra lại quá trình nhập dữ liệu.')
        } finally {
            setIsLoading(false)
        }
    }

    const currentBank = formData.metadata?.bank_info || (availableBanks.length > 0 ? {
        bank_name: availableBanks[0].bank_name,
        account_no: availableBanks[0].account_no,
        account_name: availableBanks[0].account_name
    } : {
        bank_name: 'MB',
        account_no: '111222333',
        account_name: 'CONG TY TNHH TULIE'
    })

    const BANK_ID = currentBank.bank_name
    const ACCOUNT_NO = currentBank.account_no
    const ACCOUNT_NAME = currentBank.account_name
    const balance = formData.total_amount - (formData.use_deposit ? formData.deposit_amount : 0)

    const depositQrUrl = buildVietQrUrl({ bankName: BANK_ID, accountNo: ACCOUNT_NO, accountName: ACCOUNT_NAME, amount: formData.deposit_amount, addInfo: 'COC ' + orderIdPreview })
    const balanceQrUrl = buildVietQrUrl({ bankName: BANK_ID, accountNo: ACCOUNT_NO, accountName: ACCOUNT_NAME, amount: balance, addInfo: 'CK ' + orderIdPreview })

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                        <CalendarIcon className="h-4 w-4" /> Ngày lên đơn *
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-9",
                                                    !formData.order_date && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.order_date ? format(new Date(formData.order_date), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                locale={vi}
                                                selected={formData.order_date ? new Date(formData.order_date) : undefined}
                                                onSelect={(date) => {
                                                    setFormData({ ...formData, order_date: date ? format(date, "yyyy-MM-dd") : "" })
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Sản phẩm & Dịch vụ
                            </CardTitle>
                            <Badge variant="secondary">{selectedItems.length} mục</Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                                <td colSpan={3} className="px-6 py-4 text-muted-foreground text-xs font-medium">Tổng cộng tạm tính</td>
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal h-9",
                                                    !formData.delivery_date && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.delivery_date ? format(new Date(formData.delivery_date), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                locale={vi}
                                                selected={formData.delivery_date ? new Date(formData.delivery_date) : undefined}
                                                onSelect={(date) => {
                                                    setFormData({ ...formData, delivery_date: date ? format(date, "yyyy-MM-dd") : "" })
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>


                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold tracking-tight">Ghi chú & Điều khoản</Label>
                                    {availableNotes.length > 0 && (
                                        <Select onValueChange={(val) => {
                                            const t = availableNotes.find(x => x.name === val)
                                            if (t) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    notes: t.notes || t.payment_terms || prev.notes
                                                }))
                                                toast.info('Đã áp dụng mẫu ghi chú')
                                            }
                                        }}>
                                            <SelectTrigger className="w-[180px] h-8 text-[10px] bg-muted/30">
                                                <SelectValue placeholder="Chọn từ mẫu có sẵn" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableNotes.map(t => (
                                                    <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Ghi chú về gói chụp, yêu cầu của khách hàng..."
                                        rows={3}
                                        className="rounded-xl resize-none text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4" /> Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">Tổng giá trị đơn hàng</span>
                                <div className="text-4xl font-bold tabular-nums">{formatCurrency(formData.total_amount)}</div>
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
                            <div className="space-y-4 pt-4 border-t border-dashed">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        <Label className="text-sm font-bold tracking-tight">Thông tin thanh toán</Label>
                                    </div>
                                    {availableBanks.length > 0 && (
                                        <Select onValueChange={(val) => {
                                            const b = availableBanks.find(x => x.account_no === val)
                                            if (b) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    metadata: {
                                                        ...prev.metadata,
                                                        bank_info: {
                                                            bank_name: b.bank_name,
                                                            account_no: b.account_no,
                                                            account_name: b.account_name,
                                                            bank_branch: b.bank_branch
                                                        }
                                                    }
                                                }))
                                                toast.info('Đã chọn tài khoản thanh toán')
                                            }
                                        }}>
                                            <SelectTrigger className="w-[180px] h-8 text-[10px] bg-muted/30">
                                                <SelectValue placeholder="Đổi tài khoản nhận" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableBanks.map(b => (
                                                    <SelectItem key={b.account_no} value={b.account_no}>{b.bank_name} - {b.account_no}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                {formData.metadata?.bank_info ? (
                                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-900 leading-none">{formData.metadata.bank_info.bank_name}</p>
                                        <p className="text-xs font-bold text-primary tracking-tight">{formData.metadata.bank_info.account_no}</p>
                                        <p className="text-[10px] text-zinc-500">{formData.metadata.bank_info.account_name}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-zinc-500">
                                        <AlertCircle className="h-3 w-3" />
                                        <p className="text-[10px]">Đang sử dụng tài khoản mặc định của Studio</p>
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
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <p className="font-mono text-sm font-bold tracking-tight">{orderIdPreview}</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                navigator.clipboard.writeText(orderIdPreview)
                                                toast.success('Đã copy mã đơn: ' + orderIdPreview)
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
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
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Trạng thái hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            {isEdit ? 'Cập nhật đơn hàng' : 'Xác nhận tạo đơn hàng'}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
