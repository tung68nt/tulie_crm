'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { Loader2, Save, Sparkles, Phone, User, Wallet, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function RetailOrderForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        total_amount: '199000',
        deposit_amount: '100000',
        payment_status: 'pending' as any,
        order_status: 'pending' as any,
        notes: '',
        needs_vat: false,
    })

    const [orderIdPreview, setOrderIdPreview] = useState('DH_YY_MMDD_STT_Value')

    useEffect(() => {
        const date = new Date()
        const yy = date.getFullYear().toString().slice(-2)
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')
        const kValue = Math.floor(parseFloat(formData.total_amount || '0') / 1000)
        setOrderIdPreview(`DH_${yy}_${mm}${dd}_XXX_${kValue}`)
    }, [formData.total_amount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.customer_name) {
            toast.error('Vui lòng nhập tên khách hàng')
            return
        }

        setIsLoading(true)
        try {
            await createRetailOrder({
                ...formData,
                total_amount: parseFloat(formData.total_amount),
                deposit_amount: parseFloat(formData.deposit_amount),
            })
            toast.success('Đã tạo đơn hàng mới thành công')
            router.push('/studio')
            router.refresh()
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo đơn hàng')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Thông tin đơn hàng mới
                            </CardTitle>
                            <CardDescription className="text-xs">Phễu dịch vụ Studio - Chụp ảnh cá nhân.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name" className="flex items-center gap-2 font-semibold text-xs text-muted-foreground">
                                            <User className="h-3 w-3" /> Tên khách hàng *
                                        </Label>
                                        <Input
                                            id="customer_name"
                                            placeholder="VD: Nguyễn Văn A"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            className="h-11 border-muted/50 focus:border-primary/50 text-base font-medium px-4 bg-muted/5"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-4 grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_phone" className="flex items-center gap-2 font-semibold text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" /> Điện thoại
                                            </Label>
                                            <Input
                                                id="customer_phone"
                                                placeholder="09xx..."
                                                value={formData.customer_phone}
                                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                                className="h-11 border-muted/50 focus:border-primary/50 bg-muted/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_email" className="flex items-center gap-2 font-semibold text-xs text-muted-foreground">
                                                Email
                                            </Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                placeholder="customer@email.com"
                                                value={formData.customer_email}
                                                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                                className="h-11 border-muted/50 focus:border-primary/50 bg-muted/5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="font-semibold text-xs text-muted-foreground">Ghi chú yêu cầu (Make-up, trang phục...)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ghi chú thêm về gói chụp, yêu cầu chỉnh sửa đặc biệt..."
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="border-muted/50 focus:border-primary/50 bg-muted/5"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-yellow-50/30 border-yellow-200 rounded-xl">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm font-semibold text-yellow-700">Trạng thái thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(val: any) => setFormData({ ...formData, payment_status: val })}
                                >
                                    <SelectTrigger className="bg-white border-yellow-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">⏳ Chờ thanh toán</SelectItem>
                                        <SelectItem value="partial">🌗 Đã cọc/Một phần</SelectItem>
                                        <SelectItem value="paid">✅ Đã xong 100%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50/30 border-blue-200 rounded-xl">
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm font-semibold text-blue-700">Trạng thái đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <Select
                                    value={formData.order_status}
                                    onValueChange={(val: any) => setFormData({ ...formData, order_status: val })}
                                >
                                    <SelectTrigger className="bg-white border-blue-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">⏳ Chờ xử lý</SelectItem>
                                        <SelectItem value="shooting">📐 Đang chụp</SelectItem>
                                        <SelectItem value="editing">✨ Đang chỉnh sửa</SelectItem>
                                        <SelectItem value="completed">🎉 Hoàn thành</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative shadow-sm rounded-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold opacity-80 flex items-center gap-2">
                                <Wallet className="h-4 w-4" /> Tổng thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold opacity-70">Tổng tiền (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xl font-bold h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold opacity-70">Tiền cọc (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        value={formData.deposit_amount}
                                        onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-semibold opacity-60">ID Dự kiến:</span>
                                    <Badge variant="secondary" className="bg-white/20 text-white text-[10px] font-mono border-none">{orderIdPreview}</Badge>
                                </div>
                                <p className="text-[10px] leading-tight opacity-70 text-center">Mẫu mã sẽ được tối ưu theo công thức: <br /><b>DH_YY_MMDD_STT_Value</b></p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 rounded-xl">
                        <CardHeader className="py-4 px-6 border-b">
                            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                                Xuất hóa đơn VAT
                                <div className={cn(
                                    "w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200",
                                    formData.needs_vat ? "bg-primary" : "bg-muted"
                                )} onClick={() => setFormData({ ...formData, needs_vat: !formData.needs_vat })}>
                                    <div className={cn(
                                        "w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm",
                                        formData.needs_vat ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        {formData.needs_vat && (
                            <CardContent className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] text-muted-foreground leading-tight mb-2">Thông tin xuất hóa đơn sẽ được lưu vào hệ thống kế toán.</p>
                                <Input placeholder="Mã số thuế" className="h-9 text-xs" />
                                <Input placeholder="Địa chỉ xuất hóa đơn" className="h-9 text-xs" />
                            </CardContent>
                        )}
                    </Card>

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-sm hover:scale-[1.02] transition-transform active:scale-95"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                            )}
                            Khởi tạo đơn hàng
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-muted-foreground font-semibold text-xs "
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Hủy bỏ
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
