'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, Download, Send, Eye, Loader2 } from 'lucide-react'
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
}

// Default templates for preview
const defaultTemplates: Template[] = [
    {
        id: 'default-0',
        name: 'Hợp đồng dịch vụ',
        type: 'contract',
        content: `<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
    <h1 style="text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 20px;">
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    </h1>
    <p style="text-align: center; font-weight: bold;">Độc lập – Tự do – Hạnh phúc</p>
    <h2 style="text-align: center; margin-top: 30px;">HỢP ĐỒNG DỊCH VỤ</h2>
    <p style="text-align: center; font-style: italic;">Số: {{contract_number}}</p>
    <h3>BÊN B (Bên sử dụng dịch vụ):</h3>
    <ul>
        <li>Tên công ty: {{customer_company}}</li>
        <li>Địa chỉ: {{customer_address}}</li>
        <li>Mã số thuế: {{customer_tax_code}}</li>
        <li>Email: {{customer_email}}</li>
    </ul>
    <h3>ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG</h3>
    <p>Tổng giá trị hợp đồng: <strong>{{total_amount}} VNĐ</strong></p>
</div>`,
        variables: ['contract_number', 'customer_company', 'customer_address', 'customer_tax_code', 'customer_email', 'total_amount']
    },
    {
        id: 'default-1',
        name: 'Đề nghị thanh toán',
        type: 'payment_request',
        content: `<div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px;">
    <h2 style="text-align: center;">ĐỀ NGHỊ THANH TOÁN</h2>
    <p>Kính gửi: <strong>{{customer_company}}</strong></p>
    <p>Địa chỉ: {{customer_address}}</p>
    <p>Căn cứ Hợp đồng số: <strong>{{contract_number}}</strong></p>
    <p>Số tiền đề nghị: <strong>{{payment_amount}} VNĐ</strong></p>
</div>`,
        variables: ['customer_company', 'customer_address', 'contract_number', 'payment_amount']
    }
]

export default function TemplateDetailPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.id as string

    const [template, setTemplate] = useState<Template | null>(null)
    const [variables, setVariables] = useState<Record<string, string>>({})
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

    useEffect(() => {
        // Load template
        const foundTemplate = defaultTemplates.find(t => t.id === templateId)
        if (foundTemplate) {
            setTemplate(foundTemplate)
            // Initialize variables
            const initialVars: Record<string, string> = {}
            foundTemplate.variables.forEach(v => {
                initialVars[v] = ''
            })
            setVariables(initialVars)
        }
        setIsLoading(false)

        // Mock customers - in real app, fetch from API
        setCustomers([
            { id: '1', company_name: 'Công ty ABC', address: '123 Đường ABC, Quận 1', tax_code: '0123456789', email: 'abc@company.com', phone: '0901234567' },
            { id: '2', company_name: 'Công ty XYZ', address: '456 Đường XYZ, Quận 3', tax_code: '9876543210', email: 'xyz@company.com', phone: '0909876543' }
        ])
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
                customer_phone: customer.phone || ''
            }))
        }
    }

    const handleVariableChange = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }))
    }

    const generatePreview = () => {
        if (!template) return
        let html = template.content
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g')
            html = html.replace(regex, value || `<span style="color: red">[${key}]</span>`)
        }
        setPreviewHtml(html)
        setShowPreview(true)
    }

    const handleDownload = () => {
        if (!previewHtml) {
            generatePreview()
        }
        // Create a blob and download
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title></head><body>${previewHtml || template?.content}</body></html>`
        const blob = new Blob([fullHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template?.name || 'document'}.html`
        a.click()
        URL.revokeObjectURL(url)
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
                    <h1 className="text-2xl font-bold">Không tìm thấy mẫu</h1>
                </div>
            </div>
        )
    }

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
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        {template.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Điền thông tin để tạo giấy tờ từ mẫu này
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={generatePreview}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem trước
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Variable Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin biến</CardTitle>
                        <CardDescription>
                            Chọn khách hàng hoặc điền thông tin thủ công
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Selection */}
                        <div className="space-y-2">
                            <Label>Chọn khách hàng</Label>
                            <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khách hàng để tự động điền..." />
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

                        {/* Variable Inputs */}
                        <div className="grid gap-3">
                            {template.variables.map(variable => (
                                <div key={variable} className="space-y-1">
                                    <Label htmlFor={variable} className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {`{{${variable}}}`}
                                        </Badge>
                                    </Label>
                                    <Input
                                        id={variable}
                                        value={variables[variable] || ''}
                                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                                        placeholder={`Nhập ${variable.replace(/_/g, ' ')}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Xem trước</CardTitle>
                        <CardDescription>
                            Nội dung giấy tờ sau khi điền biến
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {showPreview ? (
                            <div
                                className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto"
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        ) : (
                            <div className="border rounded-lg p-8 bg-muted/50 min-h-[400px] flex items-center justify-center text-center">
                                <div>
                                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Bấm "Xem trước" để xem nội dung đã điền
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Sau khi hoàn tất, bạn có thể tải xuống hoặc gửi cho khách hàng
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Send className="mr-2 h-4 w-4" />
                                Gửi cho khách hàng
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
