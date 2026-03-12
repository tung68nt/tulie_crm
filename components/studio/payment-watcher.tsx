'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import {
    CheckCircle2,
    Clock,
    RefreshCw,
    Loader2,
    Zap,
    Banknote,
    AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentWatcherProps {
    orderId: string
    orderNumber: string
    totalAmount: number
    initialPaidAmount: number
    initialPaymentStatus: string
    /** Polling interval in ms (default: 5000) */
    pollInterval?: number
    /** Max polling duration in ms (default: 15 * 60 * 1000 = 15 minutes) */
    maxDuration?: number
    /** Callback when payment is received */
    onPaymentReceived?: (data: any) => void
}

interface PaymentStatusData {
    payment_status: string
    paid_amount: number
    total_amount: number
    remaining_amount: number
    transactions: {
        id: string
        amount: number
        date: string
        gateway: string
        content: string
        source: string
    }[]
}

export function PaymentWatcher({
    orderId,
    orderNumber,
    totalAmount,
    initialPaidAmount,
    initialPaymentStatus,
    pollInterval = 5000,
    maxDuration = 15 * 60 * 1000,
    onPaymentReceived,
}: PaymentWatcherProps) {
    const [status, setStatus] = useState<PaymentStatusData | null>(null)
    const [isPolling, setIsPolling] = useState(true)
    const [isTimedOut, setIsTimedOut] = useState(false)
    const [isManualChecking, setIsManualChecking] = useState(false)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [lastPaidAmount, setLastPaidAmount] = useState(initialPaidAmount)
    const startTimeRef = useRef(Date.now())
    const pollRef = useRef<NodeJS.Timeout | null>(null)
    const tickRef = useRef<NodeJS.Timeout | null>(null)
    const prevStatusRef = useRef(initialPaymentStatus)

    const maxSeconds = Math.floor(maxDuration / 1000)
    const remainingSeconds = maxSeconds - elapsedSeconds

    // Don't poll if already fully paid
    const isFullyPaid = initialPaymentStatus === 'paid' || status?.payment_status === 'paid'

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/studio/payment-status?order_id=${orderId}`, {
                cache: 'no-store',
            })
            if (!res.ok) return

            const data: PaymentStatusData = await res.json()
            setStatus(data)

            // Detect new payment
            if (data.paid_amount > lastPaidAmount) {
                const newAmount = data.paid_amount - lastPaidAmount
                toast.success(`🎉 Nhận thanh toán +${new Intl.NumberFormat('vi-VN').format(newAmount)}đ`, {
                    description: `Tổng đã thu: ${new Intl.NumberFormat('vi-VN').format(data.paid_amount)}đ`,
                    duration: 8000,
                })
                setLastPaidAmount(data.paid_amount)
                onPaymentReceived?.(data)
            }

            // If fully paid, stop polling
            if (data.payment_status === 'paid' && prevStatusRef.current !== 'paid') {
                toast.success('✅ Đơn hàng đã hoàn tất thanh toán!', { duration: 10000 })
                setIsPolling(false)
            }

            prevStatusRef.current = data.payment_status
        } catch (err) {
            // Silently handle polling errors
            console.error('[PaymentWatcher] Poll error:', err)
        }
    }, [orderId, lastPaidAmount, onPaymentReceived])

    // Start/stop polling
    useEffect(() => {
        if (isFullyPaid || !isPolling) return

        // Initial fetch
        fetchStatus()

        // Start polling
        pollRef.current = setInterval(fetchStatus, pollInterval)

        // Start countdown timer
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
    }, [isPolling, isFullyPaid, fetchStatus, pollInterval, maxSeconds])

    const handleManualCheck = async () => {
        setIsManualChecking(true)
        await fetchStatus()
        setIsManualChecking(false)
    }

    const handleResume = () => {
        startTimeRef.current = Date.now()
        setElapsedSeconds(0)
        setIsTimedOut(false)
        setIsPolling(true)
    }

    const currentPaid = status?.paid_amount ?? initialPaidAmount
    const currentRemaining = totalAmount - currentPaid
    const progressPercent = totalAmount > 0 ? Math.min((currentPaid / totalAmount) * 100, 100) : 0
    const currentStatus = status?.payment_status ?? initialPaymentStatus

    // Format countdown
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60

    return (
        <div className="space-y-4">
            {/* Real-time Status Indicator */}
            {!isFullyPaid && (
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
                                <span className="font-medium text-xs">Đang chờ thanh toán real-time</span>
                            </>
                        ) : isTimedOut ? (
                            <>
                                <AlertCircle className="h-4 w-4" />
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
                                Kiểm tra lại
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Progress */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            Tiến độ thanh toán
                        </p>
                        <p className="text-2xl font-bold tabular-nums tracking-tight">
                            {formatCurrency(currentPaid)}
                            <span className="text-sm font-normal text-muted-foreground"> / {formatCurrency(totalAmount)}</span>
                        </p>
                    </div>
                    <Badge
                        className={cn(
                            "font-bold px-2.5 py-1",
                            currentStatus === 'paid'
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : currentStatus === 'partial'
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )}
                        variant="outline"
                    >
                        {currentStatus === 'paid' ? '✅ Hoàn tất' : currentStatus === 'partial' ? 'Đã thu 1 phần' : 'Chưa thanh toán'}
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            currentStatus === 'paid'
                                ? "bg-emerald-500"
                                : progressPercent > 0
                                    ? "bg-amber-500"
                                    : "bg-zinc-200"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {currentRemaining > 0 && (
                    <p className="text-xs text-muted-foreground font-medium">
                        Còn thiếu: <span className="font-bold text-foreground">{formatCurrency(currentRemaining)}</span>
                    </p>
                )}
            </div>

            {/* Transaction History */}
            {status?.transactions && status.transactions.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Zap className="h-3 w-3" />
                            Lịch sử giao dịch ({status.transactions.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {status.transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-800">
                                                +{formatCurrency(tx.amount)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {tx.gateway || 'Chuyển khoản'} • {tx.date ? new Date(tx.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Manual Check Button */}
            {!isFullyPaid && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualCheck}
                    disabled={isManualChecking}
                    className="w-full h-9 text-xs font-medium"
                >
                    {isManualChecking ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                        <RefreshCw className="h-3 w-3 mr-1.5" />
                    )}
                    Kiểm tra thủ công
                </Button>
            )}

            {/* Fully Paid Celebration */}
            {isFullyPaid && (
                <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700 tracking-tight">CÔNG NỢ ĐÃ HOÀN TẤT</p>
                </div>
            )}
        </div>
    )
}
