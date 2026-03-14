'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { InvoiceReconciliationItem } from '@/lib/supabase/services/invoice-tracker-service'

const statusConfig = {
    ok: { label: 'OK', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    missing_output: { label: 'Chưa xuất HĐ', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
    unpaid: { label: 'Chưa thu tiền', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle },
    gap: { label: 'Chênh lệch', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
    missing_input: { label: 'Thiếu HĐ đầu vào', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
}

const formatVND = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toLocaleString('vi-VN')
}

interface InvoiceTrackerPanelProps {
    reconciliation: InvoiceReconciliationItem[]
    unissuedInvoices: {
        id: string
        contract_number: string
        title: string
        total_amount: number
        customer_name: string
    }[]
}

export default function InvoiceTrackerPanel({ reconciliation, unissuedInvoices }: InvoiceTrackerPanelProps) {
    const problems = reconciliation.filter(r => r.status !== 'ok')

    return (
        <div className="space-y-4">
            {/* Unissued Invoices */}
            {unissuedInvoices.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            Hợp đồng B2B chưa xuất hoá đơn ({unissuedInvoices.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {unissuedInvoices.map(inv => (
                                <Link
                                    key={inv.id}
                                    href={`/contracts/${inv.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{inv.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {inv.contract_number} — {inv.customer_name}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-red-700 shrink-0 ml-2">
                                        {formatVND(inv.total_amount)}₫
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reconciliation Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        Đối soát hoá đơn
                        {problems.length > 0 && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                {problems.length} cần xử lý
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reconciliation.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Chưa có dữ liệu hoá đơn
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 font-medium">Dự án</th>
                                        <th className="pb-2 font-medium text-right">HĐ Đầu ra</th>
                                        <th className="pb-2 font-medium text-right">Đã thu</th>
                                        <th className="pb-2 font-medium text-right">HĐ Đầu vào</th>
                                        <th className="pb-2 font-medium text-right">Chênh lệch</th>
                                        <th className="pb-2 font-medium text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciliation.slice(0, 20).map(item => {
                                        const config = statusConfig[item.status]
                                        return (
                                            <tr key={item.project_id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="py-2 pr-2">
                                                    <Link href={`/projects/${item.project_id}`} className="hover:underline">
                                                        <p className="font-medium truncate max-w-[200px]">{item.project_title}</p>
                                                        <p className="text-xs text-muted-foreground">{item.customer_name}</p>
                                                    </Link>
                                                </td>
                                                <td className="py-2 text-right">{formatVND(item.output_invoiced)}₫</td>
                                                <td className="py-2 text-right font-medium text-green-700">{formatVND(item.output_paid)}₫</td>
                                                <td className="py-2 text-right">{formatVND(item.input_invoiced)}₫</td>
                                                <td className={`py-2 text-right font-medium ${item.gap > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                    {item.gap > 0 ? '+' : ''}{formatVND(item.gap)}₫
                                                </td>
                                                <td className="py-2 text-center">
                                                    <Badge variant="outline" className={`text-xs ${config.color}`}>
                                                        {config.label}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
