'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface QuotationContentProps {
    quotation: any // Using any for brevity as we move code
}

export function QuotationContent({ quotation }: QuotationContentProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmer, setConfirmer] = useState({
        name: '',
        email: '',
        phone: '',
        position: ''
    })

    const handleConfirm = () => {
        // Validation logic here
        if (!confirmer.name || !confirmer.phone) {
            alert("Vui lòng nhập tên và số điện thoại")
            return
        }
        console.log("Confirmed by:", confirmer)
        setShowConfirm(false)
        // Ensure this alert runs only in browser
        if (typeof window !== 'undefined') {
            alert("Đã xác nhận thành công (Demo)")
        }
    }

    const totalAmount = quotation.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0
    const vatAmount = totalAmount * 0.1 // 10% VAT
    const finalAmount = totalAmount + vatAmount

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
                        <span className="text-3xl font-bold text-primary-foreground">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">Báo giá dịch vụ</h1>
                    <p className="text-muted-foreground mt-2">Cảm ơn quý khách đã quan tâm đến dịch vụ của Tulie Agency</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg font-semibold mb-1">Thông tin khách hàng</h2>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p className="font-medium text-foreground">{quotation.customer.company_name}</p>
                                            <p>{quotation.customer.address}</p>
                                            <p>MST: {quotation.customer.tax_code}</p>
                                            <p>Người liên hệ: {quotation.customer.contact_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-lg font-semibold mb-1">Thông tin báo giá</h2>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Số: <span className="font-medium text-foreground">{quotation.quote_number}</span></p>
                                            <p>Ngày: {formatDate(quotation.created_at)}</p>
                                            <p>Hết hạn: {formatDate(quotation.valid_until)}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold mb-4">Chi tiết hạng mục</h3>
                                    <div className="space-y-4">
                                        {quotation.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-start py-2 border-b last:border-0 border-border/50">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{item.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.quantity} {item.unit} x {formatCurrency(item.unit_price)}
                                                    </p>
                                                </div>
                                                <p className="font-medium">
                                                    {formatCurrency(item.quantity * item.unit_price)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <div className="w-full max-w-xs space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tạm tính:</span>
                                            <span>{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">VAT (10%):</span>
                                            <span>{formatCurrency(vatAmount)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Tổng cộng:</span>
                                            <span className="text-primary">{formatCurrency(finalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="bg-background rounded-lg p-4 border flex items-start space-x-3">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Thông tin chuyển khoản</p>
                                    <div className="text-xs text-muted-foreground">
                                        <p>Ngân hàng: TECHCOMBANK</p>
                                        <p>Số TK: 190368686868</p>
                                        <p>Chủ TK: NGUYEN VAN A</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border flex items-start space-x-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Hiệu lực báo giá</p>
                                    <p className="text-xs text-muted-foreground">
                                        Báo giá này có hiệu lực trong vòng 7 ngày kể từ ngày ban hành.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold">Thao tác</h3>
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowConfirm(true)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Chấp nhận báo giá
                                </Button>
                                <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Từ chối
                                </Button>
                                <Separator />
                                <Button variant="secondary" className="w-full">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Tải PDF
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="text-center text-xs text-muted-foreground">
                            <p>Mọi thắc mắc xin vui lòng liên hệ:</p>
                            <p className="font-medium mt-1">support@tulie.agency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận chấp nhận báo giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng cung cấp thông tin người xác nhận để chúng tôi tiến hành các bước tiếp theo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={confirmer.name}
                                onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                placeholder="Nhập họ tên của bạn"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Số điện thoại <span className="text-destructive">*</span></Label>
                                <Input
                                    id="phone"
                                    value={confirmer.phone}
                                    onChange={(e) => setConfirmer({ ...confirmer, phone: e.target.value })}
                                    placeholder="VD: 090..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={confirmer.email}
                                    onChange={(e) => setConfirmer({ ...confirmer, email: e.target.value })}
                                    placeholder="email@company.com"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="position">Chức vụ</Label>
                            <Input
                                id="position"
                                value={confirmer.position}
                                onChange={(e) => setConfirmer({ ...confirmer, position: e.target.value })}
                                placeholder="VD: Giám đốc, Trưởng phòng..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Hủy</Button>
                        <Button onClick={handleConfirm}>{/* In real app, call API here */}
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
