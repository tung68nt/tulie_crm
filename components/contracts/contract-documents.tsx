'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Printer, Check, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Contract } from '@/types'

const DOCUMENT_TYPES = [
    {
        type: 'contract',
        label: 'Hợp đồng kinh tế',
        description: 'Hợp đồng ký kết giữa 2 bên với đầy đủ điều khoản pháp lý',
        icon: '📄',
    },
    {
        type: 'order',
        label: 'Đơn đặt hàng',
        description: 'Đơn đặt hàng chi tiết sản phẩm/dịch vụ',
        icon: '📋',
    },
    {
        type: 'payment_request',
        label: 'Đề nghị thanh toán',
        description: 'Công văn đề nghị thanh toán công nợ theo hợp đồng',
        icon: '💳',
    },
    {
        type: 'delivery_minutes',
        label: 'Biên bản giao nhận',
        description: 'Biên bản xác nhận giao nhận hàng hóa/dịch vụ',
        icon: '📦',
    }
]

interface ContractDocumentsProps {
    contract: Contract
}

export function ContractDocuments({ contract }: ContractDocumentsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [generated, setGenerated] = useState<Record<string, string>>({})

    const handleGenerate = async (type: string, action: 'preview' | 'download' | 'print') => {
        setLoading(type)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })

            if (!res.ok) throw new Error('Failed to generate')
            const data = await res.json()

            if (data.html) {
                setGenerated(prev => ({ ...prev, [type]: data.html }))

                if (action === 'preview') {
                    const win = window.open('', '_blank')
                    if (win) {
                        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${DOCUMENT_TYPES.find(d => d.type === type)?.label}</title><style>@media print { @page { size: A4; margin: 10mm; } }</style></head><body>${data.html}</body></html>`)
                        win.document.close()
                    }
                } else if (action === 'print') {
                    const win = window.open('', '_blank')
                    if (win) {
                        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${DOCUMENT_TYPES.find(d => d.type === type)?.label}</title><style>@media print { @page { size: A4; margin: 10mm; } }</style></head><body>${data.html}</body></html>`)
                        win.document.close()
                        win.focus()
                        setTimeout(() => win.print(), 300)
                    }
                } else if (action === 'download') {
                    const label = DOCUMENT_TYPES.find(d => d.type === type)?.label || 'document'
                    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${label}</title><style>@media print { @page { size: A4; margin: 10mm; } }</style></head><body>${data.html}</body></html>`], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${label} - ${contract.contract_number}.html`
                    a.click()
                    URL.revokeObjectURL(url)
                }
            }
        } catch (err) {
            console.error('Error generating document:', err)
        } finally {
            setLoading(null)
        }
    }

    // Determine lifecycle step from contract
    const isFramework = contract.type === 'contract'
    const isOrder = contract.type === 'order'

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
                {/* Customer info auto-fill preview */}
                {contract.customer && (
                    <div className="rounded-lg bg-muted/50 border border-dashed p-3 space-y-1.5">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Thông tin tự động điền</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                            {contract.customer.company_name && (
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground shrink-0">Công ty:</span>
                                    <span className="font-medium truncate">{contract.customer.company_name}</span>
                                </div>
                            )}
                            {contract.customer.representative && (
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground shrink-0">Đại diện:</span>
                                    <span className="font-medium truncate">{contract.customer.representative}</span>
                                </div>
                            )}
                            {contract.customer.address && (
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground shrink-0">Địa chỉ:</span>
                                    <span className="font-medium truncate">{contract.customer.address}</span>
                                </div>
                            )}
                            {contract.customer.tax_code && (
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground shrink-0">MST:</span>
                                    <span className="font-medium">{contract.customer.tax_code}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                            <span className="text-xl">{doc.icon}</span>
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
