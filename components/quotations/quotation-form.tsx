'use client'

import { useState, useEffect } from 'react'
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
    CardFooter,
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
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react'
import { QuotationItem, Product } from '@/types'

interface QuotationFormProps {
    initialData?: any
    customers: any[]
    products: Product[]
    onChange: (data: any) => void
    onSave: (send: boolean) => void
    isLoading: boolean
}

export function QuotationForm({
    initialData,
    customers,
    products,
    onChange,
    onSave,
    isLoading
}: QuotationFormProps) {
    // Form State
    const [customerId, setCustomerId] = useState(initialData?.customer_id || '')
    const [validDays, setValidDays] = useState(initialData?.valid_days?.toString() || '30')
    const [vatPercent, setVatPercent] = useState(initialData?.vat_percent || 8) // Default 8% current rate
    const [terms, setTerms] = useState(initialData?.terms || '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành')
    const [notes, setNotes] = useState(initialData?.notes || '')
    const [quoteNumber, setQuoteNumber] = useState(initialData?.quote_number || 'BG-' + Date.now().toString().slice(-6))
    // Bank Details State
    const [bankName, setBankName] = useState(initialData?.bank_name || 'TECHCOMBANK')
    const [bankAccountNo, setBankAccountNo] = useState(initialData?.bank_account_no || '190368686868')
    const [bankAccountName, setBankAccountName] = useState(initialData?.bank_account_name || 'CONG TY TNHH TULIE')
    const [bankBranch, setBankBranch] = useState(initialData?.bank_branch || 'Thanh Xuân - Hà Nội')

    // Sections State
    // We Group items by a "sectionId" or just keep a list of sections?
    // Easiest is to manage a list of Sections, each having items.
    // But our data model is flat items with `section_name`.
    // So UI state = Array of { name: string, items: QuotationItem[] }
    const [sections, setSections] = useState<{ id: string, name: string, items: QuotationItem[] }[]>([
        { id: 'sec-1', name: 'Chi tiết báo giá', items: [] }
    ])

    // Initialize with data if available
    useEffect(() => {
        if (initialData?.items && initialData.items.length > 0) {
            // Group existing items by section
            const grouped: Record<string, QuotationItem[]> = {}
            const defaultSec = 'Chi tiết báo giá'

            initialData.items.forEach((item: QuotationItem) => {
                const sec = item.section_name || defaultSec
                if (!grouped[sec]) grouped[sec] = []
                grouped[sec].push(item)
            })

            const newSections = Object.entries(grouped).map(([name, items], idx) => ({
                id: `sec-${idx}`,
                name,
                items
            }))

            setSections(newSections)
        } else if (sections[0].items.length === 0) {
            // Add empty item if new
            addItem('sec-1')
        }
    }, [])

    // Notify parent of changes
    useEffect(() => {
        // Flatten sections to items
        const flatItems: QuotationItem[] = []
        sections.forEach(sec => {
            sec.items.forEach((item, idx) => {
                flatItems.push({
                    ...item,
                    section_name: sec.name,
                    sort_order: idx
                })
            })
        })

        const subtotal = flatItems.reduce((sum, item) => sum + item.total, 0)
        // Per-item VAT calculation
        const vatAmount = flatItems.reduce((sum, item) => sum + (item.total * ((item.vat_percent || 0) / 100)), 0)
        const grandTotal = subtotal + vatAmount

        const customer = customers.find(c => c.id === customerId)

        onChange({
            customer_id: customerId,
            customer, // include full object for preview
            quote_number: quoteNumber,
            valid_days: parseInt(validDays),
            vat_percent: vatPercent, // Still keep for backward compatibility/default
            vat_amount: vatAmount,
            subtotal,
            grand_total: grandTotal, // or total_amount
            total_amount: grandTotal,
            terms,
            notes,
            bank_name: bankName,
            bank_account_no: bankAccountNo,
            bank_account_name: bankAccountName,
            bank_branch: bankBranch,
            items: flatItems
        })
    }, [customerId, validDays, vatPercent, terms, notes, quoteNumber, sections, bankName, bankAccountNo, bankAccountName, bankBranch])

    // Actions
    const addSection = () => {
        setSections([
            ...sections,
            { id: `sec-${Date.now()}`, name: 'Hạng mục mới', items: [] }
        ])
    }

    const updateSectionName = (secId: string, name: string) => {
        setSections(sections.map(sec => sec.id === secId ? { ...sec, name } : sec))
    }

    const removeSection = (secId: string) => {
        if (sections.length <= 1) return
        setSections(sections.filter(sec => sec.id !== secId))
    }

    const addItem = (secId: string) => {
        const newItem: QuotationItem = {
            id: Date.now().toString(),
            name: '',
            description: '',
            quantity: 1,
            unit: 'cái',
            unit_price: 0,
            discount_percent: 20, // Default 20% discount as requested
            vat_percent: 8, // Default to 8% current rate
            total: 0,
            sort_order: 0,
            section_name: ''
        }

        setSections(sections.map(sec => {
            if (sec.id !== secId) return sec
            return { ...sec, items: [...sec.items, newItem] }
        }))
    }

    const updateItem = (secId: string, itemId: string, field: keyof QuotationItem, value: any) => {
        setSections(sections.map(sec => {
            if (sec.id !== secId) return sec
            return {
                ...sec,
                items: sec.items.map(item => {
                    if (item.id !== itemId) return item
                    const updated = { ...item, [field]: value }

                    // Recalc total
                    if (['quantity', 'unit_price', 'discount_percent'].includes(field)) {
                        const q = field === 'quantity' ? Number(value) : item.quantity
                        const p = field === 'unit_price' ? Number(value) : item.unit_price
                        const d = field === 'discount_percent' ? Number(value) : (item.discount_percent || 0)
                        updated.total = q * p * (1 - d / 100)
                    }
                    return updated
                })
            }
        }))
    }

    const removeItem = (secId: string, itemId: string) => {
        setSections(sections.map(sec => {
            if (sec.id !== secId) return sec
            return { ...sec, items: sec.items.filter(i => i.id !== itemId) }
        }))
    }

    const selectProduct = (secId: string, itemId: string, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        updateItem(secId, itemId, 'name', product.name)
        // Also update other fields individually to trigger recalc if needed, or do bulk update
        // Bulk update is safer here
        setSections(sections.map(sec => {
            if (sec.id !== secId) return sec
            return {
                ...sec,
                items: sec.items.map(item => {
                    if (item.id !== itemId) return item
                    return {
                        ...item,
                        product_id: productId,
                        name: product.name,
                        description: product.description || '', // Pre-fill description
                        unit: product.unit,
                        unit_price: product.unit_price,
                        total: item.quantity * product.unit_price * (1 - (item.discount_percent || 0) / 100)
                    }
                })
            }
        }))
    }

    const duplicateSection = (sec: typeof sections[0]) => {
        const newSec = {
            ...sec,
            id: `sec-${Date.now()}`,
            name: sec.name + ' (Copy)',
            items: sec.items.map(i => ({ ...i, id: `item-${Date.now()}-${Math.random()}` }))
        }
        setSections([...sections, newSec])
    }

    return (
        <div className="space-y-8">
            {/* General Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Khách hàng <span className="text-red-500">*</span></Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn khách hàng..." />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Số báo giá</Label>
                        <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Sections & Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Chi tiết báo giá</h3>
                    <Button onClick={addSection} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Thêm hạng mục
                    </Button>
                </div>

                {sections.map((section, secIdx) => (
                    <Card key={section.id} className="relative shadow-none border-slate-200">
                        <CardHeader className="pb-3 px-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Input
                                        value={section.name}
                                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                                        className="font-bold text-lg border-transparent hover:border-input focus:border-input px-0 h-auto"
                                        placeholder="Tên hạng mục (VD: Thiết kế, In ấn...)"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => duplicateSection(section)} title="Nhân bản">
                                        <Copy className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)} disabled={sections.length === 1} title="Xóa hạng mục">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="w-[30%] pl-6">Tên hàng hóa / Dịch vụ</TableHead>
                                        <TableHead className="w-[10%]">ĐVT</TableHead>
                                        <TableHead className="w-[10%]">SL</TableHead>
                                        <TableHead className="w-[12%]">Đơn giá</TableHead>
                                        <TableHead className="w-[8%]">CK(%)</TableHead>
                                        <TableHead className="w-[10%]">VAT(%)</TableHead>
                                        <TableHead className="w-[15%] text-right">Thành tiền</TableHead>
                                        <TableHead className="w-[5%] pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.items.map((item) => (
                                        <TableRow key={item.id} className="group">
                                            <TableCell className="space-y-2 align-top pl-6">
                                                {/* Product Select or Text Input */}
                                                <div className="relative">
                                                    {/* We could use a Combobox here for better UX, simply input for now or select */}
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(section.id, item.id, 'name', e.target.value)}
                                                        placeholder="Nhập tên sản phẩm..."
                                                        className="font-medium"
                                                    />
                                                    {/* Optional: Quick pick from products */}
                                                </div>
                                                <Textarea
                                                    value={item.description || ''}
                                                    onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                                                    placeholder="Mô tả chi tiết (kích thước, chất liệu...)"
                                                    rows={2}
                                                    className="text-xs resize-none bg-muted/30"
                                                />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(section.id, item.id, 'unit', e.target.value)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input
                                                    type="number" min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(section.id, item.id, 'quantity', e.target.value)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input
                                                    type="number" min="0"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(section.id, item.id, 'unit_price', e.target.value)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Input
                                                    type="number" min="0" max="100"
                                                    value={item.discount_percent || 0}
                                                    onChange={(e) => updateItem(section.id, item.id, 'discount_percent', e.target.value)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Select
                                                    value={(item.vat_percent || 0).toString()}
                                                    onValueChange={(v) => updateItem(section.id, item.id, 'vat_percent', Number(v))}
                                                >
                                                    <SelectTrigger className="h-9 px-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">0%</SelectItem>
                                                        <SelectItem value="8">8%</SelectItem>
                                                        <SelectItem value="10">10%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-medium align-top pt-3">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                            <TableCell className="align-top pr-6">
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(section.id, item.id)} className="opacity-0 group-hover:opacity-100 h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="bg-muted/30 py-2 justify-center border-t">
                            <Button variant="ghost" size="sm" onClick={() => addItem(section.id)} className="h-8 text-muted-foreground hover:text-foreground">
                                <Plus className="mr-2 h-3 w-3" /> Thêm dòng
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Totals & Terms */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Điều khoản & Ghi chú</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Điều khoản thanh toán</Label>
                            <Textarea
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ghi chú (hiển thị cuối trang)</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Thông tin chuyển khoản</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Ngân hàng</Label>
                            <Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-8 shadow-none" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Số tài khoản</Label>
                            <Input value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)} className="h-8 shadow-none" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Chủ tài khoản</Label>
                            <Input value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} className="h-8 shadow-none" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Chi nhánh</Label>
                            <Input value={bankBranch} onChange={e => setBankBranch(e.target.value)} className="h-8 shadow-none" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Tổng tiền</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Thời hạn hiệu lực</span>
                            <div className="w-32">
                                <Select value={validDays} onValueChange={setValidDays}>
                                    <SelectTrigger className="h-8">
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
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Thuế VAT (Tổng cộng)</span>
                            <span className="font-medium text-slate-900">{formatCurrency(initialData?.vat_amount || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                            <span>TỔNG CỘNG</span>
                            <span className="text-primary">{formatCurrency(initialData?.grand_total || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
