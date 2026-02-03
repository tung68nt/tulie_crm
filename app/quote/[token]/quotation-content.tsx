'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, MapPin, Phone, Mail, FileCheck } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-100 py-8 pb-32 print:bg-white print:p-0">
            {/* A4 Container */}
            <div className="mx-auto bg-white shadow-xl min-h-[297mm] w-full max-w-[210mm] p-8 md:p-[15mm] flex flex-col relative print:shadow-none print:w-full">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg shadow-primary/30">
                            T
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">TULIE AGENCY</h1>
                            <p className="text-sm text-muted-foreground font-medium">Creative Digital Solutions</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-gray-900/10 mb-2">BÁO GIÁ</h2>
                        <div className="space-y-1 text-sm bg-gray-50/80 p-3 rounded-lg border border-gray-100/50">
                            <div className="flex justify-between gap-6">
                                <span className="text-muted-foreground font-medium">Số báo giá:</span>
                                <span className="font-bold text-gray-900">{quotation.quote_number}</span>
                            </div>
                            <div className="flex justify-between gap-6">
                                <span className="text-muted-foreground font-medium">Ngày:</span>
                                <span className="font-semibold text-gray-700">{formatDate(quotation.created_at)}</span>
                            </div>
                            <div className="flex justify-between gap-6">
                                <span className="text-muted-foreground font-medium">Hết hạn:</span>
                                <span className="font-semibold text-red-500">{formatDate(quotation.valid_until)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* From Section */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-primary mb-3 uppercase flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Đơn vị cung cấp
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className="font-bold text-base text-gray-900">CÔNG TY TNHH TULIE AGENCY</p>
                            <p className="text-gray-600">Tầng 4, Tòa nhà Bitexco, Q.1, TP.HCM</p>
                            <p className="text-gray-600 flex items-center gap-2"><Mail className="h-3 w-3" /> contact@tulie.agency</p>
                            <p className="text-gray-600 flex items-center gap-2"><Phone className="h-3 w-3" /> (+84) 909 123 456</p>
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="bg-white p-6 rounded-xl border-2 border-primary/5 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Khách hàng
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className="font-bold text-base text-gray-900">{quotation.customer.company_name}</p>
                            <p className="text-gray-600">{quotation.customer.address}</p>
                            <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                                <p className="text-gray-600 flex items-center gap-2">
                                    <User className="h-3 w-3" /> {quotation.customer.contact_name}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <FileCheck className="h-3 w-3" /> MST: {quotation.customer.tax_code}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-900 hover:bg-gray-900">
                                <TableHead className="w-[50px] font-bold text-white rounded-tl-lg rounded-bl-lg">#</TableHead>
                                <TableHead className="font-bold text-white">Hạng mục & Mô tả</TableHead>
                                <TableHead className="w-[80px] text-center font-bold text-white">ĐVT</TableHead>
                                <TableHead className="w-[80px] text-center font-bold text-white">SL</TableHead>
                                <TableHead className="w-[140px] text-right font-bold text-white">Đơn giá</TableHead>
                                <TableHead className="w-[140px] text-right font-bold text-white rounded-tr-lg rounded-br-lg">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotation.items?.map((item: any, index: number) => (
                                <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                                    <TableCell className="text-center font-medium text-gray-500 py-4 align-top">{index + 1}</TableCell>
                                    <TableCell className="py-4 align-top">
                                        <div className="font-bold text-gray-900 mb-1 text-base">{item.name || "Dịch vụ"}</div>
                                        {item.description && (
                                            <div className="text-sm text-gray-500 leading-relaxed max-w-[400px]">
                                                {item.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center py-4 align-top text-gray-600">{item.unit}</TableCell>
                                    <TableCell className="text-center py-4 align-top text-gray-600">{item.quantity}</TableCell>
                                    <TableCell className="text-right py-4 align-top font-medium text-gray-600">{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell className="text-right py-4 align-top font-bold text-gray-900">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Section */}
                <div className="flex justify-end mb-12">
                    <div className="bg-gray-50 p-6 rounded-xl w-[320px] space-y-3 shadow-inner">
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span>Tạm tính</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span>VAT (10%)</span>
                            <span>{formatCurrency(vatAmount)}</span>
                        </div>
                        <Separator className="bg-gray-200" />
                        <div className="flex justify-between items-baseline pt-1">
                            <span className="font-bold text-lg text-gray-900">TỔNG CỘNG</span>
                            <span className="text-2xl font-black text-primary">{formatCurrency(finalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section (Terms & Bank) */}
                <div className="mt-auto grid md:grid-cols-2 gap-8 text-sm">
                    <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100/50">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-primary">
                            <Building2 className="h-4 w-4" />
                            Thông tin thanh toán
                        </h4>
                        <div className="space-y-2 text-gray-700">
                            <p><span className="font-semibold w-24 inline-block">Ngân hàng:</span> TECHCOMBANK</p>
                            <p><span className="font-semibold w-24 inline-block">Số TK:</span> 190368686868</p>
                            <p><span className="font-semibold w-24 inline-block">Chủ TK:</span> NGUYEN VAN A</p>
                            <p><span className="font-semibold w-24 inline-block">Nội dung:</span> <span className="font-mono bg-white px-1 py-0.5 rounded border">{quotation.quote_number}</span></p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                            <Calendar className="h-4 w-4" />
                            Lưu ý
                        </h4>
                        <div className="space-y-2 text-gray-500 text-xs leading-relaxed">
                            <p className="flex gap-2">
                                <span className="font-bold text-gray-900">1.</span>
                                Báo giá này có hiệu lực trong vòng 07 ngày kể từ ngày quy định tại mục "Hết hạn".
                            </p>
                            <p className="flex gap-2">
                                <span className="font-bold text-gray-900">2.</span>
                                Quý khách vui lòng thanh toán 50% giá trị hợp đồng ngay sau khi ký kết.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-40 print:hidden">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500 hidden sm:block">
                        Cần hỗ trợ? Gọi ngay <span className="font-bold text-gray-900">0909 123 456</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" className="flex-1 sm:flex-none text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-gray-300 shadow-sm">
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 w-full sm:w-auto font-semibold px-6" onClick={() => setShowConfirm(true)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Chấp nhận ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
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
