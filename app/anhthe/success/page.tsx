'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ExternalLink, Copy, ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function SuccessContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const orderNumber = searchParams.get('order')
    const [portalReady, setPortalReady] = useState(false)
    const [checking, setChecking] = useState(true)
    const [retryCount, setRetryCount] = useState(0)

    const portalUrl = token ? `/portal/order/${token}` : null
    const fullPortalUrl = typeof window !== 'undefined' && token
        ? `${window.location.origin}/portal/order/${token}` : ''

    // Check if portal page is accessible
    useEffect(() => {
        if (!token) {
            setChecking(false)
            return
        }

        let cancelled = false
        const checkPortal = async () => {
            try {
                const res = await fetch(`/portal/order/${token}`, { method: 'HEAD' })
                if (!cancelled && res.ok) {
                    setPortalReady(true)
                    setChecking(false)
                    return true
                }
            } catch { /* ignore */ }
            return false
        }

        // Try immediately, then retry every 2s up to 5 times
        const tryCheck = async () => {
            const ok = await checkPortal()
            if (!ok && !cancelled && retryCount < 5) {
                setTimeout(() => {
                    if (!cancelled) {
                        setRetryCount(prev => prev + 1)
                    }
                }, 2000)
            } else if (!ok && !cancelled) {
                setChecking(false)
            }
        }

        tryCheck()
        return () => { cancelled = true }
    }, [token, retryCount])

    // Auto-redirect when portal is ready
    useEffect(() => {
        if (portalReady && portalUrl) {
            const timer = setTimeout(() => {
                window.location.href = portalUrl
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [portalReady, portalUrl])

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 max-w-md w-full p-8 text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Đặt đơn thành công! 🎉
                    </h1>
                    {orderNumber && (
                        <p className="text-sm font-mono text-emerald-600 font-semibold bg-emerald-50 rounded-lg py-1.5 px-3 inline-block">
                            {orderNumber}
                        </p>
                    )}
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        Đơn hàng của bạn đã được tạo thành công.<br />
                        Chúng tôi đang chuẩn bị trang theo dõi đơn hàng...
                    </p>
                </div>

                {/* Portal Link Status */}
                {token && (
                    <div className="space-y-3">
                        {checking ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 py-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang tải trang theo dõi đơn hàng...</span>
                            </div>
                        ) : portalReady ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 py-3">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Đang chuyển đến trang đơn hàng...</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href={portalUrl!}
                                    className="flex items-center justify-center gap-2 w-full bg-zinc-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-zinc-800 transition-all shadow-sm"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Xem đơn hàng & Thanh toán
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(fullPortalUrl)
                                        toast.success('Đã copy link theo dõi đơn hàng!')
                                    }}
                                    className="flex items-center justify-center gap-2 w-full border border-zinc-200 text-zinc-600 rounded-xl py-2.5 px-4 text-xs font-medium hover:bg-zinc-50 transition-all"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy link theo dõi đơn hàng
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Contact Info */}
                <div className="pt-4 border-t border-zinc-100">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Nếu cần hỗ trợ, vui lòng liên hệ
                    </p>
                    <a href="tel:0979684731" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 mt-1 hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        0979 684 731
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}
