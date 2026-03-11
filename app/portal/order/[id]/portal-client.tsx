'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Camera, Download, CreditCard, CheckCircle2, QrCode, Sparkles, ExternalLink, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'pending': { label: 'Chờ xử lý', color: 'bg-zinc-100 text-zinc-600' },
    'shooting': { label: 'Đang chụp', color: 'bg-blue-50 text-blue-700' },
    'editing': { label: 'Đang chỉnh sửa', color: 'bg-purple-50 text-purple-700' },
    'completed': { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700' },
    'cancelled': { label: 'Đã hủy', color: 'bg-red-50 text-red-700' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, color: 'bg-zinc-100 text-muted-foreground border-zinc-200' }
    return <Badge className={cn("text-[10px] font-bold uppercase tracking-widest border-none px-3 py-1.5 rounded-lg", s.color)}>{s.label}</Badge>
}

function CopyButton({ value, label }: { value: string, label: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success(`Đã sao chép ${label}`)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-950 transition-colors"
            onClick={handleCopy}
        >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
    )
}

export default function RetailOrderPortalContent({ order, brandConfig }: { order: any, brandConfig: any }) {
    const bankInfo = order.metadata?.bank_info || {
        bank_name: brandConfig?.studio_bank_name || brandConfig?.bank_name || 'VietinBank',
        account_no: brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '104002106705',
        account_name: brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'Nghiem Thi Lien'
    }

    const remainingAmount = order.total_amount - (order.paid_amount || 0)
    const sepayBankId = (bankInfo.bank_name.toLowerCase().includes('vietin')) ? 'ICB' : 'MB'
    const transferContent = `THANH TOAN ${order.order_number}`
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankInfo.account_no}&bank=${sepayBankId}&amount=${remainingAmount}&des=${transferContent}`

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 font-sans text-zinc-900 selection:bg-zinc-950 selection:text-white pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    {brandConfig?.logo_url ? (
                        <img src={brandConfig.logo_url} alt="Logo" className="h-10 w-auto object-contain grayscale opacity-80" />
                    ) : (
                        <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    )}
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            Customer Portal
                        </p>
                        <h1 className="text-sm font-semibold text-zinc-500 italic">
                            {brandConfig?.brand_name || 'Tulie Studio'}
                        </h1>
                    </div>
                </div>

                {/* Main Order Card */}
                <Card className="rounded-2xl border-none shadow-xl shadow-zinc-200/50 bg-white overflow-hidden ring-1 ring-zinc-200/50">
                    <div className="bg-zinc-950 p-8 text-center space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mã đơn hàng</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tighter">{order.order_number}</h2>
                        <div className="flex justify-center">
                            <StatusBadge status={order.order_status} />
                        </div>
                    </div>

                    <div className="border-b border-zinc-100 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                        <div className="flex-1 p-6 sm:p-8 space-y-6">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khách hàng</p>
                                <p className="text-lg font-semibold text-zinc-950">{order.customer_name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày đặt đơn</p>
                                <p className="text-sm font-medium text-zinc-600">{formatDate(order.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex-1 p-6 sm:p-8 bg-zinc-50/30 flex flex-col justify-center items-center md:items-end text-center md:text-right">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng giá trị</p>
                                <div className="flex items-baseline justify-center md:justify-end gap-1">
                                    <span className="text-4xl font-bold text-zinc-950 tracking-tighter tabular-nums">
                                        {formatCurrency(order.total_amount).replace(' đ', '')}
                                    </span>
                                    <span className="text-sm font-bold text-zinc-400">đ</span>
                                </div>
                                {order.payment_status === 'paid' ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold mt-2">
                                        <CheckCircle2 className="h-3 w-3" /> Đã hoàn tất thanh toán
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-[10px] font-bold mt-2">
                                        Đã nhận: {formatCurrency(order.paid_amount || 0)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resources */}
                    {(order.order_status === 'completed' || order.resource_link || order.demo_link) && (
                        <div className="p-6 sm:p-8 border-b border-zinc-100 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-100 rounded-xl">
                                    <Sparkles className="h-4 w-4 text-zinc-950" />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-950">
                                    Tài nguyên dự án của bạn
                                </h3>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {order.demo_link && (
                                    <Button asChild variant="outline" className="h-16 group hover:bg-zinc-50 border-zinc-200 rounded-xl justify-start px-5">
                                        <a href={order.demo_link} target="_blank">
                                            <div className="text-left py-1">
                                                <p className="text-[9px] font-bold text-zinc-400 mb-0.5 uppercase tracking-wider">Mẫu ảnh xem thử</p>
                                                <p className="text-xs font-bold text-zinc-900 uppercase">Link Google Drive</p>
                                            </div>
                                            <ExternalLink className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                                        </a>
                                    </Button>
                                )}
                                {order.resource_link && (
                                    <Button asChild className="h-16 group bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-950/10 rounded-xl justify-start px-5">
                                        <a href={order.resource_link} target="_blank">
                                            <Download className="mr-3 h-5 w-5 opacity-50" />
                                            <div className="text-left py-1">
                                                <p className="text-[9px] font-bold text-white/50 mb-0.5 uppercase tracking-wider">Sản phẩm hoàn thiện</p>
                                                <p className="text-xs font-bold uppercase">Tải ảnh gốc siêu nét</p>
                                            </div>
                                        </a>
                                    </Button>
                                )}
                            </div>
                            {!order.resource_link && order.demo_link && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
                                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                                        Bạn có thể xem ảnh Demo. Link tải ảnh gốc sẽ hiện ra sau khi bạn hoàn tất thanh toán phần còn lại.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Section */}
                    {remainingAmount > 0 && (
                        <div className="p-6 sm:p-8 bg-zinc-50/50">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-950 rounded-xl">
                                            <CreditCard className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-950">
                                            Thanh toán còn lại
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Số tiền cần thanh toán</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tighter text-zinc-950 tabular-nums">
                                                {formatCurrency(remainingAmount).replace(' đ', '')}
                                            </span>
                                            <span className="text-sm font-bold text-zinc-400">đ</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-sm space-y-6">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Ngân hàng</p>
                                                <p className="text-xs font-bold text-zinc-950">{bankInfo.bank_name}</p>
                                            </div>
                                            <div className="space-y-1.5 text-right">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Chủ tài khoản</p>
                                                <p className="text-xs font-bold text-zinc-950">{bankInfo.account_name}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1.5 p-4 rounded-xl bg-zinc-50 border border-zinc-100 relative group">
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Số tài khoản</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-2xl font-bold font-mono text-zinc-950 tracking-tight">
                                                        {bankInfo.account_no}
                                                    </p>
                                                    <CopyButton value={bankInfo.account_no} label="Số tài khoản" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-between group">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Nội dung chuyển khoản</p>
                                                <p className="text-xs font-bold text-white tracking-wide uppercase">
                                                    {transferContent}
                                                </p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(transferContent)
                                                    toast.success('Đã sao chép nội dung chuyển khoản')
                                                }}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        
                                        <p className="text-[9px] text-zinc-400 font-medium text-center leading-relaxed">
                                            Hệ thống tự động ghi nhận thanh toán ngay khi giao dịch thành công. 
                                            <br />Vui lòng không thay đổi nội dung chuyển khoản.
                                        </p>
                                    </div>
                                </div>

                                <div className="lg:w-48 space-y-4 flex flex-col items-center">
                                    <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm ring-4 ring-zinc-50 flex flex-col items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
                                        <div className="relative group">
                                            <img src={qrUrl} alt="SePay QR" className="w-40 h-40 sm:w-48 sm:h-48 grayscale hover:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <QrCode className="h-8 w-8 text-black" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-medium max-w-[200px]">
                                        Quét mã QR để tự động điền thông tin.
                                    </p>
                                    <Button asChild variant="outline" className="w-full h-11 border-zinc-200 rounded-xl text-[11px] font-bold uppercase tracking-wider lg:hidden shadow-sm">
                                        <a href={qrUrl} download={`QR_${order.order_number}.png`}>
                                            Lưu mã QR vào máy
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-zinc-950 text-center border-t border-white/5">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            © {new Date().getFullYear()} Tulie Studio — Professional Photography
                        </p>
                    </div>
                </Card>

                {/* Footer Help */}
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                        Bạn cần hỗ trợ kỹ thuật? 
                        <a href="https://zalo.me/0963715692" target="_blank" className="font-bold text-zinc-950 hover:underline">Liên hệ Zalo</a>
                    </p>
                    <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-zinc-100 border border-zinc-200">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-5 w-5 rounded-full bg-zinc-300 border border-white ring-1 ring-zinc-200" />
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Hỗ trợ 24/7</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
