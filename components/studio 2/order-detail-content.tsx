'use client'

import { RetailOrder } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Phone, Mail, FileText, ExternalLink, QrCode, CreditCard, Save, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { updateRetailOrder, recordRetailPayment } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OrderDetailContentProps {
    order: RetailOrder
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
    const [isSavingLinks, setIsSavingLinks] = useState(false)
    const [isRecordingPayment, setIsRecordingPayment] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [links, setLinks] = useState({
        demo_link: order.demo_link || '',
        resource_link: order.resource_link || ''
    })

    const remainingAmount = order.total_amount - (order.paid_amount || 0)

    const handleSaveLinks = async () => {
        setIsSavingLinks(true)
        try {
            await updateRetailOrder(order.id, links)
            toast.success('Đã cập nhật link bàn giao')
        } catch (error) {
            toast.error('Lỗi khi cập nhật link')
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
        } catch (error) {
            toast.error('Lỗi khi ghi nhận thanh toán')
        } finally {
            setIsRecordingPayment(false)
        }
    }

    const qrUrl = `https://qr.sepay.vn/img?acc=104002106705&bank=ICB&amount=${remainingAmount}&des=THANH TOAN ${order.order_number}`

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                {/* Delivery Links Section */}
                <Card className="border-primary/20 shadow-sm border-2">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-sm font-black   flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Bàn giao tài nguyên (Delivery)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold  text-muted-foreground flex items-center gap-2">
                                    Link ảnh demo (Có watermark)
                                    {order.demo_link && (
                                        <a href={order.demo_link} target="_blank" className="text-primary hover:underline flex items-center gap-1 normal-case font-medium">
                                            Mở link <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </Label>
                                <Input
                                    placeholder="Link Google Drive, Dropbox..."
                                    value={links.demo_link}
                                    onChange={(e) => setLinks({ ...links, demo_link: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold  text-muted-foreground flex items-center gap-2">
                                    Link ảnh gốc/sản phẩm (High-res)
                                    {order.resource_link && (
                                        <a href={order.resource_link} target="_blank" className="text-primary hover:underline flex items-center gap-1 normal-case font-medium">
                                            Mở link <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </Label>
                                <Input
                                    placeholder="Link Folder ảnh gốc..."
                                    value={links.resource_link}
                                    onChange={(e) => setLinks({ ...links, resource_link: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSaveLinks} disabled={isSavingLinks} size="sm" className="font-bold  text-xs">
                                    {isSavingLinks ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Lưu link bàn giao
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info & Notes */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold ">Chi tiết khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold ">Điện thoại</p>
                                    <p className="text-sm font-medium">{order.customer_phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold ">Email</p>
                                    <p className="text-sm font-medium">{order.customer_email || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-bold ">Ghi chú nghiệp vụ</p>
                                <div className="text-sm p-3 bg-muted/20 rounded-lg">
                                    {order.notes || "Không có ghi chú nào."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold ">Thông tin VAT</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.needs_vat ? (
                                <div className="space-y-3">
                                    <Badge className="bg-blue-100 text-blue-700">Yêu cầu xuất VAT</Badge>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-xs text-muted-foreground font-bold ">Mã số thuế</p>
                                        <p className="font-medium">{order.vat_info?.tax_code || '---'}</p>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-xs text-muted-foreground font-bold ">Tên đơn vị</p>
                                        <p className="font-medium">{order.vat_info?.company_name || '---'}</p>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-xs text-muted-foreground font-bold ">Địa chỉ</p>
                                        <p className="font-medium text-xs text-muted-foreground">{order.vat_info?.company_address || '---'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground">Khách không yêu cầu VAT.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                {/* Payment Summary */}
                <Card className="bg-primary text-primary-foreground border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    <CardHeader>
                        <CardTitle className="text-xs font-black   opacity-70 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Thanh toán sòng phẳng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold opacity-60">Tổng giá trị</p>
                            <p className="text-3xl font-black italic font-mono">{formatCurrency(order.total_amount)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold opacity-60 ">Đã thu</p>
                                <p className="text-lg font-bold">{formatCurrency(order.paid_amount || 0)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold opacity-60 ">Còn lại</p>
                                <p className="text-lg font-bold text-yellow-400">{formatCurrency(remainingAmount)}</p>
                            </div>
                        </div>

                        {remainingAmount > 0 ? (
                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <div className="bg-white p-3 rounded-lg flex flex-col items-center gap-2">
                                    <p className="text-[10px] text-black font-black  mb-1">Quét QR thanh toán còn lại</p>
                                    <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
                                    <p className="text-[9px] text-muted-foreground text-center leading-tight">Mã QR gen tự động theo số tiền còn lại qua SePay.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 flex items-center justify-center gap-2 text-green-300 font-black  text-xs">
                                <CheckCircle2 className="h-5 w-5" /> Đã thu hồi đủ vốn
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Record Payment */}
                {remainingAmount > 0 && (
                    <Card className="border-dashed border-2">
                        <CardHeader>
                            <CardTitle className="text-xs font-black   text-muted-foreground flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Thu tiền thực tế
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold opacity-70">Số tiền khách vừa chuyển (VNĐ)</Label>
                                <Input
                                    type="number"
                                    placeholder={remainingAmount.toString()}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="h-11 font-black text-lg"
                                />
                            </div>
                            <Button
                                onClick={handleRecordPayment}
                                disabled={isRecordingPayment}
                                className="w-full font-black   shadow-lg shadow-primary/20"
                            >
                                {isRecordingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Ghi nhận và thông báo
                            </Button>
                            <p className="text-[10px] text-muted-foreground text-center leading-tight">Hành động này sẽ bắn ngay một tin nhắn lên Telegram Group Tulie Studio.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
