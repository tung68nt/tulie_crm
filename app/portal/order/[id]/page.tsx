import { getRetailOrderById } from '@/lib/supabase/services/retail-order-service'
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

    const remainingAmount = order.total_amount - (order.paid_amount || 0)
    const qrUrl = `https://qr.sepay.vn/img?acc=104002106705&bank=ICB&amount=${remainingAmount}&des=THANH TOAN ${order.order_number}`

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
                <div className="text-center space-y-2">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20 mb-4 animate-in zoom-in duration-500">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </div>

                <Card className="border-none shadow-2xl shadow-primary/5 overflow-hidden ring-1 ring-primary/5">
                    <div className="h-2 bg-primary" />
                    <CardHeader className="text-center pb-8 border-b bg-muted/20">
                        <CardDescription className="font-semibold text-primary/60 text-[10px] mb-2">Customer Portal</CardDescription>
                        <CardTitle className="text-3xl font-bold font-mono">{order.order_number}</CardTitle>
                        <div className="flex justify-center mt-4">
                            <Badge className={cn("text-xs font-black px-4 py-1  ", STATUS_COLORS[order.order_status])}>
                                {STATUS_LABELS[order.order_status]}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Summary Section */}
                        <div className="p-8 grid md:grid-cols-2 gap-8 bg-white dark:bg-card">
                            <div className="space-y-6 text-center md:text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black  text-muted-foreground ">Khách hàng</p>
                                    <p className="text-xl font-bold">{order.customer_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black  text-muted-foreground ">Ngày đặt đơn</p>
                                    <p className="text-sm font-bold text-muted-foreground">{formatDate(order.created_at)}</p>
                                </div>
                                {order.notes && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black  text-muted-foreground ">Ghi chú gói chụp</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{order.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center md:items-end justify-center">
                                <div className="text-center md:text-right space-y-1">
                                    <p className="text-[10px] font-black  text-muted-foreground ">Tổng giá trị</p>
                                    <p className="text-4xl font-black italic text-primary font-mono">{formatCurrency(order.total_amount)}</p>
                                    {order.payment_status === 'paid' ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black   mt-2">
                                            <CheckCircle2 className="h-3 w-3" /> Đã hoàn tất thanh toán
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black   mt-2">
                                            Đã nhận: {formatCurrency(order.paid_amount || 0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Deliverables Section */}
                        {order.order_status === 'completed' || order.resource_link || order.demo_link ? (
                            <div className="p-8 border-t bg-gradient-to-b from-primary/5 to-transparent">
                                <h3 className="text-sm font-black   mb-6 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Tài nguyên dự án của bạn
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {order.demo_link && (
                                        <Button asChild variant="outline" className="h-16 group hover:border-primary/50 transition-all border-dashed border-2">
                                            <a href={order.demo_link} target="_blank">
                                                <div className="text-left flex-1 py-1">
                                                    <p className="text-[10px] font-black  text-muted-foreground mb-0.5">Mẫu ảnh xem thử</p>
                                                    <p className="text-sm font-bold">Link Google Drive</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </a>
                                        </Button>
                                    )}
                                    {order.resource_link && (
                                        <Button asChild className="h-16 group hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                                            <a href={order.resource_link} target="_blank">
                                                <Download className="mr-3 h-5 w-5 animate-bounce" />
                                                <div className="text-left flex-1 py-1">
                                                    <p className="text-[10px] font-black  opacity-60 mb-0.5">Sản phẩm hoàn thiện</p>
                                                    <p className="text-sm font-bold">Tải ảnh gốc siêu nét</p>
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
                                        <h3 className="text-sm font-black   flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-primary" /> Thanh toán còn lại
                                        </h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">Số tiền cần thanh toán:</p>
                                            <p className="text-3xl font-black italic font-mono text-primary">{formatCurrency(remainingAmount)}</p>
                                        </div>
                                        <div className="space-y-4 p-4 rounded-xl border border-primary/20 bg-white dark:bg-card">
                                            <p className="text-[10px] font-black  text-muted-foreground  text-center">Thông tin chuyển khoản</p>
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <p className="text-muted-foreground">Ngân hàng</p>
                                                    <p className="font-bold">VietinBank</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Chủ tài khoản</p>
                                                    <p className="font-bold">Nghiem Thi Lien</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-muted-foreground">Số tài khoản</p>
                                                    <p className="font-bold text-base ">104002106705</p>
                                                </div>
                                                <div className="col-span-2 p-2 bg-muted rounded font-mono text-[10px] flex justify-between items-center">
                                                    <span>Nội dung: <b>SEVQR</b></span>
                                                    <span className="text-primary font-bold">Quét mã để tự điền</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-auto p-4 bg-white dark:bg-card rounded-2xl shadow-xl border flex flex-col items-center gap-3">
                                        <QrCode className="h-5 w-5 text-primary" />
                                        <img src={qrUrl} alt="SePay QR" className="w-48 h-48 sm:w-56 sm:h-56" />
                                        <p className="text-[9px] text-muted-foreground text-center w-full max-w-[200px]">Quét bằng ứng dụng Ngân hàng để tự động điền số tiền & nội dung.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-6 text-center border-t bg-muted/10 opacity-60 text-[9px] font-bold  ">
                        © {new Date().getFullYear()} Tulie Studio. Professional Photography.
                    </div>
                </Card>

                {/* Support Link */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Bạn cần hỗ trợ? <a href="https://zalo.me/0963715692" target="_blank" className="font-bold text-primary hover:underline">Chat qua Zalo</a></p>
                </div>
            </div>
        </div>
    )
}
