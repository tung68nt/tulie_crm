'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createInvoice } from '@/lib/supabase/services/invoice-service'
import { toast } from 'sonner'

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unit: string
    unit_price: number
    total: number
}

interface NewInvoiceClientProps {
    initialCustomers: any[]
    initialContracts: any[]
    initialQuotations: any[]
}

function NewInvoiceForm({ initialCustomers, initialContracts }: NewInvoiceClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const fromContractId = searchParams.get('contract')

    const [isLoading, setIsLoading] = useState(false)
    const [invoiceType, setInvoiceType] = useState<'output' | 'input'>('output')
    const [customerId, setCustomerId] = useState('')
    const [contractId, setContractId] = useState(fromContractId || '')
    const [issueDate, setIssueDate] = useState<Date>(new Date())
    const [dueDate, setDueDate] = useState<Date>()
    const [vatPercent, setVatPercent] = useState(10)
    const [notes, setNotes] = useState('')

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: '', quantity: 1, unit: 'lần', unit_price: 0, total: 0 },
    ])

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), description: '', quantity: 1, unit: 'lần', unit_price: 0, total: 0 },
        ])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(
            items.map((item) => {
                if (item.id !== id) return item
                const updated = { ...item, [field]: value }
                if (['quantity', 'unit_price'].includes(field)) {
                    updated.total = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0)
                }
                return updated
            })
        )
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const totalAmount = subtotal + vatAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }

        setIsLoading(true)
        try {
            const invoiceData = {
                type: invoiceType,
                customer_id: invoiceType === 'output' ? customerId : null,
                vendor_id: invoiceType === 'input' ? customerId : null,
                contract_id: contractId || null,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                issue_date: issueDate.toISOString(),
                due_date: dueDate?.toISOString() || null,
                status: 'sent',
                subtotal,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                paid_amount: 0,
                notes,
                created_by: '00000000-0000-0000-0000-000000000000'
            }

            const invoiceItems = items.map((item, idx) => ({
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                total: item.total,
                sort_order: idx
            }))

            await createInvoice(invoiceData as any, invoiceItems)

            toast.success('Tạo hóa đơn thành công')
            router.push('/invoices')
            router.refresh()
        } catch (error) {
            console.error('Failed to create invoice:', error)
            toast.error('Có lỗi xảy ra khi tạo hóa đơn')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/invoices">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Tạo hóa đơn mới</h1>
                    <p className="text-muted-foreground">Tạo hóa đơn bán hàng hoặc mua vào</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Type & Customer */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin hóa đơn</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Loại hóa đơn</Label>
                                        <Select value={invoiceType} onValueChange={(v) => setInvoiceType(v as 'output' | 'input')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="output">Hóa đơn bán hàng</SelectItem>
                                                <SelectItem value="input">Hóa đơn mua vào</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{invoiceType === 'output' ? 'Khách hàng' : 'Nhà cung cấp'} <span className="text-destructive">*</span></Label>
                                        <Select value={customerId} onValueChange={setCustomerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Chọn ${invoiceType === 'output' ? 'khách hàng' : 'nhà cung cấp'}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialCustomers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.company_name || c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Hợp đồng liên quan</Label>
                                        <Select value={contractId} onValueChange={setContractId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn hợp đồng (tùy chọn)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialContracts.filter(c => !customerId || c.customer_id === customerId).map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.contract_number} (Giá trị: {formatCurrency(c.total_amount)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Ngày phát hành</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {issueDate ? format(issueDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={issueDate} onSelect={(d) => d && setIssueDate(d)} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hạn thanh toán</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dueDate ? format(dueDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Chi tiết hóa đơn</CardTitle>
                                    <CardDescription>Các mục trong hóa đơn</CardDescription>
                                </div>
                                <Button type="button" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm mục
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">Mô tả</TableHead>
                                            <TableHead className="w-[80px]">SL</TableHead>
                                            <TableHead className="w-[80px]">ĐVT</TableHead>
                                            <TableHead className="w-[150px]">Đơn giá</TableHead>
                                            <TableHead className="w-[150px] text-right">Thành tiền</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Mô tả hạng mục..."
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-16"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={item.unit}
                                                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                        className="w-16"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.id, 'unit_price', parseInt(e.target.value) || 0)}
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

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ghi chú</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ghi chú cho hóa đơn..."
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Totals */}
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
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-2">
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Tạo hóa đơn
                            </Button>
                            <Button type="button" variant="outline" asChild className="w-full">
                                <Link href="/invoices">Hủy</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default function NewInvoiceClient(props: NewInvoiceClientProps) {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <NewInvoiceForm {...props} />
        </Suspense>
    )
}
