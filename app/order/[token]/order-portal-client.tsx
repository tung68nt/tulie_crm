'use client'

import { RetailOrder } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
    CheckCircle2,
    Clock,
    Camera,
    Sparkles,
    Truck,
    Package,
    CreditCard,
    Calendar,
    User,
    ArrowRight,
    QrCode,
    Download,
    Share2,
    CheckCircle,
    ExternalLink,
    RefreshCw,
    Link as LinkIcon,
    AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

    // Fetch Brand Config (Bank info)
    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getBrandConfig()
            setBrandConfig(config)
        }
        fetchConfig()
    }, [])

    // Real-time Polling for Payment Status
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
            } catch (err) {
                console.error('Error polling order:', err)
            } finally {
                setIsChecking(false)
            }
        }, 30000) // Poll every 30 seconds

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
        } catch (err) {
            toast.error('Có lỗi khi kiểm tra thanh toán.')
        } finally {
            setIsChecking(false)
        }
    }

    const BANK_ID = brandConfig?.bank_name || 'MB'
    const ACCOUNT_NO = brandConfig?.bank_account_no || '111222333'
    const ACCOUNT_NAME = brandConfig?.bank_account_name || 'CONG TY TNHH TULIE'

    // VietQR URL
    const qrDescription = order.order_number
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${balance}&addInfo=${qrDescription}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    const steps = [
        { label: 'Chờ xử lý', key: 'pending', icon: Package },
        { label: 'Đang chụp', key: 'shooting', icon: Camera },
        { label: 'Chỉnh sửa', key: 'editing', icon: Sparkles },
        { label: 'Giao hàng', key: 'completed', icon: Truck },
    ]

    const getCurrentStepIndex = () => {
        return steps.findIndex(s => s.key === order.order_status)
    }

    const currentStepIndex = getCurrentStepIndex()

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                        {brandConfig?.brand_name || 'Tulie Studio'} Portal
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Đơn hàng {order.order_number}</h1>
                        <p className="text-slate-500 font-medium">Cảm ơn {order.customer_name} đã lựa chọn dịch vụ của chúng tôi.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 font-semibold" onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Đã sao chép link portal')
                    }}>
                        <Share2 className="h-4 w-4" /> Chia sẻ
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-12 pb-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 rounded-full" />
                <div
                    className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between relative -mt-5">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index <= currentStepIndex
                        const isCurrent = index === currentStepIndex

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                    isActive ? "bg-primary border-primary text-white scale-110" : "bg-white border-slate-200 text-slate-400"
                                )}>
                                    {isActive && index < currentStepIndex ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className={cn(
                                    "mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors",
                                    isActive ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Drive Link Section if available */}
                    {order.resource_link && (
                        <Card className="border-none shadow-md bg-blue-600 text-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <LinkIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">📁 Link file ảnh gốc (Google Drive)</h3>
                                        <p className="text-white/70 text-sm">Bạn có thể tải ảnh file gốc chất lượng cao tại đây.</p>
                                    </div>
                                </div>
                                <Button asChild className="bg-white text-blue-600 hover:bg-white/90 font-bold rounded-xl h-12 px-6">
                                    <a href={order.resource_link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Truy cập Drive
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Items List */}
                    <Card className="overflow-hidden border-slate-100 shadow-sm rounded-2xl bg-white">
                        <CardHeader className="bg-slate-50/50 py-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-500" />
                                Danh sách sản phẩm & dịch vụ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                <span>Số lượng: {item.quantity}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span>{formatCurrency(item.unit_price)} / sp</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-slate-900">{formatCurrency(item.total_price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-50/50 space-y-3">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency((order.total_amount || 0) - (order.shipping_fee || 0))}</span>
                                </div>
                                {order.shipping_fee > 0 && (
                                    <div className="flex justify-between text-sm font-medium text-slate-600">
                                        <span>Phí vận chuyển</span>
                                        <span>+ {formatCurrency(order.shipping_fee)}</span>
                                    </div>
                                )}
                                <Separator className="bg-slate-200" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-slate-900 uppercase tracking-tight">Tổng cộng</span>
                                    <div className="text-2xl font-black text-primary">{formatCurrency(order.total_amount)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-slate-100 bg-white flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Ngày hẹn bàn giao</p>
                                <p className="text-base font-bold text-slate-900">
                                    {order.delivery_date ? formatDate(order.delivery_date) : 'Đang cập nhật...'}
                                </p>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl border border-slate-100 bg-white flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                                <User className="h-6 w-6 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Người phụ trách</p>
                                <p className="text-base font-bold text-slate-900">Tulie Team</p>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="p-5 rounded-2xl border border-slate-100 bg-amber-50/30 flex gap-4 shadow-sm">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-amber-600">Ghi chú từ Studio</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-normal">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Payment QR Section */}
                    <Card className="overflow-hidden border-none bg-slate-900 text-white shadow-xl rounded-2xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold opacity-80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Thanh toán
                                </div>
                                {isChecking && <RefreshCw className="h-3 w-3 animate-spin text-primary" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-center">
                            {isPaid ? (
                                <div className="py-8 space-y-3">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                                        <CheckCircle className="h-10 w-10 text-white" />
                                    </div>
                                    <p className="text-lg font-bold text-green-400">Đã thanh toán 100%</p>
                                    <p className="text-xs opacity-60">Tulie Studio đã nhận được thanh toán.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-3 rounded-xl shadow-lg inline-block overflow-hidden w-full aspect-square max-w-[200px]">
                                        <img
                                            src={qrUrl}
                                            alt="Payment QR"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">Quét mã VietQR để thanh toán</p>
                                        <div className="text-2xl font-black text-primary">{formatCurrency(balance)}</div>
                                        <p className="text-[10px] text-slate-500 font-mono bg-white/5 py-1 px-2 rounded inline-block">Nội dung: {order.order_number}</p>
                                    </div>

                                    <Button
                                        onClick={manualCheck}
                                        disabled={isChecking}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl h-10 gap-2 border border-white/10"
                                    >
                                        {isChecking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                        Check Realtime
                                    </Button>

                                    <div className="text-[9px] opacity-40 italic leading-tight">
                                        * Hệ thống tự động xác nhận sau 1-3p nhận tiền.
                                    </div>
                                </>
                            )}

                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="opacity-50 font-medium">Đã trả:</span>
                                    <span className="font-bold">{formatCurrency(order.paid_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="opacity-50">Còn lại:</span>
                                    <span className="text-primary">{formatCurrency(balance)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Contact */}
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col gap-4 text-center">
                        <p className="text-xs font-bold text-indigo-900 uppercase">Cần hỗ trợ & Tư vấn?</p>
                        <p className="text-[10px] text-indigo-700 leading-relaxed font-normal">
                            Nếu bạn có thắc mắc về đơn hàng, vui lòng liên hệ hotline: <br />
                            <b className="text-sm">{brandConfig?.phone || '0826.98.2222'}</b>
                        </p>
                        <Button
                            variant="outline"
                            className="h-10 rounded-xl border-indigo-200 text-indigo-700 bg-white font-bold text-xs shadow-sm hover:bg-indigo-50"
                        >
                            Gửi yêu cầu chỉnh sửa
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-12 text-center space-y-2 opacity-30 select-none">
                <p className="text-xs font-bold uppercase tracking-widest">{brandConfig?.brand_name || 'Tulie Studio'} Portal</p>
                <p className="text-[10px]">© 2026 Developed by Antigravity AI Agent</p>
            </div>
        </div>
    )
}
