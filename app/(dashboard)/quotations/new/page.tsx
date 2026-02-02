'use client'

import { useState } from 'react'
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
import { ArrowLeft, Plus, Trash2, Eye, Send, Save, Loader2 } from 'lucide-react'

interface QuotationItem {
    id: string
    product_id?: string
    name: string
    description?: string
    quantity: number
    unit: string
    unit_price: number
    discount_percent: number
    total: number
}

const mockProducts = [
    { id: '1', name: 'Website Development', unit_price: 50000000, unit: 'dự án' },
    { id: '2', name: 'SEO Package - Basic', unit_price: 10000000, unit: 'tháng' },
    { id: '3', name: 'Social Media Management', unit_price: 15000000, unit: 'tháng' },
    { id: '4', name: 'Logo Design', unit_price: 8000000, unit: 'thiết kế' },
    { id: '5', name: 'Brand Identity Package', unit_price: 35000000, unit: 'gói' },
]

const mockCustomers = [
    { id: '1', company_name: 'ABC Corporation' },
    { id: '2', company_name: 'XYZ Limited' },
    { id: '3', company_name: 'DEF Industries' },
    { id: '4', company_name: 'GHI Company' },
]

export default function NewQuotationPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [customerId, setCustomerId] = useState('')
    const [validDays, setValidDays] = useState('30')
    const [vatPercent, setVatPercent] = useState(10)
    const [notes, setNotes] = useState('')
    const [terms, setTerms] = useState('• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành')

    const [items, setItems] = useState<QuotationItem[]>([
        {
            id: '1',
            name: '',
            quantity: 1,
            unit: 'dự án',
            unit_price: 0,
            discount_percent: 0,
            total: 0,
        },
    ])

    const addItem = () => {
        const newItem: QuotationItem = {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            unit: 'dự án',
            unit_price: 0,
            discount_percent: 0,
            total: 0,
        }
        setItems([...items, newItem])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
        setItems(
            items.map((item) => {
                if (item.id !== id) return item

                const updated = { ...item, [field]: value }

                // Recalculate total when price, quantity, or discount changes
                if (['quantity', 'unit_price', 'discount_percent'].includes(field)) {
                    const discountMultiplier = 1 - (updated.discount_percent / 100)
                    updated.total = updated.quantity * updated.unit_price * discountMultiplier
                }

                return updated
            })
        )
    }

    const selectProduct = (itemId: string, productId: string) => {
        const product = mockProducts.find((p) => p.id === productId)
        if (!product) return

        setItems(
            items.map((item) => {
                if (item.id !== itemId) return item
                return {
                    ...item,
                    product_id: productId,
                    name: product.name,
                    unit: product.unit,
                    unit_price: product.unit_price,
                    total: item.quantity * product.unit_price * (1 - item.discount_percent / 100),
                }
            })
        )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const grandTotal = subtotal + vatAmount

    const handleSave = async (send: boolean = false) => {
        setIsLoading(true)
        try {
            // TODO: API call
            console.log('Saving quotation:', {
                customerId,
                validDays,
                vatPercent,
                notes,
                terms,
                items,
                subtotal,
                vatAmount,
                grandTotal,
                send,
            })
            await new Promise((resolve) => setTimeout(resolve, 1000))
            router.push('/quotations')
        } catch (error) {
            console.error('Failed to save quotation:', error)
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
                        <Link href="/quotations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Tạo báo giá mới</h1>
                        <p className="text-muted-foreground">
                            Tạo báo giá và gửi cho khách hàng
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={isLoading}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước
                    </Button>
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu nháp
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Lưu & Gửi
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer & Validity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin báo giá</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Khách hàng</Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khách hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockCustomers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hiệu lực (ngày)</Label>
                                <Select value={validDays} onValueChange={setValidDays}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 ngày</SelectItem>
                                        <SelectItem value="15">15 ngày</SelectItem>
                                        <SelectItem value="30">30 ngày</SelectItem>
                                        <SelectItem value="60">60 ngày</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Sản phẩm / Dịch vụ</CardTitle>
                                <CardDescription>Thêm các mục vào báo giá</CardDescription>
                            </div>
                            <Button onClick={addItem} size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm mục
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">Sản phẩm/Dịch vụ</TableHead>
                                        <TableHead className="w-[80px]">SL</TableHead>
                                        <TableHead className="w-[80px]">ĐVT</TableHead>
                                        <TableHead className="w-[150px]">Đơn giá</TableHead>
                                        <TableHead className="w-[80px]">CK %</TableHead>
                                        <TableHead className="w-[150px] text-right">Thành tiền</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Select
                                                    value={item.product_id}
                                                    onValueChange={(value) => selectProduct(item.id, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn sản phẩm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockProducts.map((product) => (
                                                            <SelectItem key={product.id} value={product.id}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                                                    }
                                                    className="w-16"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{item.unit || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={item.unit_price}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'unit_price', parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-32"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.discount_percent}
                                                    onChange={(e) =>
                                                        updateItem(item.id, 'discount_percent', parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-16"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
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

                    {/* Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Điều khoản & Ghi chú</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Điều khoản thanh toán</Label>
                                <Textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ghi chú</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ghi chú thêm cho khách hàng..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <Card>
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
                                    <Select
                                        value={vatPercent.toString()}
                                        onValueChange={(v) => setVatPercent(parseInt(v))}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0%</SelectItem>
                                            <SelectItem value="8">8%</SelectItem>
                                            <SelectItem value="10">10%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm w-28 text-right">
                                        {formatCurrency(vatAmount)}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold text-lg">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Hướng dẫn</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>1. Chọn khách hàng từ danh sách</p>
                            <p>2. Thêm sản phẩm/dịch vụ cần báo giá</p>
                            <p>3. Điều chỉnh số lượng và chiết khấu</p>
                            <p>4. Xem trước và gửi cho khách hàng</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
