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
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Invoice, Customer, Vendor, Contract } from '@/types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface InvoiceFormProps {
    invoice: Invoice
    customers: Customer[]
    vendors: Vendor[]
    contracts: Contract[]
}

export function InvoiceForm({ invoice, customers, vendors, contracts }: InvoiceFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number)
    const [type, setType] = useState(invoice.type)
    const [customerId, setCustomerId] = useState(invoice.customer_id || '')
    const [vendorId, setVendorId] = useState(invoice.vendor_id || '')
    const [contractId, setContractId] = useState(invoice.contract_id || '')
    const [issueDate, setIssueDate] = useState<Date | undefined>(
        invoice.issue_date ? new Date(invoice.issue_date) : undefined
    )
    const [dueDate, setDueDate] = useState<Date | undefined>(
        invoice.due_date ? new Date(invoice.due_date) : undefined
    )
    const [status, setStatus] = useState(invoice.status)
    const [notes, setNotes] = useState(invoice.notes || '')
    const [vatPercent, setVatPercent] = useState(invoice.vat_percent || 10)

    const [items, setItems] = useState<any[]>(
        invoice.items?.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || 'Lần',
            unit_price: item.unit_price,
            total: item.total
        })) || []
    )

    const addItem = () => {
        setItems([
            ...items,
            { id: `temp-${Date.now()}`, description: '', quantity: 1, unit: 'Lần', unit_price: 0, total: 0 }
        ])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id))
        }
    }

    const updateItem = (id: string, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value }
                if (field === 'quantity' || field === 'unit_price') {
                    newItem.total = newItem.quantity * newItem.unit_price
                }
                return newItem
            }
            return item
        }))
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = (subtotal * vatPercent) / 100
    const totalAmount = subtotal + vatAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()

            // 1. Update invoice
            const { error: invoiceError } = await supabase
                .from('invoices')
                .update({
                    invoice_number: invoiceNumber,
                    type,
                    customer_id: type === 'output' ? (customerId || null) : null,
                    vendor_id: type === 'input' ? (vendorId || null) : null,
                    contract_id: contractId || null,
                    issue_date: issueDate?.toISOString(),
                    due_date: dueDate?.toISOString(),
                    status,
                    notes,
                    subtotal,
                    vat_percent: vatPercent,
                    vat_amount: vatAmount,
                    total_amount: totalAmount,
                })
                .eq('id', invoice.id)

            if (invoiceError) throw invoiceError

            // 2. Refresh items (delete and re-insert)
            const { error: deleteError } = await supabase
                .from('invoice_items')
                .delete()
                .eq('invoice_id', invoice.id)

            if (deleteError) throw deleteError

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(items.map(item => ({
                    invoice_id: invoice.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unit_price: item.unit_price,
                    total: item.total
                })))

            if (itemsError) throw itemsError

            toast.success('Cập nhật hóa đơn thành công')
            router.push(`/invoices/${invoice.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Error updating invoice:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hóa đơn')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/invoices/${invoice.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Chỉnh sửa {invoice.invoice_number}</h1>
                        <p className="text-muted-foreground">Cập nhật thông tin hóa đơn</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Hạng mục chi tiết</CardTitle>
                            <Button type="button" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm hạng mục
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="p-4 border rounded-lg space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm text-muted-foreground uppercase">Hạng mục {index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Mô tả hạng mục</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                placeholder="VD: Phí triển khai phần mềm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Đơn vị</Label>
                                            <Input
                                                value={item.unit}
                                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Số lượng</Label>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Đơn giá</Label>
                                            <Input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Thành tiền</Label>
                                            <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
                                                {formatCurrency(item.total)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                placeholder="Ghi chú thêm trên hóa đơn..."
                                rows={4}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt hóa đơn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Loại hóa đơn</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="output">Bán hàng (Xuất)</SelectItem>
                                        <SelectItem value="input">Mua vào (Nhập)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Số hóa đơn</Label>
                                <Input
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Bản nháp</SelectItem>
                                        <SelectItem value="sent">Đã gửi</SelectItem>
                                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                                        <SelectItem value="overdue">Quá hạn</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {type === 'output' ? (
                                <div className="space-y-2">
                                    <Label>Khách hàng</Label>
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn khách hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Nhà cung cấp</Label>
                                    <Select value={vendorId} onValueChange={setVendorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Hợp đồng liên quan</Label>
                                <Select value={contractId} onValueChange={setContractId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn hợp đồng (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contracts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ngày phát hành</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {issueDate ? format(issueDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={issueDate} onSelect={setIssueDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hạn thanh toán</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Chọn ngày'}
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

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng cộng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tạm tính:</span>
                                <span>{formatCurrency(subtotal || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">VAT (%):</span>
                                <Input
                                    type="number"
                                    className="w-20 h-8 text-right"
                                    value={vatPercent}
                                    onChange={(e) => setVatPercent(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tiền thuế:</span>
                                <span>{formatCurrency(vatAmount || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Tổng:</span>
                                <span>{formatCurrency(totalAmount || 0)}</span>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
