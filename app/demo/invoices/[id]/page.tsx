'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { INVOICES, CUSTOMERS, formatCurrency } from '@/lib/demo/mock-data'
import { ArrowLeft, Calendar, User, FileText, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    paid: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle2 },
    pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
    overdue: { label: 'Quá hạn', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle },
}

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const invoice = INVOICES.find(i => i.id === id)

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Không tìm thấy hóa đơn</p>
                <Link href="/demo/invoices"><Button variant="outline">← Quay lại</Button></Link>
            </div>
        )
    }

    const st = STATUS_MAP[invoice.status] || STATUS_MAP.pending
    const StatusIcon = st.icon
    const customer = CUSTOMERS.find(c => c.id === invoice.customer)

    return (
        <div className="space-y-6 max-w-3xl">
            <Link href="/demo/invoices">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-zinc-950 dark:hover:text-zinc-50 -ml-3">
                    <ArrowLeft className="h-4 w-4" /> Hóa đơn
                </Button>
            </Link>

            {/* Invoice card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/50 p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            <div>
                                <p className="text-xs font-mono font-semibold text-muted-foreground">HÓA ĐƠN #{invoice.id}</p>
                                <h1 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">{invoice.description}</h1>
                            </div>
                        </div>
                    </div>
                    <Badge className={`text-xs font-semibold border-none px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${st.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {st.label}
                    </Badge>
                </div>

                {/* Amount */}
                <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Số tiền</p>
                    <p className="text-4xl font-black text-zinc-950 dark:text-zinc-50">{formatCurrency(invoice.amount)}</p>
                </div>

                {/* Details grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Khách hàng</p>
                                {customer ? (
                                    <Link href={`/demo/customers/${customer.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                        {invoice.customerName}
                                    </Link>
                                ) : (
                                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{invoice.customerName}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Phương thức</p>
                                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Chuyển khoản ngân hàng</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ngày tạo</p>
                                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{invoice.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ngày thanh toán</p>
                                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{invoice.paidDate || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-border/50 pt-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Lịch sử</p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Tạo hóa đơn</p>
                                <p className="text-xs text-muted-foreground">{invoice.dueDate}</p>
                            </div>
                        </div>
                        {invoice.status === 'paid' && invoice.paidDate && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Đã thanh toán</p>
                                    <p className="text-xs text-muted-foreground">{invoice.paidDate}</p>
                                </div>
                            </div>
                        )}
                        {invoice.status === 'overdue' && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Quá hạn thanh toán</p>
                                    <p className="text-xs text-muted-foreground">Quá hạn từ {invoice.dueDate}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
