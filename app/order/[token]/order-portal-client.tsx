'use client'

import { RetailOrder } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
    CheckCircle2,
    Clock,
    Camera,
    Truck,
    Package,
    CreditCard,
    Calendar,
    User,
    QrCode,
    Share2,
    CheckCircle,
    ExternalLink,
    RefreshCw,
    Link as LinkIcon,
    FileText,
    CircleDot,
    ArrowRight,
    Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getRetailOrderByToken } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { toast } from 'sonner'

interface OrderPortalClientProps {
    order: RetailOrder
}

export default function OrderPortalClient({ order: initialOrder }: OrderPortalClientProps) {
    const [order, setOrder] = useState<RetailOrder>(initialOrder)
    const [brandConfig, setBrandConfig] = useState<any>(null)
    const [isChecking, setIsChecking] = useState(false)

    const isPaid = order.payment_status === 'paid'
    const isPartial = order.payment_status === 'partial'
    const balance = (order.total_amount || 0) - (order.paid_amount || 0)

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getBrandConfig()
            setBrandConfig(config)
        }
        fetchConfig()
    }, [])

    // Polling
    useEffect(() => {
        if (isPaid) return
        const interval = setInterval(async () => {
            setIsChecking(true)
            try {
                const updatedOrder = await getRetailOrderByToken(order.public_token!)
                if (updatedOrder && updatedOrder.paid_amount !== order.paid_amount) {
                    setOrder(updatedOrder)
                    if (updatedOrder.payment_status === 'paid') {
                        toast.success('Thanh toán thành công! Cảm ơn bạn.')
                    }
                }
            } catch (err) { /* silent */ } finally { setIsChecking(false) }
        }, 30000)
        return () => clearInterval(interval)
    }, [order.paid_amount, isPaid, order.public_token])

    const manualCheck = async () => {
        if (isChecking) return
        setIsChecking(true)
        try {
            const updatedOrder = await getRetailOrderByToken(order.public_token!)
            if (updatedOrder) {
                setOrder(updatedOrder)
                if (updatedOrder.paid_amount > order.paid_amount) {
                    toast.success('Đã cập nhận thanh toán mới.')
                } else {
                    toast.info('Chưa ghi nhận giao dịch mới. Vui lòng đợi 1-3 phút.')
                }
            }
        } catch (err) { toast.error('Có lỗi khi kiểm tra thanh toán.') }
        finally { setIsChecking(false) }
    }

    // Studio bank (personal)
    const BANK_ID = brandConfig?.studio_bank_name || brandConfig?.bank_name || 'MB'
    const ACCOUNT_NO = brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '111222333'
    const ACCOUNT_NAME = brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'TULIE'
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${balance}&addInfo=${order.order_number}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    // Timeline steps
    const steps = [
        { label: 'Tiếp nhận', key: 'pending', icon: Package, desc: 'Đơn hàng đã được tạo' },
        { label: 'Đang chụp', key: 'shooting', icon: Camera, desc: 'Studio đang thực hiện' },
        { label: 'Chỉnh sửa', key: 'editing', icon: FileText, desc: 'Hậu kỳ & chỉnh sửa ảnh' },
        { label: 'Hoàn thành', key: 'completed', icon: CheckCircle2, desc: 'Bàn giao cho khách' },
    ]
    const currentStepIndex = steps.findIndex(s => s.key === order.order_status)

    const paymentStatusText = isPaid ? 'Đã thanh toán' : isPartial ? 'Đã cọc một phần' : 'Chưa thanh toán'

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Top Bar */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                            <Camera className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-sm text-zinc-900 tracking-tight">
                            {brandConfig?.brand_name || 'Tulie Studio'}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold border-zinc-200"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            toast.success('Đã sao chép link')
                        }}
                    >
                        <Copy className="h-3 w-3" /> Sao chép link
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Hero */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-0.5 border-none">{order.order_number}</Badge>
                        <Badge variant="outline" className={cn(
                            "text-[10px] font-bold",
                            isPaid ? "border-zinc-900 text-zinc-900" : "border-zinc-300 text-zinc-500"
                        )}>
                            {paymentStatusText}
                        </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
                        Đơn hàng của {order.customer_name}
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Ngày tạo: {formatDate(order.created_at)} — Cảm ơn bạn đã sử dụng dịch vụ.
                    </p>
                </div>

                {/* Timeline */}
                <Card className="border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-zinc-100 px-5">
                        <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <CircleDot className="h-4 w-4" /> Tiến độ đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-6">
                        <div className="relative">
                            {/* Progress line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-200" />
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-zinc-900 transition-all duration-700"
                                style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
                            />

                            <div className="flex justify-between relative">
                                {steps.map((step, idx) => {
                                    const Icon = step.icon
                                    const isActive = idx <= currentStepIndex
                                    const isCurrent = idx === currentStepIndex

                                    return (
                                        <div key={step.key} className="flex flex-col items-center text-center" style={{ width: `${100 / steps.length}%` }}>
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-white",
                                                isActive ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-300"
                                            )}>
                                                {isActive && idx < currentStepIndex ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "mt-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-tight",
                                                isActive ? "text-zinc-900" : "text-zinc-400"
                                            )}>
                                                {step.label}
                                            </span>
                                            <span className="text-[9px] text-zinc-400 mt-0.5 hidden sm:block">
                                                {step.desc}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Drive Link */}
                        {order.resource_link && (
                            <Card className="border-zinc-900 bg-zinc-900 text-white shadow-md">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                            <LinkIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm">File bàn giao (Google Drive)</h3>
                                            <p className="text-[11px] text-zinc-400">Tải ảnh gốc chất lượng cao</p>
                                        </div>
                                    </div>
                                    <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs h-9 px-4">
                                        <a href={order.resource_link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Mở Drive
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Items List */}
                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-zinc-100 px-5">
                                <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Sản phẩm & Dịch vụ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-zinc-100">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm text-zinc-900">{item.product_name}</h4>
                                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                                    <span>SL: {item.quantity}</span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span>{formatCurrency(item.unit_price)} / sp</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-bold text-zinc-900 tabular-nums">{formatCurrency(item.total_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-5 py-4 bg-zinc-50 space-y-2 border-t border-zinc-200">
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>Tạm tính</span>
                                        <span>{formatCurrency((order.total_amount || 0) - (order.shipping_fee || 0))}</span>
                                    </div>
                                    {(order.shipping_fee || 0) > 0 && (
                                        <div className="flex justify-between text-xs text-zinc-500">
                                            <span>Phí vận chuyển</span>
                                            <span>+ {formatCurrency(order.shipping_fee)}</span>
                                        </div>
                                    )}
                                    <Separator className="bg-zinc-200" />
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-sm font-bold text-zinc-900">TỔNG CỘNG</span>
                                        <span className="text-xl font-bold text-zinc-900 tabular-nums">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-zinc-200 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Hẹn trả file</p>
                                        <p className="text-sm font-bold text-zinc-900">
                                            {order.delivery_date ? formatDate(order.delivery_date) : 'Đang cập nhật'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-zinc-200 shadow-sm">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-zinc-400">Người phụ trách</p>
                                        <p className="text-sm font-bold text-zinc-900">
                                            {order.creator?.full_name || 'Tulie Studio'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Demo Link */}
                        {(order as any).demo_link && (
                            <Card className="border-zinc-200 shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                            <ExternalLink className="h-5 w-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400">Link demo / xem trước</p>
                                            <p className="text-sm font-bold text-zinc-900">Xem ảnh demo trước khi nhận file gốc</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                                        <a href={(order as any).demo_link} target="_blank" rel="noopener noreferrer">Xem demo</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tracking / Shipping */}
                        {(order as any).metadata?.tracking_number && (
                            <Card className="border-zinc-200 shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400">Mã vận đơn</p>
                                            <p className="text-sm font-bold text-zinc-900 font-mono">{(order as any).metadata.tracking_number}</p>
                                        </div>
                                    </div>
                                    {(order as any).metadata?.tracking_url && (
                                        <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                                            <a href={(order as any).metadata.tracking_url} target="_blank" rel="noopener noreferrer">Theo dõi</a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {order.notes && (
                            <Card className="border-zinc-200 shadow-sm">
                                <CardContent className="p-4 flex gap-3">
                                    <FileText className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Ghi chú</p>
                                        <p className="text-sm text-zinc-600 leading-relaxed">{order.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* QR Payment */}
                        <Card className="bg-zinc-900 text-white border-none shadow-lg overflow-hidden">
                            <CardHeader className="pb-3 px-5">
                                <CardTitle className="text-xs font-bold text-zinc-400 flex items-center justify-between uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Thanh toán</span>
                                    {isChecking && <RefreshCw className="h-3 w-3 animate-spin" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 space-y-5 text-center">
                                {isPaid ? (
                                    <div className="py-6 space-y-3">
                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle className="h-8 w-8 text-zinc-900" />
                                        </div>
                                        <p className="text-base font-bold text-white">Đã thanh toán 100%</p>
                                        <p className="text-[11px] text-zinc-400">Cảm ơn bạn đã thanh toán.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white p-5 rounded-xl inline-block shadow-md">
                                            <img
                                                src={qrUrl}
                                                alt="Payment QR"
                                                className="w-72 h-72 object-contain"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-zinc-400">Quét mã VietQR để thanh toán</p>
                                            <div className="text-2xl font-bold text-white tabular-nums">{formatCurrency(balance)}</div>
                                            <p className="text-[10px] text-zinc-500 font-mono bg-white/5 py-1.5 px-3 rounded-md inline-block mt-1">
                                                Nội dung: {order.order_number}
                                            </p>
                                        </div>

                                        <div className="text-left space-y-2 text-[11px] bg-white/5 rounded-lg p-3 border border-white/10">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Ngân hàng</span>
                                                <span className="font-bold text-white">{BANK_ID}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Số tài khoản</span>
                                                <span className="font-bold text-white font-mono">{ACCOUNT_NO}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-500">Chủ TK</span>
                                                <span className="font-bold text-white">{ACCOUNT_NAME}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={manualCheck}
                                            disabled={isChecking}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-9 gap-1.5 border border-white/10"
                                        >
                                            {isChecking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                            Kiểm tra thanh toán
                                        </Button>

                                        <p className="text-[9px] text-zinc-600 italic">
                                            Hệ thống tự động xác nhận sau 1-3 phút nhận tiền.
                                        </p>
                                    </>
                                )}

                                <div className="pt-3 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Đã trả:</span>
                                        <span className="font-bold">{formatCurrency(order.paid_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-zinc-400">Còn lại:</span>
                                        <span className="text-white">{formatCurrency(balance)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card className="border-zinc-200 shadow-sm">
                            <CardContent className="p-5 space-y-3 text-center">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Hỗ trợ & Liên hệ</p>
                                <p className="text-lg font-bold text-zinc-900">
                                    {brandConfig?.phone || '0826.98.2222'}
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    Liên hệ hotline nếu bạn cần hỗ trợ về đơn hàng
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <footer className="border-t border-zinc-200 mt-12 bg-white">
                <div className="max-w-5xl mx-auto px-4 py-6 text-center text-[10px] text-zinc-400">
                    <p>&copy; {new Date().getFullYear()} {brandConfig?.brand_name || 'Tulie Studio'}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
