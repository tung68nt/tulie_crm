'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowRight, ArrowLeft, Camera, Upload, CheckCircle2, QrCode, Image as ImageIcon, CreditCard, Sparkles, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const PACKAGES = [
    { id: 'basic', name: 'Gói cơ bản', price: 99000, sheets: 1, desc: 'Phù hợp cho nhu cầu làm thẻ, hồ sơ cá nhân cơ bản.' },
    { id: 'standard', name: 'Gói tiêu chuẩn', price: 149000, sheets: 2, desc: 'Lựa chọn phổ biến nhất. Đa dạng kích thước ảnh.' },
    { id: 'premium', name: 'Gói nâng cao', price: 249000, sheets: 4, desc: 'In thoải mái với chi phí tối ưu nhất cho nhiều mục đích.' }
]

const SIZES = [
    { id: '3x4', label: 'Cỡ 3x4 (8 ảnh/vỉ)' },
    { id: '4x6', label: 'Cỡ 4x6 (4 ảnh/vỉ)' },
    { id: '3.5x4.5', label: 'Cỡ 3.5x4.5 (6 ảnh/vỉ)' },
    { id: '4x4', label: 'Cỡ 4x4 (4 ảnh/vỉ)' }
]

export function StudioBookingForm() {
    const [step, setStep] = useState(1)
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1])
    const [sheetConfigs, setSheetConfigs] = useState(
        Array(PACKAGES[1].sheets).fill({ size: '3x4' })
    )
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
        address: '',
    })
    const [needShipping, setNeedShipping] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [fileName, setFileName] = useState('')

    const handlePackageSelect = (pkg: typeof PACKAGES[0]) => {
        setSelectedPackage(pkg)
        setSheetConfigs(Array(pkg.sheets).fill({ size: '3x4' }))
    }

    const handleSheetChange = (index: number, size: string) => {
        const newConfigs = [...sheetConfigs]
        newConfigs[index] = { size }
        setSheetConfigs(newConfigs)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true)
            setTimeout(() => {
                setFileName(e.target.files![0].name)
                setIsUploading(false)
            }, 1000)
        }
    }

    // Tính tổng tiền cần thanh toán
    const totalAmount = selectedPackage.price + (needShipping ? 30000 : 0) // Giả sử phí ship 30k

    // Link tạo QR qua SePay nếu cần sau này (demo cứng theo totalAmount)
    const qrUrl = `https://qr.sepay.vn/img?acc=104002106705&bank=ICB&amount=${totalAmount}&des=SEVQR TLS DON ANH THE`

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Camera className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Đặt in ảnh thẻ online</h1>
                <p className="text-muted-foreground font-medium">Nhanh chóng, tiện lợi, nhận ảnh tại nhà.</p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full font-semibold border-2 text-sm transition-colors",
                            step === i ? "border-primary bg-primary text-primary-foreground" :
                                step > i ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground"
                        )}>
                            {step > i ? <CheckCircle2 className="h-4 w-4" /> : i}
                        </div>
                        {i < 4 && (
                            <div className={cn(
                                "w-12 h-0.5 mx-2 transition-colors",
                                step > i ? "bg-primary" : "bg-muted"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
                {/* STEP 1: Chọn gói */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" /> Chọn gói dịch vụ
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm">Vui lòng chọn gói phù hợp với nhu cầu in ấn của bạn.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {PACKAGES.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => handlePackageSelect(pkg)}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50",
                                        selectedPackage.id === pkg.id ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                                    )}
                                >
                                    {selectedPackage.id === pkg.id && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                                    <div className="text-2xl font-bold text-primary mb-2">
                                        {formatCurrency(pkg.price)}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground mb-4">{pkg.desc}</p>
                                    <div className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                                        {pkg.sheets} vỉ ảnh cứng
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep(2)} size="lg" className="font-bold">
                                Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Tùy chỉnh */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" /> Tùy chỉnh & Tải ảnh
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm">Tải ảnh gốc lên và ghi chú các yêu cầu chỉnh sửa cho Studio sửa theo ý bạn.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 border-b pb-8">
                            {/* Upload Area */}
                            <div className="space-y-4">
                                <Label className="font-bold text-base">Tải ảnh gốc</Label>
                                <Label
                                    htmlFor="photo-upload"
                                    className={cn(
                                        "flex flex-col items-center justify-center min-h-[160px] rounded-xl border-2 border-dashed transition-colors cursor-pointer",
                                        fileName ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 hover:bg-muted/10 bg-transparent"
                                    )}
                                >
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    ) : fileName ? (
                                        <div className="text-center">
                                            <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                                            <p className="font-semibold text-primary">{fileName}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Bấm để tải lại ảnh khác</p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="font-semibold">Bấm để tải ảnh lên</p>
                                            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG (Tối đa 20MB)</p>
                                        </div>
                                    )}
                                </Label>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Note Area */}
                            <div className="space-y-4">
                                <Label htmlFor="notes" className="font-bold text-base">Yêu cầu chỉnh sửa (Retouch)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Ví dụ: Làm thon gọn mặt, tẩy mụn trứng cá, làm mượt tóc con..."
                                    className="min-h-[160px] resize-none"
                                    value={customer.notes}
                                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground font-medium">Thợ ảnh sẽ xem và chỉnh sửa đúng như yêu cầu của bạn trước khi in.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Cấu hình in ảnh ({selectedPackage.sheets} vỉ)</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Array.from({ length: selectedPackage.sheets }).map((_, i) => (
                                    <div key={i} className="flex flex-col space-y-2 p-4 rounded-xl border bg-muted/10">
                                        <Label className="font-semibold">Kích cỡ vỉ {i + 1}</Label>
                                        <Select
                                            value={sheetConfigs[i].size}
                                            onValueChange={(val) => handleSheetChange(i, val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SIZES.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)} className="font-bold">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                            </Button>
                            <Button onClick={() => setStep(3)} className="font-bold" disabled={!fileName && !isUploading}>
                                Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Thông tin giao hàng */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Thông tin nhận hàng
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm">Điền thông tin để Studio liên hệ duyệt ảnh và gửi bản cứng (nếu có).</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Họ và tên *</Label>
                                <Input
                                    id="name"
                                    placeholder="Nguyễn Văn A"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="font-semibold">Số điện thoại (Zalo) *</Label>
                                <Input
                                    id="phone"
                                    placeholder="09xx..."
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="email" className="font-semibold">Email nhận bản mềm (Tùy chọn)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={customer.email}
                                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border bg-muted/5 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="need-shipping"
                                    checked={needShipping}
                                    onCheckedChange={(c) => setNeedShipping(c as boolean)}
                                />
                                <Label htmlFor="need-shipping" className="font-semibold cursor-pointer">
                                    Giao ảnh tận nơi (Thêm 30,000 phí Ship)
                                </Label>
                            </div>

                            {needShipping && (
                                <div className="space-y-2 pt-2 animate-in fade-in zoom-in-95 duration-200">
                                    <Label htmlFor="address" className="font-semibold">Địa chỉ giao hàng chi tiết</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố..."
                                        value={customer.address}
                                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)} className="font-bold">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                            </Button>
                            <Button onClick={() => setStep(4)} className="font-bold" disabled={!customer.name || !customer.phone || (needShipping && !customer.address)}>
                                Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Checkout */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Xác nhận & Thanh toán
                            </h2>
                            <p className="text-muted-foreground font-medium text-sm">Kiểm tra thông tin và dùng Ứng dụng Ngân hàng quét mã để thanh toán.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Summary */}
                            <div className="space-y-6 border rounded-xl p-6 bg-muted/5">
                                <h3 className="font-bold border-b pb-2">Hóa đơn Studio</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{selectedPackage.name}</p>
                                            <div className="text-sm font-medium text-muted-foreground mt-1">
                                                {sheetConfigs.map((c, i) => (
                                                    <span key={i} className="inline-block bg-muted px-2 py-0.5 rounded mr-2 mb-1">
                                                        Vỉ {i + 1}: Cỡ {c.size}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="font-bold">{formatCurrency(selectedPackage.price)}</p>
                                    </div>

                                    {needShipping && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-muted-foreground">Phí giao hàng</span>
                                            <span className="font-bold">{formatCurrency(30000)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                                </div>

                                <div className="border-t pt-4 text-sm space-y-2">
                                    <p><span className="font-semibold text-muted-foreground">Khách hàng:</span> {customer.name}</p>
                                    <p><span className="font-semibold text-muted-foreground">Điện thoại:</span> {customer.phone}</p>
                                    {needShipping && (
                                        <p><span className="font-semibold text-muted-foreground">Giao đến:</span> {customer.address}</p>
                                    )}
                                </div>

                                {/* Bank Info */}
                                <div className="border-t pt-4 space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Thông tin chuyển khoản</p>
                                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                                        <span className="text-muted-foreground">Ngân hàng:</span>
                                        <span className="font-bold">Vietinbank</span>
                                        <span className="text-muted-foreground">Số TK:</span>
                                        <span className="font-bold font-mono tracking-wider">104002106705</span>
                                        <span className="text-muted-foreground">Chủ TK:</span>
                                        <span className="font-bold">NGHIEM THI LIEN</span>
                                        <span className="text-muted-foreground">Nội dung:</span>
                                        <span className="font-bold font-mono text-primary">SEVQR TLS DON ANH THE</span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Payment */}
                            <div className="flex flex-col items-center justify-center space-y-4 border rounded-xl p-6 bg-white shrink-0">
                                <div className="p-3 bg-primary/10 rounded-full mb-2">
                                    <QrCode className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-center">Quét mã QR để thanh toán</h3>
                                <p className="text-sm text-center text-muted-foreground font-medium">Tự động điền tiền và nội dung.</p>
                                <img src={qrUrl} alt="Payment QR Code" className="w-56 h-56 rounded-lg border shadow-sm mix-blend-multiply" />
                                <p className="text-xs text-center text-muted-foreground font-medium">
                                    Mở app Ngân hàng → Quét QR → Xác nhận chuyển khoản
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(3)} className="font-bold">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại sửa
                            </Button>
                            <Button size="lg" className="font-bold" onClick={() => window.location.href = '/portal/order/success'}>
                                Tôi đã chuyển khoản <CheckCircle2 className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
