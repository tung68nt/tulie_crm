'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, MapPin, Phone } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
    quotation: any
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
        if (!confirmer.name || !confirmer.phone) {
            alert("Vui lòng nhập tên và số điện thoại")
            return
        }
        console.log("Confirmed by:", confirmer)
        setShowConfirm(false)
        if (typeof window !== 'undefined') {
            alert("Đã xác nhận thành công (Demo)")
        }
    }

    const totalAmount = quotation.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0
    const vatAmount = totalAmount * 0.1
    const finalAmount = totalAmount + vatAmount

    return (
        <div className="min-h-screen bg-muted/20 pb-32">
            <div className="bg-white border-b">
                <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
                        <span className="text-3xl font-bold text-primary-foreground">T</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Báo giá dịch vụ</h1>
                    <p className="text-muted-foreground mt-2">Cảm ơn quý khách đã quan tâm đến dịch vụ của Tulie Agency</p>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="font-semibold text-lg">{quotation.customer.company_name}</div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>{quotation.customer.address}</div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4 shrink-0" />
                                <div>MST: {quotation.customer.tax_code}</div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4 shrink-0" />
                                <div>Người liên hệ: {quotation.customer.contact_name}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Thông tin báo giá
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Số báo giá:</span>
                                <span className="font-medium">{quotation.quote_number}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Ngày tạo:</span>
                                <span className="font-medium">{formatDate(quotation.created_at)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Hết hạn:</span>
                                <span className="font-medium">{formatDate(quotation.valid_until)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Trạng thái:</span>
                                <span className="font-medium text-blue-600">Mới</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Hạng mục</TableHead>
                                <TableHead className="w-[80px] text-center">ĐVT</TableHead>
                                <TableHead className="w-[80px] text-center">SL</TableHead>
                                <TableHead className="w-[140px] text-right">Đơn giá</TableHead>
                                <TableHead className="w-[140px] text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotation.items?.map((item: any, index: number) => (
                                <TableRow key={index} className="hover:bg-muted/30">
                                    <TableCell className="text-muted-foreground text-center">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.name || "Dịch vụ"}</div>
                                        {item.description && (
                                            <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{item.unit}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="flex justify-end">
                    <Card className="w-full md:w-1/2 lg:w-1/3">
                        <CardContent className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tạm tính:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">VAT (10%):</span>
                                <span>{formatCurrency(vatAmount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-end">
                                <span className="font-semibold">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(finalAmount)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Thông tin chuyển khoản
                        </h3>
                        <div className="space-y-1 pl-6">
                            <p>Ngân hàng: TECHCOMBANK</p>
                            <p>Số TK: 190368686868</p>
                            <p>Chủ TK: NGUYEN VAN A</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Hiệu lực báo giá
                        </h3>
                        <div className="space-y-1 pl-6">
                            <p>Báo giá này có hiệu lực trong vòng 7 ngày kể từ ngày ban hành.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Mọi thắc mắc xin vui lòng liên hệ: <span className="font-medium text-foreground">support@tulie.agency</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10">
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                        </Button>
                        <Button variant="secondary" className="flex-1 sm:flex-none">
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={() => setShowConfirm(true)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Chấp nhận ngay
                        </Button>
                    </div>
                </div>
            </div>

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
                        <Button onClick={handleConfirm}>
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
