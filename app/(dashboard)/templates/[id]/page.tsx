'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, Download, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Template {
    id: string
    name: string
    type: string
    content: string
    variables: string[]
}

interface Customer {
    id: string
    company_name: string
    address?: string
    tax_code?: string
    email?: string
    phone?: string
    representative?: string
    position?: string
}

export default function TemplateDetailPage() {
    const params = useParams()
    const templateId = params.id as string

    const [template, setTemplate] = useState<Template | null>(null)
    const [variables, setVariables] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

    // Fetch template and customers from server
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                // Fetch template
                const templateRes = await fetch(`/api/templates/${templateId}`)
                if (templateRes.ok) {
                    const tmpl = await templateRes.json()
                    setTemplate(tmpl)
                    // Initialize variables
                    const initialVars: Record<string, string> = {}
                    tmpl.variables.forEach((v: string) => {
                        initialVars[v] = ''
                    })
                    // Set default date values
                    const now = new Date()
                    initialVars['day'] = now.getDate().toString()
                    initialVars['month'] = (now.getMonth() + 1).toString()
                    initialVars['year'] = now.getFullYear().toString()
                    setVariables(initialVars)
                }

                // Fetch customers
                const custRes = await fetch('/api/customers')
                if (custRes.ok) {
                    const custData = await custRes.json()
                    setCustomers(Array.isArray(custData) ? custData : custData.customers || [])
                }
            } catch (err) {
                console.error('Error loading template:', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [templateId])

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomerId(customerId)
        const customer = customers.find(c => c.id === customerId)
        if (customer) {
            setVariables(prev => ({
                ...prev,
                customer_company: customer.company_name || '',
                customer_address: customer.address || '',
                customer_tax_code: customer.tax_code || '',
                customer_email: customer.email || '',
                customer_phone: customer.phone || '',
                customer_representative: customer.representative || '',
                customer_position: customer.position || '',
                customer_mobile: customer.phone || '',
            }))
        }
    }

    const handleVariableChange = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }))
    }

    // Real-time preview — re-renders on every variable change
    const previewHtml = useMemo(() => {
        if (!template) return ''
        let html = template.content
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            html = html.replace(regex, value || `<span style="color:#ccc;font-style:italic;">[${key.replace(/_/g, ' ')}]</span>`)
        }
        return html
    }, [template, variables])

    const handleDownload = () => {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title><style>@media print { @page { size: A4; margin: 10mm; } body { margin: 0; } }</style></head><body>${previewHtml}</body></html>`
        const blob = new Blob([fullHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template?.name || 'document'}.html`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title><style>@media print { @page { size: A4; margin: 10mm; } body { margin: 0; } }</style></head><body>${previewHtml}</body></html>`)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => printWindow.print(), 300)
        }
    }

    // Variable display labels
    const variableLabels: Record<string, string> = {
        contract_number: 'Số hợp đồng',
        order_number: 'Số đơn đặt hàng',
        payment_number: 'Số đề nghị TT',
        report_number: 'Số biên bản',
        day: 'Ngày',
        month: 'Tháng',
        year: 'Năm',
        customer_company: 'Tên công ty (Bên A)',
        customer_representative: 'Người đại diện',
        customer_position: 'Chức vụ',
        customer_address: 'Địa chỉ',
        customer_phone: 'Điện thoại',
        customer_mobile: 'Di động',
        customer_tax_code: 'Mã số thuế',
        customer_email: 'Email',
        customer_bank_account: 'Số tài khoản',
        customer_bank_name: 'Ngân hàng',
        contract_items_table: 'Bảng hàng hoá (HTML)',
        delivery_items_table: 'Bảng giao nhận (HTML)',
        subtotal: 'Cộng tiền hàng',
        vat_rate: 'Thuế suất GTGT',
        vat_amount: 'Tiền thuế',
        total_amount_number: 'Tổng tiền thanh toán',
        amount_in_words: 'Số tiền bằng chữ',
        payment_terms: 'Điều khoản thanh toán',
        delivery_time: 'Thời gian giao hàng',
        delivery_address: 'Địa điểm giao hàng',
        delivery_date: 'Ngày giao hàng',
        service_description: 'Mô tả dịch vụ',
        contract_date: 'Ngày ký hợp đồng',
        payment_percentage: 'Tỉ lệ thanh toán',
        payment_amount: 'Số tiền thanh toán',
        order_date: 'Ngày đặt hàng',
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">Không tìm thấy mẫu</h1>
                </div>
            </div>
        )
    }

    // Group variables for better UX
    const dateVars = template.variables.filter(v => ['day', 'month', 'year'].includes(v))
    const customerVars = template.variables.filter(v => v.startsWith('customer_'))
    const docVars = template.variables.filter(v => !v.startsWith('customer_') && !['day', 'month', 'year'].includes(v))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/templates">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        {template.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Điền thông tin để tạo giấy tờ từ mẫu này
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        In giấy tờ
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Tải HTML
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                {/* Variable Form */}
                <Card className="lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Thông tin biến</CardTitle>
                        <CardDescription>
                            Chọn khách hàng hoặc điền thủ công
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Chọn khách hàng</Label>
                            <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tự động điền thông tin Bên A..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        {/* Doc number & date */}
                        {(docVars.length > 0 || dateVars.length > 0) && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Thông tin giấy tờ</p>
                                <div className="grid gap-2">
                                    {docVars.filter(v => !['contract_items_table', 'delivery_items_table'].includes(v)).map(variable => (
                                        <div key={variable} className="space-y-1">
                                            <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                {variableLabels[variable] || variable.replace(/_/g, ' ')}
                                            </Label>
                                            <Input
                                                id={variable}
                                                value={variables[variable] || ''}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                placeholder={variableLabels[variable] || variable.replace(/_/g, ' ')}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    ))}
                                    {dateVars.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {dateVars.map(variable => (
                                                <div key={variable} className="space-y-1">
                                                    <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                        {variableLabels[variable]}
                                                    </Label>
                                                    <Input
                                                        id={variable}
                                                        value={variables[variable] || ''}
                                                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {customerVars.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Thông tin Bên A (khách hàng)</p>
                                    <div className="grid gap-2">
                                        {customerVars.map(variable => (
                                            <div key={variable} className="space-y-1">
                                                <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                    {variableLabels[variable] || variable.replace(/customer_/g, '').replace(/_/g, ' ')}
                                                </Label>
                                                <Input
                                                    id={variable}
                                                    value={variables[variable] || ''}
                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                    placeholder={variableLabels[variable] || variable.replace(/_/g, ' ')}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Real-time Preview */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Xem trước</CardTitle>
                        <CardDescription>
                            Nội dung giấy tờ sau khi điền biến
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <iframe
                            srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;font-size:10pt;}</style></head><body>${previewHtml}</body></html>`}
                            className="w-full border rounded-lg bg-white shadow-inner"
                            style={{ minHeight: '600px', maxHeight: 'calc(100vh - 240px)', height: '800px' }}
                            title="Xem trước giấy tờ"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Sau khi hoàn tất, bạn có thể in trực tiếp hoặc tải xuống file HTML
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                In giấy tờ
                            </Button>
                            <Button onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Tải xuống HTML
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
