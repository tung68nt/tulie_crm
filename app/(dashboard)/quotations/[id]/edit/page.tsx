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
import { ArrowLeft, Loader2, Save, Plus, Trash2, Send } from 'lucide-react'

interface QuotationItem {
    id: string
    product_id: string
    name: string
    description: string
    quantity: number
    unit: string
    unit_price: number
    discount_percent: number
    total: number
}

// Mock data - in real app, fetch by ID
const mockQuotation = {
    id: '1',
    quote_number: 'QT-2026-0142',
    customer_id: '1',
    title: 'Báo giá dịch vụ Marketing Digital',
    terms: '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành',
    notes: 'Khách hàng yêu cầu hoàn thành trong Q1 2026',
    vat_percent: 10,
    validity_days: 30,
    items: [
        { id: '1', product_id: '1', name: 'Website Development', description: 'Thiết kế và phát triển website doanh nghiệp', quantity: 1, unit: 'dự án', unit_price: 50000000, discount_percent: 0, total: 50000000 },
        { id: '2', product_id: '2', name: 'SEO Package - Basic', description: 'Tối ưu SEO cơ bản 6 tháng', quantity: 6, unit: 'tháng', unit_price: 10000000, discount_percent: 0, total: 60000000 },
        { id: '3', product_id: '3', name: 'Social Media Management', description: 'Quản lý fanpage Facebook & Instagram', quantity: 6, unit: 'tháng', unit_price: 15000000, discount_percent: 0, total: 90000000 },
    ],
}

const mockCustomers = [
    { id: '1', company_name: 'ABC Corporation', status: 'customer', assigned_to: '1', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', company_name: 'XYZ Limited', status: 'customer', assigned_to: '1', created_by: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const mockProducts = [
    { id: '1', name: 'Website Development', unit_price: 50000000, unit: 'dự án', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'SEO Package - Basic', unit_price: 10000000, unit: 'tháng', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: 'Social Media Management', unit_price: 15000000, unit: 'tháng', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4', name: 'Content Marketing', unit_price: 8000000, unit: 'tháng', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export default function EditQuotationPage() {
    const router = useRouter()
    const quotation = mockQuotation

    const [isLoading, setIsLoading] = useState(false)
    const [customerId, setCustomerId] = useState(quotation.customer_id)
    const [title, setTitle] = useState(quotation.title)
    const [terms, setTerms] = useState(quotation.terms)
    const [notes, setNotes] = useState(quotation.notes)
    const [vatPercent, setVatPercent] = useState(quotation.vat_percent)
    const [validityDays, setValidityDays] = useState(quotation.validity_days)
    const [items, setItems] = useState<QuotationItem[]>(quotation.items)

    const addItem = () => {
        const newItem: QuotationItem = {
            id: Date.now().toString(),
            product_id: '',
            name: '',
            description: '',
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

                // Auto-fill product info
                if (field === 'product_id') {
                    const product = mockProducts.find((p) => p.id === value)
                    if (product) {
                        updated.name = product.name
                        updated.unit_price = product.unit_price
                        updated.unit = product.unit
                    }
                }

                // Recalculate total
                if (['quantity', 'unit_price', 'discount_percent'].includes(field)) {
                    const baseTotal = updated.quantity * updated.unit_price
                    updated.total = baseTotal - (baseTotal * updated.discount_percent / 100)
                }

                return updated
            })
        )
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const totalAmount = subtotal + vatAmount

    const handleSave = async (sendAfterSave = false) => {
        setIsLoading(true)
        try {
            console.log('Updating quotation:', {
                customerId,
                title,
                items,
                terms,
                notes,
                vatPercent,
                validityDays,
                subtotal,
                vatAmount,
                totalAmount,
                sendAfterSave,
            })
            await new Promise((resolve) => setTimeout(resolve, 1000))
            router.push(`/quotations/${quotation.id}`)
        } catch (error) {
            console.error('Failed to update quotation:', error)
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
                        <Link href={`/quotations/${quotation.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chỉnh sửa {quotation.quote_number}</h1>
                        <p className="text-muted-foreground">Cập nhật thông tin báo giá</p>
                    </div>
                </div>
            </div>

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
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockCustomers.map((c) => (
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
                        <CardHeader className="flex flex-row items-center justify-between">
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
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead className="w-[70px]">SL</TableHead>
                                        <TableHead className="w-[130px]">Đơn giá</TableHead>
                                        <TableHead className="w-[70px]">CK%</TableHead>
                                        <TableHead className="w-[130px] text-right">Thành tiền</TableHead>
                                        <TableHead className="w-[40px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Select value={item.product_id} onValueChange={(v) => updateItem(item.id, 'product_id', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn sản phẩm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockProducts.map((p) => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                                <Input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(item.id, 'unit_price', parseInt(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={item.discount_percent}
                                                    onChange={(e) => updateItem(item.id, 'discount_percent', parseInt(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                            <TableCell>
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
                                    <Link href={`/quotations/${quotation.id}`}>Hủy</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
