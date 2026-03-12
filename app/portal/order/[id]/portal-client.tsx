'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, CheckCircle2, Sparkles, ExternalLink, Copy, Check, Package, CalendarDays, User, CreditCard, QrCode, ShieldCheck, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    'pending': { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    'shooting': { label: 'Đang chụp', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    'editing': { label: 'Đang chỉnh sửa', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
    'completed': { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    'cancelled': { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_CONFIG[status] || { label: status, bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' }
    return (
        <span className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold", s.bg, s.text)}>
            <span className={cn("h-2 w-2 rounded-full animate-pulse", s.dot)} />
            {s.label}
        </span>
    )
}

function CopyableField({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success(`Đã sao chép ${label}`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                dark
                    ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                    : "bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
            )}
        >
            <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-medium mb-0.5", dark ? "text-zinc-400" : "text-zinc-500")}>{label}</p>
                <p className={cn("text-base font-bold font-mono tracking-tight truncate", dark ? "text-white" : "text-zinc-900")}>{value}</p>
            </div>
            <div className={cn(
                "shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-all",
                dark
                    ? "bg-white/10 group-hover:bg-white/20"
                    : "bg-white group-hover:bg-zinc-200 shadow-sm"
            )}>
                {copied
                    ? <Check className={cn("h-4 w-4", dark ? "text-emerald-400" : "text-emerald-600")} />
                    : <Copy className={cn("h-4 w-4", dark ? "text-zinc-400" : "text-zinc-500")} />
                }
            </div>
        </button>
    )
}

function InfoCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <div className="shrink-0 h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium">{label}</p>
                <p className="text-[15px] font-semibold text-zinc-900 truncate">{value || '—'}</p>
            </div>
        </div>
    )
}

export default function RetailOrderPortalContent({ order, brandConfig }: { order: any, brandConfig: any }) {
    const bankInfo = order.metadata?.bank_info || {
        bank_name: brandConfig?.studio_bank_name || brandConfig?.bank_name || 'VietinBank',
        account_no: brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '104002106705',
        account_name: brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'Nghiem Thi Lien'
    }

    const remainingAmount = order.total_amount - (order.paid_amount || 0)
    const bankId = bankInfo.bank_name.toLowerCase().includes('techcom') ? 'TCB'
        : bankInfo.bank_name.toLowerCase().includes('vietin') ? 'ICB'
        : bankInfo.bank_name.toLowerCase().includes('mb') ? 'MB'
        : bankInfo.bank_name.toLowerCase().includes('vcb') || bankInfo.bank_name.toLowerCase().includes('vietcom') ? 'VCB'
        : bankInfo.bank_name.toLowerCase().includes('acb') ? 'ACB'
        : bankInfo.bank_name.toLowerCase().includes('bidv') ? 'BIDV'
        : 'ICB'
    const transferContent = `THANH TOAN ${order.order_number}`
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankInfo.account_no}&bank=${bankId}&amount=${remainingAmount}&des=${encodeURIComponent(transferContent)}`

    const items = order.items || []
    const isPaid = order.payment_status === 'paid'

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white font-sans antialiased">
            <div className="max-w-lg mx-auto px-5 pt-10 pb-16 space-y-6">

                {/* ─── Brand Header ─── */}
                <div className="text-center space-y-5 pt-2 pb-4">
                    {brandConfig?.logo_url ? (
                        <img src={brandConfig.logo_url} alt="Logo" className="h-10 w-auto mx-auto object-contain" />
                    ) : (
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto flex items-center justify-center shadow-lg shadow-amber-200/50">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-zinc-400 tracking-wider uppercase mb-1">
                            {brandConfig?.brand_name || 'Tulie Studio'}
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                            {order.order_number}
                        </h1>
                        <div className="flex justify-center mt-3">
                            <StatusBadge status={order.order_status} />
                        </div>
                    </div>
                </div>

                {/* ─── Order Info Grid ─── */}
                <div className="grid grid-cols-2 gap-3">
                    <InfoCell icon={User} label="Khách hàng" value={order.customer_name} />
                    <InfoCell icon={CalendarDays} label="Ngày đặt đơn" value={order.order_date ? formatDate(order.order_date) : formatDate(order.created_at)} />
                    {order.delivery_date && (
                        <InfoCell icon={Package} label="Ngày bàn giao" value={formatDate(order.delivery_date)} />
                    )}
                    {order.customer_phone && (
                        <InfoCell icon={MessageCircle} label="Số điện thoại" value={order.customer_phone} />
                    )}
                </div>

                {/* ─── Order Items ─── */}
                {items.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100">
                            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Chi tiết đơn hàng</h2>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {items.map((item: any, i: number) => (
                                <div key={item.id || i} className={cn("px-5 py-4 flex items-center justify-between gap-4", i % 2 === 1 && "bg-zinc-50/50")}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-zinc-900 truncate">{item.product_name}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {item.quantity} × {formatCurrency(item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900 tabular-nums whitespace-nowrap">
                                        {formatCurrency(item.total_price || item.quantity * item.unit_price)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {order.shipping_fee > 0 && (
                            <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
                                <p className="text-sm text-zinc-500">Phí vận chuyển</p>
                                <p className="text-sm font-semibold text-zinc-700 tabular-nums">{formatCurrency(order.shipping_fee)}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Payment Summary ─── */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-500">Tổng giá trị</span>
                            <span className="text-lg font-bold text-zinc-900 tabular-nums">{formatCurrency(order.total_amount)}</span>
                        </div>
                        {(order.deposit_amount > 0 || order.paid_amount > 0) && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-500">Đã thanh toán</span>
                                <span className="text-sm font-semibold text-emerald-600 tabular-nums flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {formatCurrency(order.paid_amount || order.deposit_amount || 0)}
                                </span>
                            </div>
                        )}
                        {!isPaid && remainingAmount > 0 && (
                            <>
                                <div className="border-t border-dashed border-zinc-200 pt-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-zinc-700">Còn lại</span>
                                    <span className="text-xl font-extrabold text-amber-600 tabular-nums">{formatCurrency(remainingAmount)}</span>
                                </div>
                            </>
                        )}
                        {isPaid && (
                            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-sm font-bold">Đã hoàn tất thanh toán</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Resources ─── */}
                {(order.order_status === 'completed' || order.resource_link || order.demo_link) && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 px-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Tài nguyên dự án
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {order.demo_link && (
                                <Button asChild variant="outline" className="h-14 group rounded-2xl border-zinc-200 hover:bg-amber-50 hover:border-amber-200 justify-start px-5 transition-all">
                                    <a href={order.demo_link} target="_blank">
                                        <div className="text-left flex-1">
                                            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Xem trước</p>
                                            <p className="text-sm font-bold text-zinc-900">Ảnh mẫu Demo</p>
                                        </div>
                                        <ExternalLink className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                                    </a>
                                </Button>
                            )}
                            {order.resource_link && (
                                <Button asChild className="h-14 group rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/40 justify-start px-5 border-none transition-all">
                                    <a href={order.resource_link} target="_blank">
                                        <Download className="mr-3 h-5 w-5 opacity-70" />
                                        <div className="text-left flex-1">
                                            <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Bàn giao</p>
                                            <p className="text-sm font-bold">Tải ảnh gốc</p>
                                        </div>
                                        <ExternalLink className="ml-auto h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                                    </a>
                                </Button>
                            )}
                        </div>
                        {!order.resource_link && order.demo_link && (
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                                    💡 Link tải ảnh gốc sẽ hiện ra sau khi bạn hoàn tất thanh toán phần còn lại.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Payment / Bank Transfer ─── */}
                {remainingAmount > 0 && !isPaid && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2 px-1">
                            <CreditCard className="h-4 w-4 text-amber-500" />
                            Chuyển khoản thanh toán
                        </h2>

                        {/* QR Code */}
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col items-center">
                            <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-amber-100/50 border border-zinc-100 mb-4">
                                <img
                                    src={qrUrl}
                                    alt="QR thanh toán"
                                    className="w-52 h-52 sm:w-56 sm:h-56 object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                                <QrCode className="h-4 w-4 text-amber-500" />
                                <span>Quét mã QR để thanh toán tự động</span>
                            </div>
                        </div>

                        {/* Bank Info */}
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-zinc-400 font-medium mb-1">Ngân hàng</p>
                                    <p className="text-sm font-bold text-zinc-900">{bankInfo.bank_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-400 font-medium mb-1">Chủ tài khoản</p>
                                    <p className="text-sm font-bold text-zinc-900">{bankInfo.account_name}</p>
                                </div>
                            </div>

                            <CopyableField value={bankInfo.account_no} label="Số tài khoản" />
                            <CopyableField value={transferContent} label="Nội dung chuyển khoản" dark />

                            <div className="pt-2 text-center">
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Hệ thống tự động ghi nhận thanh toán khi giao dịch thành công.
                                    <br />Vui lòng <span className="font-semibold text-zinc-600">không thay đổi</span> nội dung chuyển khoản.
                                </p>
                            </div>
                        </div>

                        {/* Mobile: Save QR */}
                        <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-zinc-200 text-sm font-semibold sm:hidden hover:bg-amber-50 hover:border-amber-200 transition-all">
                            <a href={qrUrl} download={`QR_${order.order_number}.png`}>
                                <Download className="mr-2 h-4 w-4" />
                                Lưu mã QR vào máy
                            </a>
                        </Button>
                    </div>
                )}

                {/* ─── Notes ─── */}
                {order.notes && (
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                        <p className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wider">Ghi chú</p>
                        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                    </div>
                )}

                {/* ─── Footer ─── */}
                <div className="text-center space-y-4 pt-4 pb-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                    <p className="text-xs text-zinc-400 font-medium">
                        Bạn cần hỗ trợ?{' '}
                        <a href="https://zalo.me/0963715692" target="_blank" className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors">
                            Liên hệ Zalo
                        </a>
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">
                        © {new Date().getFullYear()} {brandConfig?.brand_name || 'Tulie Studio'} — Powered by Tulie
                    </p>
                </div>
            </div>
        </div>
    )
}
