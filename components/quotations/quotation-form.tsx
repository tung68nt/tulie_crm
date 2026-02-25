'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Send, ArrowUp, ArrowDown, X } from 'lucide-react'
import { PriceInput } from '@/components/ui/price-input'
import { Quotation, QuotationItem, Customer, Product } from '@/types'
import { updateQuotation } from '@/lib/supabase/services/quotation-service'
import { toast } from 'sonner'

interface QuotationFormProps {
    quotation?: Quotation
    customers: Customer[]
    products: Product[]
    units: string[]
    initialCustomerId?: string
    onChange?: (data: any) => void
    onSave?: (send: boolean) => void
    isLoading?: boolean
    hideHeader?: boolean
}

export function QuotationForm({ quotation, customers, products, units, initialCustomerId, onChange, onSave, isLoading: externalIsLoading, hideHeader = false }: QuotationFormProps) {
    const router = useRouter()
    const [internalIsLoading, setInternalIsLoading] = useState(false)
    const isLoading = externalIsLoading || internalIsLoading

    const [customerId, setCustomerId] = useState(quotation?.customer_id || initialCustomerId || '')
    const [title, setTitle] = useState(quotation?.title || '')
    const [terms, setTerms] = useState(quotation?.terms || '')
    const [notes, setNotes] = useState(quotation?.notes || '')
    const [vatPercent, setVatPercent] = useState(quotation?.vat_percent || 10)

    // Calculate valid_until to days for the input
    const createdDate = quotation ? new Date(quotation.created_at) : new Date()
    const validUntilDate = quotation ? new Date(quotation.valid_until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const diffTime = Math.abs(validUntilDate.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const [validityDays, setValidityDays] = useState(diffDays || 30)

    const [items, setItems] = useState<Partial<QuotationItem>[]>(
        quotation?.items?.map(item => ({ ...item })) || [
            {
                id: `temp-${Date.now()}`,
                product_id: '',
                product_name: '',
                description: '',
                quantity: 1,
                unit: 'cái',
                unit_price: 0,
                discount: 0,
                total_price: 0,
                sort_order: 0
            }
        ]
    )

    const addItem = () => {
        const newItem: Partial<QuotationItem> = {
            id: `temp-${Date.now()}`,
            product_id: '',
            product_name: '',
            description: '',
            quantity: 1,
            unit: 'cái',
            unit_price: 0,
            discount: 0,
            total_price: 0,
            sort_order: items.length
        }
        setItems([...items, newItem])
    }

    const removeItem = (id: string | undefined) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= items.length) return

        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[newIndex]
        newItems[newIndex] = temp

        // Update sort_order
        newItems.forEach((item, idx) => {
            item.sort_order = idx
        })

        setItems(newItems)
    }

    const updateItem = (id: string | undefined, field: keyof QuotationItem, value: any) => {
        setItems(
            items.map((item) => {
                if (item.id !== id) return item
                const updated = { ...item, [field]: value }

                // Auto-fill product info
                if (field === 'product_id') {
                    const product = products.find((p) => p.id === value)
                    if (product) {
                        updated.product_name = product.name
                        updated.unit_price = product.price
                        updated.unit = product.unit
                        updated.description = product.description || ''
                    }
                }

                // Recalculate total
                if (['quantity', 'unit_price', 'discount'].includes(field)) {
                    const qty = Number(updated.quantity) || 0
                    const priceVal = Number(updated.unit_price) || 0
                    const disc = Number(updated.discount) || 0
                    const baseTotal = qty * priceVal
                    updated.total_price = baseTotal - (baseTotal * disc / 100)
                }

                return updated
            })
        )
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const totalAmount = subtotal + vatAmount

    // Propagate changes to parent for preview
    useEffect(() => {
        if (onChange) {
            const currentCustomer = customers?.find(c => c.id === customerId)
            onChange({
                customer_id: customerId,
                customer: currentCustomer,
                title,
                terms,
                notes,
                vat_percent: vatPercent,
                vat_amount: vatAmount,
                subtotal: subtotal,
                grand_total: totalAmount,
                total_amount: totalAmount,
                items,
                valid_days: validityDays
            })
        }
    }, [customerId, title, terms, notes, vatPercent, items, validityDays, subtotal, vatAmount, totalAmount, onChange, customers])

    const handleSave = async (sendAfterSave = false) => {
        if (onSave) {
            onSave(sendAfterSave)
            return
        }

        if (!quotation) return

        setInternalIsLoading(true)
        try {
            // Calculate new validUntil
            const validUntil = new Date()
            validUntil.setDate(validUntil.getDate() + validityDays)

            const updateData: Partial<Quotation> = {
                customer_id: customerId,
                title,
                terms,
                notes,
                vat_percent: vatPercent,
                vat_amount: vatAmount,
                subtotal,
                total_amount: totalAmount,
                valid_until: validUntil.toISOString(),
                status: sendAfterSave ? 'sent' : quotation.status
            }

            await updateQuotation(quotation.id, updateData, items)
            toast.success('Cập nhật báo giá thành công')
            router.push(`/quotations/${quotation.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Failed to update quotation:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật báo giá')
        } finally {
            setInternalIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-semibold">
                                {quotation ? `Chỉnh sửa ${quotation.quotation_number}` : "Tạo báo giá mới"}
                            </h1>
                            <p className="text-muted-foreground">
                                {quotation ? "Cập nhật thông tin báo giá" : "Nhập thông tin cho báo giá mới"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Khách hàng</Label>
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn khách hàng..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hiệu lực (ngày)</Label>
                                    <Input
                                        type="number"
                                        value={validityDays}
                                        onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tiêu đề</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between px-6">
                            <div>
                                <CardTitle>Sản phẩm / Dịch vụ</CardTitle>
                                <CardDescription>Danh sách hạng mục báo giá</CardDescription>
                            </div>
                            <Button type="button" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="pl-2">Sản phẩm</TableHead>
                                        <TableHead className="w-[100px]">ĐVT</TableHead>
                                        <TableHead className="w-[70px]">SL</TableHead>
                                        <TableHead className="w-[130px]">Đơn giá</TableHead>
                                        <TableHead className="w-[70px]">CK%</TableHead>
                                        <TableHead className="w-[130px] text-right">Thành tiền</TableHead>
                                        <TableHead className="w-[40px] pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="pl-4">
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveItem(index, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveItem(index, 'down')}
                                                        disabled={index === items.length - 1}
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pl-2">
                                                <div className="space-y-1">
                                                    <div className="flex gap-1">
                                                        <Select value={item.product_id} onValueChange={(v) => updateItem(item.id, 'product_id', v)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Chọn sản phẩm" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id}>
                                                                        {p.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {item.product_id && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    updateItem(item.id, 'product_id', '')
                                                                    updateItem(item.id, 'product_name', '')
                                                                }}
                                                                title="Xóa lựa chọn"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Input
                                                        placeholder="Tên hoặc mô tả chi tiết"
                                                        value={item.product_name}
                                                        onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="ĐVT"
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <PriceInput
                                                    value={item.unit_price}
                                                    onChange={(val) => updateItem(item.id, 'unit_price', val)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={item.discount}
                                                    onChange={(e) => updateItem(item.id, 'discount', parseInt(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(Number(item.total_price) || 0)}
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Terms & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Điều khoản & Ghi chú</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Điều khoản thanh toán</Label>
                                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ghi chú</Label>
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Tổng kết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tạm tính</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">Thuế VAT</span>
                                <div className="flex items-center gap-2">
                                    <Select value={vatPercent.toString()} onValueChange={(v) => setVatPercent(parseInt(v))}>
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0%</SelectItem>
                                            <SelectItem value="8">8%</SelectItem>
                                            <SelectItem value="10">10%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm w-28 text-right">{formatCurrency(vatAmount)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-primary">{formatCurrency(totalAmount)}</span>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-2">
                                <Button onClick={() => handleSave(false)} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </Button>
                                <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Lưu & Gửi
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"}>Hủy</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
