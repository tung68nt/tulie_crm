'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Download, Printer, Check, ChevronRight, ChevronDown, Building2, User, Mail, Phone, MapPin, ClipboardList, CreditCard, Package, AlertTriangle, Save, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Contract } from '@/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'


interface ContractDocumentsProps {
    contract: Contract
}

export function ContractDocuments({ contract }: ContractDocumentsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [dbDocs, setDbDocs] = useState<any[]>([])
    const [regenerating, setRegenerating] = useState(false)

    const loadDocs = useCallback(() => {
        fetch(`/api/contracts/${contract.id}/documents`)
            .then(r => r.ok ? r.json() : { documents: [] })
            .then(data => setDbDocs(data.documents || []))
            .catch(() => {})
    }, [contract.id])

    // Load DB documents on mount
    useEffect(() => {
        loadDocs()
    }, [loadDocs])

    // Regenerate all documents from current contract data
    const handleRegenerate = async () => {
        setRegenerating(true)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ regenerate: true })
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Đã tạo lại giấy tờ thành công')
            loadDocs()
        } catch {
            toast.error('Không thể tạo lại giấy tờ')
        } finally {
            setRegenerating(false)
        }
    }

    // Build doc items list from DB docs or fallback to static types
    interface DocItem {
        key: string
        type: string
        label: string
        description: string
        icon: any
        fromDb: boolean
        dbDocId?: string
        milestoneId?: string
        isVisible?: boolean
    }


    const DOC_META: Record<string, { label: string; description: string; icon: any }> = {
        contract: { label: 'Hợp đồng kinh tế', description: 'Hợp đồng ký kết giữa 2 bên với đầy đủ điều khoản pháp lý', icon: FileText },
        order: { label: 'Đơn đặt hàng', description: 'Đơn đặt hàng chi tiết sản phẩm/dịch vụ', icon: ClipboardList },
        payment_request: { label: 'Đề nghị thanh toán', description: 'Đề nghị thanh toán theo hợp đồng kinh tế', icon: CreditCard },
        delivery_minutes: { label: 'Biên bản giao nhận', description: 'Biên bản xác nhận giao nhận hàng hóa/dịch vụ', icon: Package },
    }

    const isFramework = contract.type === 'contract'
    const isOrder = contract.type === 'order'

    const docItems: DocItem[] = (() => {
        if (dbDocs.length > 0) {
            // Build from DB documents
            const paymentDocs = dbDocs.filter(d => d.type === 'payment_request')
            return dbDocs.map((doc, idx) => {
                const meta = DOC_META[doc.type] || DOC_META.contract
                const paymentIdx = doc.type === 'payment_request' 
                    ? paymentDocs.indexOf(doc) + 1 
                    : 0
                const milestone = contract.milestones?.find(m => m.id === doc.milestone_id)
                return {
                    key: doc.id,
                    type: doc.type,
                    label: doc.type === 'payment_request' && paymentDocs.length > 1
                        ? `ĐNTT ${paymentIdx}: ${milestone?.name || `Đợt ${paymentIdx}`}`
                        : meta.label,
                    description: doc.doc_number || meta.description,
                    icon: meta.icon,
                    fromDb: true,
                    dbDocId: doc.id,
                    milestoneId: doc.milestone_id,
                    isVisible: doc.is_visible_on_portal !== false,
                }
            })
        }

        // Fallback: static doc types based on contract type
        const types = isOrder 
            ? ['order', 'payment_request', 'delivery_minutes']
            : ['contract', 'payment_request', 'delivery_minutes']
        
        return types.map(type => {
            const meta = DOC_META[type]
            return {
                key: type,
                type,
                label: meta.label,
                description: meta.description,
                icon: meta.icon,
                fromDb: false,
                isVisible: false,
            }
        })
    })()

    // Preview: open stored doc directly or generate on-the-fly
    const handlePreviewDoc = (item: DocItem) => {
        setLoading(item.key)
        if (item.dbDocId) {
            window.open(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`, '_blank')
        } else {
            window.open(`/api/contracts/${contract.id}/preview?type=${item.type}`, '_blank')
        }
        setLoading(null)
    }

    const handleToggleVisibility = async (item: DocItem) => {
        if (!item.dbDocId) return
        setLoading(item.key)
        try {
            const nextVal = !item.isVisible
            const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/toggle-visibility`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_visible: nextVal })
            })
            if (!res.ok) throw new Error('Cập nhật thất bại')
            setDbDocs(prev => prev.map(d => d.id === item.dbDocId ? { ...d, is_visible_on_portal: nextVal } : d))
            toast.success(nextVal ? 'Đã hiển thị trên Portal' : 'Đã ẩn khỏi Portal')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(null)
        }
    }

    // Print
    const handlePrintDoc = async (item: DocItem) => {
        setLoading(item.key)
        const win = window.open('', '_blank')
        if (!win) { setLoading(null); return }
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Đang tạo...</title><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#666;}</style></head><body><p>Đang tải...</p></body></html>`)
        win.document.close()

        try {
            let html: string
            if (item.dbDocId) {
                const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`)
                html = await res.text()
            } else {
                const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: item.type, additionalVariables: customerInfo })
                })
                const data = await res.json()
                html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title><style>@media print{@page{size:A4;margin:15mm 20mm}body>div{padding:0!important;margin:0!important;max-width:none!important}}</style></head><body>${data.content || ''}</body></html>`
            }
            win.document.open()
            win.document.write(html)
            win.document.close()
            win.focus()
            setTimeout(() => win.print(), 300)
        } catch {
            win.close()
        } finally {
            setLoading(null)
        }
    }

    // Download
    const handleDownloadDoc = async (item: DocItem) => {
        setLoading(item.key)
        try {
            let html: string
            if (item.dbDocId) {
                const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`)
                html = await res.text()
            } else {
                const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: item.type, additionalVariables: customerInfo })
                })
                const data = await res.json()
                html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${item.label}</title><style>@media print{@page{size:A4;margin:15mm 20mm}body>div{padding:0!important;margin:0!important;max-width:none!important}}</style></head><body>${data.content || ''}</body></html>`
            }
            const blob = new Blob([html], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${item.label} - ${contract.contract_number}.html`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            alert('Không thể tải giấy tờ')
        } finally {
            setLoading(null)
        }
    }

    // Editable customer info — pre-filled from snapshot or customer
    const snapshot = contract.customer_snapshot
    const cust = contract.customer
    const [customerInfo, setCustomerInfo] = useState({
        customer_company: snapshot?.company_name || cust?.company_name || '',
        customer_representative_title: snapshot?.representative_title || cust?.representative_title || '',
        customer_representative: snapshot?.representative || cust?.representative || '',
        customer_position: snapshot?.position || cust?.position || '',
        customer_email: snapshot?.email || cust?.email || '',
        customer_phone: snapshot?.phone || cust?.phone || '',
        customer_tax_code: snapshot?.tax_code || cust?.tax_code || '',
        customer_address: snapshot?.address || cust?.address || '',
        customer_invoice_address: snapshot?.invoice_address || cust?.invoice_address || '',
    })
    const [infoChanged, setInfoChanged] = useState(false)
    const [savingInfo, setSavingInfo] = useState(false)

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({ ...prev, [name]: value }))
        setInfoChanged(true)
    }

    // Save customer info to contract's customer_snapshot
    const handleSaveCustomerInfo = useCallback(async () => {
        setSavingInfo(true)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/snapshot`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: customerInfo.customer_company,
                    representative_title: customerInfo.customer_representative_title,
                    representative: customerInfo.customer_representative,
                    position: customerInfo.customer_position,
                    email: customerInfo.customer_email,
                    phone: customerInfo.customer_phone,
                    tax_code: customerInfo.customer_tax_code,
                    address: customerInfo.customer_address,
                    invoice_address: customerInfo.customer_invoice_address,
                })
            })
            if (!res.ok) throw new Error('Lỗi lưu thông tin')
            setInfoChanged(false)
            toast.success('Đã lưu thông tin khách hàng')
        } catch (err: any) {
            toast.error(err.message || 'Không thể lưu thông tin')
        } finally {
            setSavingInfo(false)
        }
    }, [contract.id, customerInfo])

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
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Xuất giấy tờ từ dữ liệu hợp đồng — tự động điền thông tin
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={handleRegenerate}
                        disabled={regenerating}
                    >
                        <RefreshCw className={`h-3 w-3 ${regenerating ? 'animate-spin' : ''}`} />
                        {regenerating ? 'Đang tạo...' : 'Tạo lại'}
                    </Button>
                </div>
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
                                        <Label className="text-[10px] text-muted-foreground">Đại diện pháp luật</Label>
                                        <div className="flex gap-1.5">
                                            <select
                                                name="customer_representative_title"
                                                value={customerInfo.customer_representative_title}
                                                onChange={(e) => { setCustomerInfo(prev => ({ ...prev, customer_representative_title: e.target.value })); setInfoChanged(true) }}
                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-[60px]"
                                            >
                                                <option value="">—</option>
                                                <option value="Ông">Ông</option>
                                                <option value="Bà">Bà</option>
                                            </select>
                                            <div className="relative flex-1">
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
                                        {customerInfo.customer_representative_title && customerInfo.customer_representative && (
                                            <p className="text-[9px] text-muted-foreground">{customerInfo.customer_representative_title} {customerInfo.customer_representative}</p>
                                        )}
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
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ trụ sở</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            name="customer_address"
                                            value={customerInfo.customer_address}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Địa chỉ đăng ký kinh doanh"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ xuất hóa đơn (nếu khác)</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
                                        <Input
                                            name="customer_invoice_address"
                                            value={customerInfo.customer_invoice_address}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Bỏ trống nếu trùng địa chỉ trụ sở"
                                        />
                                    </div>
                                </div>
                            </div>

                                <Button
                                    size="sm"
                                    variant={infoChanged ? "default" : "outline"}
                                    onClick={handleSaveCustomerInfo}
                                    disabled={savingInfo || !infoChanged}
                                    className="w-full mt-2"
                                >
                                    {savingInfo ? (
                                        <><LoadingSpinner size="sm" className="mr-2" /> Đang lưu...</>
                                    ) : infoChanged ? (
                                        <><Save className="mr-2 h-3.5 w-3.5" /> Lưu thông tin khách hàng</>
                                    ) : (
                                        <><Check className="mr-2 h-3.5 w-3.5" /> Đã lưu</>
                                    )}
                                </Button>
                        </div>
                    )}
                </div>

                {/* Document list */}
                <div className="space-y-2">
                {docItems.map((item, idx) => {
                    const isActive = loading === item.key
                    const isGenerated = item.fromDb

                    return (
                        <div
                            key={item.key}
                            className="group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                        >
                            <item.icon className="h-4 w-4 text-zinc-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                    {isGenerated && (
                                        <Badge variant="outline" className="text-[10px] leading-none px-1 py-0 text-green-600 border-green-200 bg-green-50 shrink-0">
                                            <Check className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handlePreviewDoc(item)}
                                    disabled={isActive}
                                    title="Xem"
                                >
                                    {isActive ? <LoadingSpinner size="sm" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                </Button>
                                {isGenerated && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleToggleVisibility(item)}
                                        disabled={isActive}
                                        title={item.isVisible ? "Đang hiện trên Portal — bấm để ẩn" : "Đang ẩn — bấm để hiện trên Portal"}
                                    >
                                        {item.isVisible ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-400" />}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handlePrintDoc(item)}
                                    disabled={isActive}
                                    title="In"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleDownloadDoc(item)}
                                    disabled={isActive}
                                    title="Tải xuống"
                                >
                                    <Download className="h-3.5 w-3.5" />
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
