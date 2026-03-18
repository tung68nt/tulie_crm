'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Printer, Check, ChevronRight, ChevronDown, Building2, User, Mail, Phone, MapPin, ClipboardList, CreditCard, Package, AlertTriangle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Contract } from '@/types'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DOCUMENT_TYPES = [
    {
        type: 'contract',
        label: 'Hợp đồng kinh tế',
        description: 'Hợp đồng ký kết giữa 2 bên với đầy đủ điều khoản pháp lý',
        icon: FileText,
    },
    {
        type: 'order',
        label: 'Đơn đặt hàng',
        description: 'Đơn đặt hàng chi tiết sản phẩm/dịch vụ',
        icon: ClipboardList,
    },
    {
        type: 'payment_request',
        label: 'Đề nghị thanh toán',
        description: 'Công văn đề nghị thanh toán công nợ theo hợp đồng',
        icon: CreditCard,
    },
    {
        type: 'delivery_minutes',
        label: 'Biên bản giao nhận',
        description: 'Biên bản xác nhận giao nhận hàng hóa/dịch vụ',
        icon: Package,
    }
]

interface ContractDocumentsProps {
    contract: Contract
}

export function ContractDocuments({ contract }: ContractDocumentsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [generated, setGenerated] = useState<Record<string, string>>({})
    const [showForm, setShowForm] = useState(false)

    // Editable customer info — pre-filled from contract.customer
    const [customerInfo, setCustomerInfo] = useState({
        customer_company: contract.customer?.company_name || '',
        customer_representative: contract.customer?.representative || '',
        customer_position: contract.customer?.position || '',
        customer_email: contract.customer?.email || '',
        customer_phone: contract.customer?.phone || '',
        customer_tax_code: contract.customer?.tax_code || '',
        customer_address: contract.customer?.address || '',
    })

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleGenerate = async (type: string, action: 'preview' | 'download' | 'print') => {
        setLoading(type)

        // IMPORTANT: Open window SYNCHRONOUSLY during user click to avoid popup blocker
        let win: Window | null = null
        if (action === 'preview' || action === 'print') {
            win = window.open('', '_blank')
            if (win) {
                win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Đang tạo giấy tờ...</title><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#666;}.spinner{width:20px;height:20px;border:2px solid #e5e7eb;border-top-color:#18181b;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:10px;}@keyframes spin{to{transform:rotate(360deg)}}.wrap{display:flex;align-items:center;}</style></head><body><div class="wrap"><div class="spinner"></div><p>Đang tạo giấy tờ, vui lòng đợi...</p></div></body></html>`)
                win.document.close()
            }
        }

        try {
            const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    additionalVariables: customerInfo,
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || `Lỗi ${res.status}`)
            }
            const data = await res.json()

            const html = data.content || data.html
            if (html) {
                setGenerated(prev => ({ ...prev, [type]: html }))
                const title = DOCUMENT_TYPES.find(d => d.type === type)?.label || 'Document'
                const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>@media print { @page { size: A4; margin: 10mm; } }</style></head><body>${html}</body></html>`

                if (action === 'preview' && win) {
                    win.document.open()
                    win.document.write(fullHtml)
                    win.document.close()
                } else if (action === 'print' && win) {
                    win.document.open()
                    win.document.write(fullHtml)
                    win.document.close()
                    win.focus()
                    setTimeout(() => win!.print(), 300)
                } else if (action === 'download') {
                    const label = DOCUMENT_TYPES.find(d => d.type === type)?.label || 'document'
                    const blob = new Blob([fullHtml], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${label} - ${contract.contract_number}.html`
                    a.click()
                    URL.revokeObjectURL(url)
                }
            } else {
                if (win) win.close()
            }
        } catch (err: any) {
            console.error('Error generating document:', err)
            if (win) win.close()
            alert(`Không thể tạo giấy tờ: ${err.message}`)
        } finally {
            setLoading(null)
        }
    }

    // Determine lifecycle step from contract
    const isFramework = contract.type === 'contract'
    const isOrder = contract.type === 'order'

    // Validation warnings for document completeness
    const missingDocFields: string[] = []
    if (!contract.signed_date) missingDocFields.push('Ngày ký hợp đồng')
    if (!contract.customer?.abbreviation) missingDocFields.push('Tên viết tắt KH (mã giấy tờ)')
    if (!contract.milestones?.some(m => m.type === 'payment')) missingDocFields.push('Mốc thanh toán')
    if (!contract.quotation_id) missingDocFields.push('Báo giá liên kết (danh sách sản phẩm)')

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5" />
                    Bộ giấy tờ
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Xuất giấy tờ từ dữ liệu hợp đồng — tự động điền thông tin
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Warning for missing data */}
                {missingDocFields.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800">
                            <strong>Thiếu thông tin:</strong> {missingDocFields.join(' • ')}.
                            Giấy tờ vẫn preview được nhưng các phần thiếu sẽ để trống.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Editable customer info form */}
                <div className="rounded-lg border border-dashed">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                                Thông tin điền vào giấy tờ
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {customerInfo.customer_company || 'Chưa có'} • {customerInfo.customer_representative || 'Chưa có đại diện'}
                            </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showForm ? 'rotate-180' : ''}`} />
                    </button>

                    {showForm && (
                        <div className="px-3 pb-3 space-y-2.5 border-t">
                            <div className="grid grid-cols-1 gap-2 pt-2.5">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Công ty</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            name="customer_company"
                                            value={customerInfo.customer_company}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Tên công ty"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Đại diện</Label>
                                        <div className="relative">
                                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                name="customer_representative"
                                                value={customerInfo.customer_representative}
                                                onChange={handleInfoChange}
                                                className="pl-8 h-8 text-xs"
                                                placeholder="Họ tên"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Chức vụ</Label>
                                        <Input
                                            name="customer_position"
                                            value={customerInfo.customer_position}
                                            onChange={handleInfoChange}
                                            className="h-8 text-xs"
                                            placeholder="Giám đốc..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                name="customer_email"
                                                value={customerInfo.customer_email}
                                                onChange={handleInfoChange}
                                                className="pl-8 h-8 text-xs"
                                                placeholder="email@..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">SĐT</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                name="customer_phone"
                                                value={customerInfo.customer_phone}
                                                onChange={handleInfoChange}
                                                className="pl-8 h-8 text-xs"
                                                placeholder="0xxx..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">MST</Label>
                                    <Input
                                        name="customer_tax_code"
                                        value={customerInfo.customer_tax_code}
                                        onChange={handleInfoChange}
                                        className="h-8 text-xs"
                                        placeholder="Mã số thuế"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            name="customer_address"
                                            value={customerInfo.customer_address}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Địa chỉ"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Document list */}
                <div className="space-y-2">
                {DOCUMENT_TYPES.map((doc) => {
                    const isActive = loading === doc.type
                    const isGenerated = !!generated[doc.type]

                    // Show order template only for orders, contract for contracts
                    // Payment & delivery always show
                    if (doc.type === 'contract' && isOrder) return null
                    if (doc.type === 'order' && isFramework && !contract.order_number) return null

                    return (
                        <div
                            key={doc.type}
                            className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                            <doc.icon className="h-5 w-5 text-zinc-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{doc.label}</p>
                                    {isGenerated && (
                                        <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                                            <Check className="h-3 w-3 mr-1" />
                                            Đã tạo
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleGenerate(doc.type, 'preview')}
                                    disabled={isActive}
                                >
                                    {isActive ? <LoadingSpinner size="sm" /> : <ChevronRight className="h-3 w-3" />}
                                    Xem
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleGenerate(doc.type, 'print')}
                                    disabled={isActive}
                                >
                                    <Printer className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleGenerate(doc.type, 'download')}
                                    disabled={isActive}
                                >
                                    <Download className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
                </div>
            </CardContent>
        </Card>
    )
}
