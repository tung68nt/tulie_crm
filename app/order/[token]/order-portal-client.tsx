'use client'

import { RetailOrder } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
    CheckCircle2,
    Camera,
    Package,
    CreditCard,
    Calendar,
    User,
    RefreshCw,
    ExternalLink,
    FileText,
    CircleDot,
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
                    toast.success('Đã cập nhật thanh toán mới.')
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
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <header className="border-b sticky top-0 z-50 bg-background">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Camera className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight">
                            {brandConfig?.brand_name || 'Tulie Studio'}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            toast.success('Đã sao chép link')
                        }}
                    >
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Sao chép link
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Hero */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">{order.order_number}</Badge>
                        <Badge variant={isPaid ? 'default' : 'outline'}>
                            {paymentStatusText}
                        </Badge>
                    </div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                        Đơn hàng của {order.customer_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ngày tạo: {formatDate(order.created_at)} — Cảm ơn bạn đã sử dụng dịch vụ.
                    </p>
                </div>

                {/* Timeline */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CircleDot className="h-4 w-4" /> Tiến độ đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {/* Progress line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700"
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
                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-background",
                                                isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
                                            )}>
                                                {isActive && idx < currentStepIndex ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "mt-2.5 text-xs font-medium",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {step.label}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
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
                            <Card className="bg-primary text-primary-foreground">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                                            <ExternalLink className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm">File bàn giao (Google Drive)</h3>
                                            <p className="text-xs opacity-70">Tải ảnh gốc chất lượng cao</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="secondary" size="sm">
                                        <a href={order.resource_link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Mở Drive
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Items List */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Sản phẩm & Dịch vụ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm">{item.product_name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span>SL: {item.quantity}</span>
                                                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                                    <span>{formatCurrency(item.unit_price)} / sp</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium tabular-nums">{formatCurrency(item.total_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-5 py-4 bg-muted/30 space-y-2 border-t">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Tạm tính</span>
                                        <span>{formatCurrency((order.total_amount || 0) - (order.shipping_fee || 0))}</span>
                                    </div>
                                    {(order.shipping_fee || 0) > 0 && (
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Phí vận chuyển</span>
                                            <span>+ {formatCurrency(order.shipping_fee)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-sm font-medium">Tổng cộng</span>
                                        <span className="text-lg font-semibold tabular-nums">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Hẹn trả file</p>
                                        <p className="text-sm font-medium">
                                            {order.delivery_date ? formatDate(order.delivery_date) : 'Đang cập nhật'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Người phụ trách</p>
                                        <p className="text-sm font-medium">
                                            {order.creator?.full_name || 'Tulie Studio'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Demo Link */}
                        {(order as any).demo_link && (
                            <Card>
                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Link demo / xem trước</p>
                                            <p className="text-sm font-medium">Xem ảnh demo trước khi nhận file gốc</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={(order as any).demo_link} target="_blank" rel="noopener noreferrer">Xem demo</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {order.notes && (
                            <Card>
                                <CardContent className="p-4 flex gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{order.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* QR Payment */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Thanh toán</span>
                                    {isChecking && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 text-center">
                                {isPaid ? (
                                    <div className="py-6 space-y-3">
                                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                        </div>
                                        <p className="text-base font-semibold">Đã thanh toán 100%</p>
                                        <p className="text-xs text-muted-foreground">Cảm ơn bạn đã thanh toán.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-muted/30 p-4 rounded-xl inline-block border">
                                            <img
                                                src={qrUrl}
                                                alt="Payment QR"
                                                className="w-56 h-56 object-contain"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Quét mã VietQR để thanh toán</p>
                                            <div className="text-2xl font-semibold tabular-nums">{formatCurrency(balance)}</div>
                                            <p className="text-xs text-muted-foreground font-mono bg-muted py-1.5 px-3 rounded-md inline-block mt-1">
                                                Nội dung: {order.order_number}
                                            </p>
                                        </div>

                                        <div className="text-left space-y-2 text-xs bg-muted/30 rounded-lg p-3 border">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Ngân hàng</span>
                                                <span className="font-medium">{BANK_ID}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Số tài khoản</span>
                                                <span className="font-medium font-mono">{ACCOUNT_NO}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Chủ TK</span>
                                                <span className="font-medium">{ACCOUNT_NAME}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={manualCheck}
                                            disabled={isChecking}
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                        >
                                            {isChecking ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                                            Kiểm tra thanh toán
                                        </Button>

                                        <p className="text-[10px] text-muted-foreground">
                                            Hệ thống tự động xác nhận sau 1-3 phút nhận tiền.
                                        </p>
                                    </>
                                )}

                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Đã trả:</span>
                                        <span className="font-medium">{formatCurrency(order.paid_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Còn lại:</span>
                                        <span className="font-semibold">{formatCurrency(balance)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card>
                            <CardContent className="p-5 space-y-2 text-center">
                                <p className="text-xs text-muted-foreground">Hỗ trợ & Liên hệ</p>
                                <p className="text-lg font-semibold">
                                    {brandConfig?.phone || '0826.98.2222'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Liên hệ hotline nếu bạn cần hỗ trợ về đơn hàng
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <footer className="border-t mt-12 bg-background">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {brandConfig?.brand_name || 'Tulie Studio'}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
