import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Camera, Download, CreditCard, CheckCircle2, QrCode, Sparkles, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function RetailOrderPortalPage({ params }: any) {
    const { id } = await params
    const order = await getRetailOrderById(id)

    if (!order) notFound()

    const brandConfig = await getBrandConfig()
    const bankInfo = order.metadata?.bank_info || {
        bank_name: brandConfig?.studio_bank_name || brandConfig?.bank_name || 'VietinBank',
        account_no: brandConfig?.studio_bank_account_no || brandConfig?.bank_account_no || '104002106705',
        account_name: brandConfig?.studio_bank_account_name || brandConfig?.bank_account_name || 'Nghiem Thi Lien'
    }

    const remainingAmount = order.total_amount - (order.paid_amount || 0)
    // Map common bank names to SePay bank IDs if needed, but for now use VietinBank (ICB) as default
    const sepayBankId = (bankInfo.bank_name.toLowerCase().includes('vietin')) ? 'ICB' : 'MB'
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankInfo.account_no}&bank=${sepayBankId}&amount=${remainingAmount}&des=THANH TOAN ${order.order_number}`

    const STATUS_LABELS: Record<string, string> = {
        pending: 'Chờ xử lý',
        shooting: '📏 Đang chụp',
        editing: '✨ Đang chỉnh sửa',
        completed: '✅ Đã hoàn thành',
        cancelled: '❌ Đã hủy',
    }

    const STATUS_COLORS: Record<string, string> = {
        pending: 'bg-gray-100 text-gray-800',
        shooting: 'bg-blue-100 text-blue-800',
        editing: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 selection:bg-primary/20">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Brand Header */}
                <div className="text-center space-y-4">
                    {brandConfig?.logo_url ? (
                        <div className="flex justify-center animate-in fade-in zoom-in duration-700">
                            <img src={brandConfig.logo_url} alt="Logo" className="h-16 object-contain" />
                        </div>
                    ) : (
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 shadow-xl shadow-zinc-950/20 mb-4 animate-in zoom-in duration-500">
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    )}
                    <div className="space-y-1">
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
                            {brandConfig?.name || 'Tulie Studio'}
                        </h1>
                    </div>
                </div>

                <Card className="border-none shadow-lg shadow-primary/5 overflow-hidden ring-1 ring-primary/5">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="text-center pb-8 border-b bg-muted/20">
                        <CardDescription className="font-medium text-primary text-[10px] mb-2 uppercase tracking-wider">Customer Portal</CardDescription>
                        <CardTitle className="text-3xl font-bold tracking-tight">{order.order_number}</CardTitle>
                        <div className="flex justify-center mt-4">
                            <Badge className={cn("text-[10px] font-semibold px-4 py-1", STATUS_COLORS[order.order_status])}>
                                {STATUS_LABELS[order.order_status]}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Summary Section */}
                        <div className="p-8 grid md:grid-cols-2 gap-8 bg-white dark:bg-card">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</p>
                                    <p className="text-xl font-semibold text-zinc-900">{order.customer_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ngày đặt đơn</p>
                                    <p className="text-sm font-medium text-zinc-600">{formatDate(order.created_at)}</p>
                                </div>
                                {order.notes && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ghi chú gói chụp</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{order.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center md:items-end justify-center">
                                <div className="text-center md:text-right space-y-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng giá trị</p>
                                    <p className="text-4xl font-bold text-primary tracking-tighter">{formatCurrency(order.total_amount)}</p>
                                    {order.payment_status === 'paid' ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-semibold mt-2 border border-emerald-200">
                                            <CheckCircle2 className="h-3 w-3" /> Đã hoàn tất thanh toán
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-semibold mt-2 border border-amber-200">
                                            Đã nhận: {formatCurrency(order.paid_amount || 0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Deliverables Section */}
                        {order.order_status === 'completed' || order.resource_link || order.demo_link ? (
                            <div className="p-8 border-t bg-gradient-to-b from-primary/5 to-transparent">
                                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Tài nguyên dự án của bạn
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {order.demo_link && (
                                        <Button asChild variant="outline" className="h-16 group hover:border-primary/30 transition-all border-dashed rounded-xl">
                                            <a href={order.demo_link} target="_blank">
                                                <div className="text-left flex-1 py-1">
                                                    <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wider">Mẫu ảnh xem thử</p>
                                                    <p className="text-sm font-semibold">Link Google Drive</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </a>
                                        </Button>
                                    )}
                                    {order.resource_link && (
                                        <Button asChild className="h-16 group hover:shadow-xl hover:shadow-primary/20 transition-all rounded-xl">
                                            <a href={order.resource_link} target="_blank">
                                                <Download className="mr-3 h-5 w-5" />
                                                <div className="text-left flex-1 py-1">
                                                    <p className="text-[10px] font-medium opacity-70 mb-0.5 uppercase tracking-wider">Sản phẩm hoàn thiện</p>
                                                    <p className="text-sm font-semibold">Tải ảnh gốc siêu nét</p>
                                                </div>
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                {!order.resource_link && order.demo_link && (
                                    <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 text-center">
                                        <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium">Bạn có thể xem ảnh Demo. Link tải ảnh gốc sẽ hiện ra sau khi bạn hoàn tất thanh toán phần còn lại.</p>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Payment Portal Section */}
                        {remainingAmount > 0 && (
                            <div className="p-8 border-t bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-primary" /> Thanh toán còn lại
                                        </h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">Số tiền cần thanh toán:</p>
                                            <p className="text-3xl font-bold tracking-tighter text-primary">{formatCurrency(remainingAmount)}</p>
                                        </div>
                                        <div className="space-y-4 p-5 rounded-2xl border border-zinc-200 bg-white dark:bg-card shadow-sm ring-1 ring-zinc-50">
                                            <p className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-widest">Thông tin chuyển khoản</p>
                                            <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
                                                <div>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Ngân hàng</p>
                                                    <p className="font-bold text-zinc-900">{bankInfo.bank_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Chủ tài khoản</p>
                                                    <p className="font-bold text-zinc-900">{bankInfo.account_name}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Số tài khoản</p>
                                                    <p className="font-black text-2xl text-zinc-950 tracking-tighter leading-none">{bankInfo.account_no}</p>
                                                </div>
                                                <div className="col-span-2 p-3 bg-zinc-950 rounded-xl text-[10px] flex justify-between items-center shadow-lg shadow-zinc-950/10">
                                                    <span className="text-zinc-500 font-medium">Nội dung: <b className="text-white font-black">{`THANH TOAN ${order.order_number}`}</b></span>
                                                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[8px]">Auto detect</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto p-6 bg-white dark:bg-card rounded-xl shadow-lg border border-zinc-100 flex flex-col items-center gap-3">
                                        <QrCode className="h-5 w-5 text-primary opacity-50" />
                                        <img src={qrUrl} alt="SePay QR" className="w-48 h-48 sm:w-56 sm:h-56" />
                                        <p className="text-[9px] text-muted-foreground text-center w-full max-w-[200px] leading-relaxed">Quét bằng ứng dụng Ngân hàng để tự động điền số tiền & nội dung.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-6 text-center border-t bg-muted/10 text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                        © {new Date().getFullYear()} Tulie Studio. Professional Photography.
                    </div>
                </Card>

                {/* Support Link */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Bạn cần hỗ trợ? <a href="https://zalo.me/0963715692" target="_blank" className="font-semibold text-primary hover:underline">Chat qua Zalo</a></p>
                </div>
            </div>
        </div>
    )
}
