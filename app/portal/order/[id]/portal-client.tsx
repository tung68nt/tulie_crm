'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Download, CheckCircle2, Sparkles, ExternalLink, Copy, Check, Package, CalendarDays, User, CreditCard, QrCode, ShieldCheck, MessageCircle, Truck, Clock, RefreshCw, MapPin, Save, FileText, Smartphone } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generatePaymentContent } from '@/lib/utils/payment-utils'
import { buildVietQrUrl, buildVietQrDeeplink } from '@/lib/utils/vietqr'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    'pending': { label: 'Chờ xử lý', bg: 'bg-zinc-50', text: 'text-zinc-500', dot: 'bg-zinc-400', border: 'border-zinc-200' },
    'editing': { label: 'Đang chỉnh sửa', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-200' },
    'edit_done': { label: 'Hoàn thành chỉnh sửa', bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500', border: 'border-violet-200' },
    'waiting_ship': { label: 'Chờ giao hàng', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', border: 'border-amber-200' },
    'shipping': { label: 'Đang giao hàng', bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', border: 'border-orange-200' },
    'completed': { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'cancelled': { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-200' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_CONFIG[status] || { label: status, bg: 'bg-zinc-50', text: 'text-zinc-500', dot: 'bg-zinc-400', border: 'border-zinc-200' }
    return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border", s.bg, s.border)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
            <span className={cn("text-xs font-medium", s.text)}>{s.label}</span>
        </div>
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
                <p className={cn("text-[11px] font-medium mb-0.5", dark ? "text-zinc-400" : "text-muted-foreground")}>{label}</p>
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

function PortalPaymentWatcher({ token, remainingAmount }: { token: string; remainingAmount: number }) {
    const [isPolling, setIsPolling] = useState(true)
    const [isTimedOut, setIsTimedOut] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [paymentDetected, setPaymentDetected] = useState(false)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const startTimeRef = useRef(Date.now())
    const pollRef = useRef<NodeJS.Timeout | null>(null)
    const tickRef = useRef<NodeJS.Timeout | null>(null)
    const lastPaidRef = useRef(0)

    const maxSeconds = 15 * 60 // 15 minutes
    const remaining = maxSeconds - elapsedSeconds
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    const checkPayment = useCallback(async () => {
        try {
            const res = await fetch(`/api/studio/payment-status?token=${token}`, { cache: 'no-store' })
            if (!res.ok) return
            const data = await res.json()

            if (data.paid_amount > lastPaidRef.current) {
                lastPaidRef.current = data.paid_amount
                setPaymentDetected(true)
                setIsPolling(false)
                if (pollRef.current) clearInterval(pollRef.current)
                if (tickRef.current) clearInterval(tickRef.current)
                toast.success('🎉 Đã nhận thanh toán! Trang sẽ cập nhật...')
                setTimeout(() => window.location.reload(), 3000)
            }
        } catch { /* ignore */ }
    }, [token])

    useEffect(() => {
        if (!isPolling || paymentDetected) return

        checkPayment()
        pollRef.current = setInterval(checkPayment, 5000)
        tickRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
            setElapsedSeconds(elapsed)
            if (elapsed >= maxSeconds) {
                setIsPolling(false)
                setIsTimedOut(true)
                if (pollRef.current) clearInterval(pollRef.current)
                if (tickRef.current) clearInterval(tickRef.current)
            }
        }, 1000)

        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
            if (tickRef.current) clearInterval(tickRef.current)
        }
    }, [isPolling, paymentDetected, checkPayment, maxSeconds])

    const handleResume = () => {
        startTimeRef.current = Date.now()
        setElapsedSeconds(0)
        setIsTimedOut(false)
        setIsPolling(true)
    }

    const handleManualCheck = async () => {
        setIsChecking(true)
        await checkPayment()
        setIsChecking(false)
        if (!paymentDetected) toast.info('Chưa nhận được thanh toán. Vui lòng chờ thêm.')
    }

    if (paymentDetected) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col items-center gap-3 animate-in fade-in">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-700">Đã nhận thanh toán!</p>
                <p className="text-xs text-emerald-600">Trang sẽ tự động cập nhật...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
            <div className={cn(
                "flex items-center justify-between p-3 rounded-lg border text-sm",
                isPolling
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : isTimedOut
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
            )}>
                <div className="flex items-center gap-2">
                    {isPolling ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                            </span>
                            <span className="font-medium text-xs">Đang chờ xác nhận thanh toán</span>
                        </>
                    ) : isTimedOut ? (
                        <>
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-xs">Hết thời gian chờ</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-xs">Đã dừng kiểm tra</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isPolling && (
                        <span className="text-[10px] tabular-nums font-mono opacity-70">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    )}
                    {!isPolling && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleResume}
                            className="h-7 text-xs font-medium"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Chờ tiếp
                        </Button>
                    )}
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Hệ thống tự động kiểm tra mỗi 5 giây. Sau khi chuyển khoản, vui lòng chờ 1-2 phút để hệ thống xác nhận.
            </p>

            <Button
                variant="outline"
                size="sm"
                onClick={handleManualCheck}
                disabled={isChecking}
                className="w-full h-9 text-xs font-medium rounded-lg"
            >
                {isChecking ? (
                    <LoadingSpinner size="sm" className="mr-1.5" />
                ) : (
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                )}
                Kiểm tra ngay
            </Button>
        </div>
    )
}

function ShippingInfoForm({ order, token }: { order: any; token: string }) {
    const existing = order.shipping_info || {}
    // Also check metadata.shipping (from /anhthe order form)
    const metaShipping = order.metadata?.shipping || {}
    const initialData = {
        recipient_name: existing.recipient_name || metaShipping.name || '',
        recipient_phone: existing.recipient_phone || metaShipping.phone || '',
        address: existing.address || metaShipping.address || '',
    }
    const hasExistingInfo = !!(initialData.recipient_name && initialData.address)

    const [form, setForm] = useState(initialData)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isEditing, setIsEditing] = useState(!hasExistingInfo)

    const fillFromCustomer = () => {
        setForm(f => ({
            ...f,
            recipient_name: order.customer_name || f.recipient_name,
            recipient_phone: order.customer_phone || f.recipient_phone,
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/studio/shipping-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, shipping_info: form })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message || 'Đã lưu thông tin nhận hàng')
                setSaved(true)
                setIsEditing(false)
            } else {
                toast.error(data.error || 'Có lỗi xảy ra')
            }
        } catch {
            toast.error('Không thể lưu. Vui lòng thử lại.')
        }
        setIsSaving(false)
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">Thông tin nhận hàng</h3>
                        <p className="text-[11px] font-medium text-muted-foreground">
                            {hasExistingInfo ? 'Thông tin giao hàng của bạn' : 'Điền nếu bạn muốn nhận ảnh in'}
                        </p>
                    </div>
                </div>
                {(saved || (hasExistingInfo && !isEditing)) && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {saved ? 'Đã lưu' : 'Đã có'}
                    </Badge>
                )}
            </div>

            {/* Collapsed view: show existing info */}
            {hasExistingInfo && !isEditing ? (
                <div className="p-5 space-y-3">
                    <div className="bg-zinc-50 rounded-lg p-4 space-y-2 border border-zinc-100">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="font-semibold text-zinc-900">{form.recipient_name}</span>
                            {form.recipient_phone && (
                                <span className="text-zinc-400">· {form.recipient_phone}</span>
                            )}
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <span className="text-zinc-600">{form.address}</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="w-full h-9 text-xs font-medium rounded-lg"
                    >
                        Thay đổi thông tin nhận hàng
                    </Button>
                </div>
            ) : (
                /* Edit form */
                <div className="p-5 space-y-4">
                    <button
                        type="button"
                        onClick={fillFromCustomer}
                        className="w-full text-left px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors text-xs font-medium text-zinc-600 flex items-center gap-2"
                    >
                        <User className="h-3.5 w-3.5" />
                        Cùng thông tin khách hàng ({order.customer_name})
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-600">Tên người nhận</Label>
                            <Input
                                value={form.recipient_name}
                                onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                                placeholder="Nguyễn Văn A"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-600">Số điện thoại</Label>
                            <Input
                                value={form.recipient_phone}
                                onChange={e => setForm(f => ({ ...f, recipient_phone: e.target.value }))}
                                placeholder="09xx xxx xxx"
                                className="h-10 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-600">Địa chỉ giao hàng</Label>
                        <textarea
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            rows={2}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 resize-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        {hasExistingInfo && (
                            <Button
                                variant="outline"
                                onClick={() => { setForm(initialData); setIsEditing(false) }}
                                className="flex-1 h-10 rounded-lg font-semibold text-sm"
                            >
                                Huỷ
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn("h-10 rounded-lg font-semibold text-sm", hasExistingInfo ? "flex-1" : "w-full")}
                        >
                            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                            Lưu thông tin nhận hàng
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function RetailOrderPortalContent({ order, brandConfig, token, bankInfo: propBankInfo }: { order: any, brandConfig: any, token: string, bankInfo?: any }) {
    const bankInfo = propBankInfo || order.metadata?.bank_info || {
        bank_name: brandConfig?.studio_bank_name || brandConfig?.bank_name || 'VietinBank',
        account_no: brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '104002106705',
        account_name: brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'Nghiem Thi Lien'
    }

    const remainingAmount = order.total_amount - (order.paid_amount || 0)
    const transferContent = generatePaymentContent(order.order_number, 'studio')
    const qrUrl = buildVietQrUrl({
        bankName: bankInfo.bank_name,
        accountNo: bankInfo.account_no,
        accountName: bankInfo.account_name,
        amount: remainingAmount,
        addInfo: transferContent
    })
    const payDeeplink = buildVietQrDeeplink({
        bankName: bankInfo.bank_name,
        accountNo: bankInfo.account_no,
        accountName: bankInfo.account_name,
        amount: remainingAmount,
        addInfo: transferContent
    })

    const items = order.items || []
    const isPaid = order.payment_status === 'paid'

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
            {/* ─── Header ─── */}
            <div className="bg-white border-b border-zinc-200 py-4 px-4 lg:pt-10 lg:pb-8 lg:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Mobile: compact horizontal bar */}
                    <div className="flex items-center gap-3 lg:hidden">
                        {brandConfig?.logo_url ? (
                            <img src={brandConfig.logo_url} alt="Logo" className="h-8 w-auto object-contain grayscale shrink-0" />
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {brandConfig?.brand_name || 'Tulie Studio'}
                            </p>
                            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight truncate">{order.order_number}</h1>
                        </div>
                        <StatusBadge status={order.order_status} />
                    </div>

                    {/* Desktop: horizontal bar like /anhthe */}
                    <div className="hidden lg:flex items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            {brandConfig?.logo_url ? (
                                <img src={brandConfig.logo_url} alt="Logo" className="h-14 w-auto object-contain grayscale" />
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <div className="w-px h-10 bg-zinc-200" />
                            <div>
                                <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">{order.order_number}</h1>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                                    {brandConfig?.brand_name || 'Tulie Studio'}
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={order.order_status} />
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
                {/* ─── Desktop: 2-column layout / Mobile: stacked ─── */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ─── LEFT COLUMN: Order Info + Items + Resources ─── */}
                    <div className="flex-1 space-y-6 min-w-0">
                        {/* Order Info */}
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-zinc-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">Thông tin đơn hàng</h3>
                                    <p className="text-[11px] font-medium text-muted-foreground">Chi tiết đơn hàng của bạn</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-zinc-100">
                                <div className="p-5 space-y-1">
                                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                        <User className="h-3 w-3" /> Khách hàng
                                    </p>
                                    <p className="text-sm font-semibold text-zinc-950">{order.customer_name}</p>
                                </div>
                                <div className="p-5 space-y-1">
                                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                        <CalendarDays className="h-3 w-3" /> Ngày đặt đơn
                                    </p>
                                    <p className="text-sm font-semibold text-zinc-950">{order.order_date ? formatDate(order.order_date) : formatDate(order.created_at)}</p>
                                </div>
                            </div>
                            {(order.delivery_date || order.customer_phone) && (
                                <div className="grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100">
                                    {order.delivery_date && (
                                        <div className="p-5 space-y-1">
                                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Truck className="h-3 w-3" /> Ngày bàn giao
                                            </p>
                                            <p className="text-sm font-semibold text-zinc-950">{formatDate(order.delivery_date)}</p>
                                        </div>
                                    )}
                                    {order.customer_phone && (
                                        <div className="p-5 space-y-1">
                                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                <MessageCircle className="h-3 w-3" /> Số điện thoại
                                            </p>
                                            <p className="text-sm font-semibold text-zinc-950">{order.customer_phone}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Items + Payment Summary */}
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-zinc-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">Danh sách sản phẩm / dịch vụ</h3>
                                    <p className="text-[11px] font-medium text-muted-foreground">Các sản phẩm trong đơn hàng</p>
                                </div>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {items.length > 0 ? (
                                    items.map((item: any, i: number) => (
                                        <div key={item.id || i} className="px-5 py-4 flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-zinc-900 truncate">{item.product_name}</p>
                                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                                    {item.quantity} × {formatCurrency(item.unit_price)}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-900 tabular-nums whitespace-nowrap">
                                                {formatCurrency(item.total_price || item.quantity * item.unit_price)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-zinc-900">Dịch vụ Studio</p>
                                            {order.notes && (
                                                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{order.notes}</p>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900 tabular-nums whitespace-nowrap">
                                            {formatCurrency(order.total_amount - (order.shipping_fee || 0))}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {order.shipping_fee > 0 && (
                                <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                    <p className="text-sm text-muted-foreground">Phí vận chuyển</p>
                                    <p className="text-sm font-semibold text-zinc-700 tabular-nums">{formatCurrency(order.shipping_fee)}</p>
                                </div>
                            )}
                            <div className="border-t border-zinc-200 p-5 space-y-3 bg-zinc-50/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Tổng giá trị</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-zinc-950 tracking-tighter tabular-nums">{formatCurrency(order.total_amount).replace(' đ', '')}</span>
                                        <span className="text-sm font-semibold text-muted-foreground">đ</span>
                                    </div>
                                </div>
                                {(order.deposit_amount > 0 || order.paid_amount > 0) && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Đã thanh toán</span>
                                        <span className="text-sm font-semibold text-emerald-600 tabular-nums flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {formatCurrency(order.paid_amount || order.deposit_amount || 0)}
                                        </span>
                                    </div>
                                )}
                                {!isPaid && remainingAmount > 0 && (
                                    <div className="border-t border-dashed border-zinc-200 pt-3 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-zinc-700">Còn lại</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-zinc-950 tabular-nums">{formatCurrency(remainingAmount).replace(' đ', '')}</span>
                                            <span className="text-sm font-semibold text-muted-foreground">đ</span>
                                        </div>
                                    </div>
                                )}
                                {isPaid && (
                                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-sm font-bold">Đã hoàn tất thanh toán</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.resource_link && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">Tài nguyên dự án</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground">Resources</p>
                                    </div>
                                </div>
                                <Button asChild className="w-full h-14 group bg-zinc-950 hover:bg-zinc-800 text-white shadow-lg shadow-black/10 rounded-xl justify-start px-5 border-none transition-all">
                                    <a href={order.resource_link} target="_blank">
                                        <Download className="mr-3 h-5 w-5 opacity-50" />
                                        <div className="text-left flex-1">
                                            <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Bàn giao</p>
                                            <p className="text-[13px] font-bold">Tải ảnh gốc</p>
                                        </div>
                                        <ExternalLink className="ml-auto h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
                                    </a>
                                </Button>
                            </div>
                        )}

                        {/* Tracking Info */}
                        {order.tracking_number && (
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                <div className="p-5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                        <Truck className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Mã vận đơn</p>
                                        {/^https?:\/\//.test(order.tracking_number) ? (
                                            <a href={order.tracking_number} target="_blank" className="text-sm font-bold text-blue-600 hover:underline truncate block">
                                                Tra cứu vận đơn →
                                            </a>
                                        ) : (
                                            <p className="text-sm font-bold text-zinc-900 font-mono tracking-tight">{order.tracking_number}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Info Form */}
                        <ShippingInfoForm order={order} token={token} />


                        {/* Notes */}
                        {order.notes && (
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                                <p className="text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wider">Ghi chú</p>
                                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT COLUMN: Payment / QR (desktop) ─── */}
                    {remainingAmount > 0 && !isPaid && (
                        <div className="lg:w-[380px] shrink-0 space-y-4">
                            <div className="lg:sticky lg:top-8 space-y-4">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
                                        <CreditCard className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">Chuyển khoản thanh toán</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground">Bank Transfer</p>
                                    </div>
                                </div>

                                {/* Payment Watcher */}
                                <PortalPaymentWatcher token={token} remainingAmount={remainingAmount} />

                                {/* QR Code Card */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 flex flex-col items-center">
                                    <div className="p-3 bg-white rounded-xl shadow-md border border-zinc-100 mb-4">
                                        <img
                                            src={qrUrl}
                                            alt="QR thanh toán"
                                            className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-medium">
                                        <QrCode className="h-4 w-4" />
                                        <span>Quét mã QR để thanh toán tự động</span>
                                    </div>
                                </div>

                                {/* Bank Info Card */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[11px] text-muted-foreground font-medium mb-1">Ngân hàng</p>
                                            <p className="text-sm font-bold text-zinc-900">{bankInfo.bank_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] text-muted-foreground font-medium mb-1">Chủ tài khoản</p>
                                            <p className="text-sm font-bold text-zinc-900">{bankInfo.account_name}</p>
                                        </div>
                                    </div>

                                    <CopyableField value={bankInfo.account_no} label="Số tài khoản" />
                                    <CopyableField value={transferContent} label="Nội dung chuyển khoản" dark />

                                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-1">
                                        Hệ thống tự động ghi nhận khi giao dịch thành công.
                                        <br />Vui lòng <span className="font-semibold text-zinc-600">không thay đổi</span> nội dung CK.
                                    </p>
                                </div>

                                {/* Mobile: Share QR + Save QR */}
                                <div className="space-y-2 sm:hidden">
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(qrUrl)
                                                const blob = await res.blob()
                                                const file = new File([blob], `QR_${order.order_number}.png`, { type: 'image/png' })
                                                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                                                    await navigator.share({
                                                        title: `Chuyển khoản ${order.order_number}`,
                                                        text: `Quét mã QR để chuyển khoản ${new Intl.NumberFormat('vi-VN').format(remainingAmount)}đ - ${transferContent}`,
                                                        files: [file],
                                                    })
                                                } else {
                                                    // Fallback: download
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = `QR_${order.order_number}.png`
                                                    a.click()
                                                    URL.revokeObjectURL(url)
                                                    toast.success('Đã tải mã QR')
                                                }
                                            } catch (err: any) {
                                                if (err?.name !== 'AbortError') {
                                                    toast.error('Không thể chia sẻ. Hãy lưu mã QR rồi gửi thủ công.')
                                                }
                                            }
                                        }}
                                        className="w-full h-12 rounded-xl text-sm font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-lg"
                                    >
                                        <Smartphone className="mr-2 h-4 w-4" />
                                        Chia sẻ mã QR qua Zalo
                                    </Button>
                                    <Button asChild variant="outline" className="w-full h-10 rounded-xl border-zinc-200 text-sm font-semibold">
                                        <a href={qrUrl} download={`QR_${order.order_number}.png`}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Lưu mã QR vào máy
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Footer ─── */}
                <div className="text-center space-y-3 pt-4 pb-2">
                    <div className="h-px bg-zinc-200" />
                    <p className="text-xs text-muted-foreground font-medium">
                        Bạn cần hỗ trợ?{' '}
                        <a href="https://zalo.me/0979684731" target="_blank" className="font-bold text-zinc-900 hover:underline transition-colors">
                            Liên hệ Zalo
                        </a>
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">
                        © {new Date().getFullYear()} {brandConfig?.brand_name || 'Tulie Studio'}
                    </p>
                </div>
            </main>
        </div>
    )
}
