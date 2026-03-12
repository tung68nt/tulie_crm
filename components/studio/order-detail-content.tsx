'use client'

import { RetailOrder } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
    Phone,
    Mail,
    FileText,
    ExternalLink,
    CreditCard,
    Save,
    Loader2,
    CheckCircle2,
    Sparkles,
    Download,
    QrCode,
    History
} from 'lucide-react'
import { useState } from 'react'
import { updateRetailOrder, recordRetailPayment } from '@/lib/supabase/services/retail-order-service'
import { getBankAccounts } from '@/lib/supabase/services/settings-service'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { buildVietQrUrl } from '@/lib/utils/vietqr'

interface OrderDetailContentProps {
    order: RetailOrder
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
    const [isSavingLinks, setIsSavingLinks] = useState(false)
    const [isRecordingPayment, setIsRecordingPayment] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [availableBanks, setAvailableBanks] = useState<any[]>([])
    const [links, setLinks] = useState({
        demo_link: order.demo_link || '',
        resource_link: order.resource_link || ''
    })

    useEffect(() => {
        const fetchBanks = async () => {
            const data = await getBankAccounts()
            setAvailableBanks(data)
        }
        fetchBanks()
    }, [])

    const remainingAmount = order.total_amount - (order.paid_amount || 0)

    const bankInfo = (order as any).metadata?.bank_info || (availableBanks.length > 0 ? {
        bank_name: availableBanks[0].bank_name,
        account_no: availableBanks[0].account_no,
        account_name: availableBanks[0].account_name
    } : {
        bank_name: 'MB',
        account_no: '104002106705',
        account_name: 'CONG TY TNHH TULIE'
    })

    const qrUrl = buildVietQrUrl({ bankName: bankInfo.bank_name, accountNo: bankInfo.account_no, accountName: bankInfo.account_name, amount: remainingAmount, addInfo: 'THANH TOAN ' + order.order_number })

    const handleSaveLinks = async () => {
        if (links.demo_link === order.demo_link && links.resource_link === order.resource_link) {
            toast.info('Không có thay đổi nào để lưu')
            return
        }

        setIsSavingLinks(true)
        try {
            await updateRetailOrder(order.id, links)
            toast.success('Đã cập nhật link bàn giao')
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi cập nhật link')
        } finally {
            setIsSavingLinks(false)
        }
    }

    const handleRecordPayment = async () => {
        const amount = parseFloat(paymentAmount)
        if (isNaN(amount) || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ')
            return
        }

        setIsRecordingPayment(true)
        try {
            await recordRetailPayment(order.id, amount)
            toast.success('Đã ghi nhận thanh toán và gửi Telegram')
            setPaymentAmount('')
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi ghi nhận thanh toán')
        } finally {
            setIsRecordingPayment(false)
        }
    }



    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                {/* Delivery Links Section */}
                <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Bàn giao tài nguyên (Delivery)
                                </CardTitle>
                                <CardDescription className="text-xs font-normal">Quản lý các đường dẫn sản phẩm cho khách hàng</CardDescription>
                            </div>
                            <Button
                                onClick={handleSaveLinks}
                                disabled={isSavingLinks}
                                size="sm"
                                className="h-8 rounded-lg font-medium"
                            >
                                {isSavingLinks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-zinc-700">Link ảnh demo (Mẫu)</Label>
                                    {order.demo_link && (
                                        <Badge variant="outline" className="font-normal text-[10px] bg-zinc-50 py-0 h-5">
                                            <a href={order.demo_link} target="_blank" className="flex items-center gap-1 hover:text-primary">
                                                Kiểm tra <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </Badge>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Input
                                        placeholder="Dán link Google Drive, Dropbox hoặc thư mục demo..."
                                        value={links.demo_link}
                                        onChange={(e) => setLinks({ ...links, demo_link: e.target.value })}
                                        className="h-11 border-zinc-200 focus-visible:ring-primary/20 bg-white shadow-none transition-all group-hover:border-zinc-300"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-normal italic">Khách hàng có thể thấy link này ngay cả khi chưa thanh toán hết.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-zinc-700">Link ảnh gốc (Final Resources)</Label>
                                    {order.resource_link && (
                                        <Badge variant="outline" className="font-normal text-[10px] bg-zinc-50 py-0 h-5 border-primary/20 text-primary">
                                            <a href={order.resource_link} target="_blank" className="flex items-center gap-1">
                                                Xem sản phẩm <Download className="h-3 w-3" />
                                            </a>
                                        </Badge>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Input
                                        placeholder="Dán link Folder ảnh gốc dung lượng cao..."
                                        value={links.resource_link}
                                        onChange={(e) => setLinks({ ...links, resource_link: e.target.value })}
                                        className="h-11 border-zinc-200 focus-visible:ring-primary/20 bg-white shadow-none transition-all group-hover:border-zinc-300"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-normal italic">Sẽ chỉ hiển thị trên Portal của khách sau khi họ hoàn tất 100% thanh toán.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Product/Service List */}
                <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 border-b py-4">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-zinc-500" />
                                Chi tiết sản phẩm & dịch vụ
                            </CardTitle>
                            <CardDescription className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider italic">Danh sách các hạng mục khách hàng đã đăng ký</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50/30 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">STT</th>
                                        <th className="px-6 py-3 font-bold">Tên sản phẩm/dịch vụ</th>
                                        <th className="px-6 py-3 font-bold text-center">SL</th>
                                        <th className="px-6 py-3 font-bold text-right">Đơn giá</th>
                                        <th className="px-6 py-3 font-bold text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-zinc-400 text-xs w-12">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-zinc-900 group-hover:text-primary transition-colors">{item.product_name}</div>
                                                    {item.product_id && (
                                                        <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">SKU: {item.product_id.split('-')[0].toUpperCase()}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-zinc-700 tabular-nums">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-medium text-zinc-600 tabular-nums">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-zinc-900 tabular-nums">{formatCurrency(item.total_price)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-zinc-200" />
                                                    </div>
                                                    <p className="text-sm text-zinc-400 font-medium">Chưa có thông tin sản phẩm.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-zinc-50/30 border-t border-zinc-100">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">Tổng cộng</td>
                                        <td className="px-6 py-4 text-right text-base font-bold text-zinc-950 tabular-nums">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Info & Notes */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="rounded-xl border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-sm font-semibold tracking-tight">Chi tiết khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                                    <Phone className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Điện thoại</p>
                                    <p className="text-sm font-semibold text-zinc-900">{order.customer_phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                                    <Mail className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                                    <p className="text-sm font-semibold text-zinc-900 truncate max-w-[180px]">{order.customer_email || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <Separator className="bg-zinc-100" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ghi chú nghiệp vụ</p>
                                <div className="p-3 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        {order.notes || "Không có ghi chú nào từ khách hàng hoặc tư vấn viên."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-sm font-semibold tracking-tight">Thông tin hóa đơn (VAT)</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            {order.needs_vat ? (
                                <div className="space-y-4">
                                    <Badge className="font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3 py-1 text-[10px]">Cần xuất hóa đơn</Badge>
                                    <div className="grid gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mã số thuế</p>
                                            <p className="text-sm font-bold text-zinc-900 bg-zinc-50 p-2 rounded border border-zinc-100">{order.vat_info?.tax_code || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tên đơn vị</p>
                                            <p className="text-sm font-medium text-zinc-900 leading-snug">{order.vat_info?.company_name || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Địa chỉ xuất hóa đơn</p>
                                            <p className="text-xs text-zinc-600 leading-relaxed font-normal">{order.vat_info?.company_address || '---'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
                                        <FileText className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <p className="text-sm text-zinc-400 font-medium">Khách lẻ. Không yêu cầu VAT.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                {/* Payment Card */}
                <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-zinc-50/50 border-b pb-3">
                        <Badge variant="outline" className="w-fit mb-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                            Thanh toán
                        </Badge>
                        <CardTitle className="text-3xl font-bold tracking-tighter tabular-nums">
                            {formatCurrency(remainingAmount)}
                        </CardTitle>
                        <CardDescription className="font-normal">Công nợ còn phải thu</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5 pt-5">
                        <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-muted-foreground">Tổng giá trị đơn</span>
                                <span className="text-foreground">{formatCurrency(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-emerald-600">Đã thu hồi</span>
                                <span className="text-emerald-600">{formatCurrency(order.paid_amount || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Trạng thái</span>
                                {remainingAmount <= 0 ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold px-2 hover:bg-emerald-100">ĐÃ XONG</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 font-bold px-2">CHƯA ĐỦ</Badge>
                                )}
                            </div>
                        </div>

                        {remainingAmount > 0 && (
                            <div className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-muted/20">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-muted-foreground">
                                    <QrCode className="h-4 w-4" />
                                    Mã QR thanh toán nhanh
                                </div>
                                <div className="p-2 bg-white rounded-xl border">
                                    <img src={qrUrl} alt="QR Code" className="w-44 h-auto" />
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center leading-relaxed font-medium">
                                    Gửi mã này cho khách để quét bằng app Ngân hàng.
                                </p>
                            </div>
                        )}

                        {remainingAmount <= 0 && (
                            <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <p className="text-sm font-bold text-emerald-700 tracking-tight">CÔNG NỢ ĐÃ HOÀN TẤT</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Record Payment Section */}
                {remainingAmount > 0 && (
                    <Card className="rounded-xl border-zinc-200 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-zinc-50/30">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <History className="h-4 w-4 text-zinc-400" />
                                Thu tiền thực tế (Manual)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-zinc-600">Số tiền khách vừa chuyển khoản/tiền mặt (VNĐ)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder={remainingAmount.toString()}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="h-12 text-lg font-bold tabular-nums border-zinc-200 focus-visible:ring-emerald-500/20 pl-4"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-300">VNĐ</div>
                                </div>
                            </div>
                            <Button
                                onClick={handleRecordPayment}
                                disabled={isRecordingPayment}
                                className={cn(
                                    "w-full h-11 rounded-lg font-bold transition-all shadow-sm",
                                    "bg-zinc-900 text-white hover:bg-zinc-800"
                                )}
                            >
                                {isRecordingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Ghi nhận & Bắn Telegram
                            </Button>
                            <div className="flex gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                <div className="h-4 w-4 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] text-white">!</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium leading-normal italic">Hệ thống sẽ ngay lập tức gửi một tin nhắn báo biến động số dư lên Telegram Group của team Tulie Studio.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
