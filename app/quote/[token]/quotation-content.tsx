'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 py-8 pb-32 font-sans text-black print:bg-white print:p-0">
            {/* A4 Container - Fixed Width & Ratio */}
            <div className="mx-auto bg-white shadow-2xl overflow-hidden relative print:shadow-none print:mx-0 print:w-full" style={{ width: '210mm', minHeight: '297mm' }}>

                <div className="p-12 h-full flex flex-col justify-between">
                    <div>
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                {/* Logo Placeholder */}
                                <div className="h-16 w-16 bg-black rounded-xl flex items-center justify-center text-white">
                                    <Globe className="h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold uppercase tracking-wider">TULIE AGENCY</h1>
                                    <p className="text-sm text-gray-600">Design & Technology</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-extrabold uppercase tracking-tighter">BÁO GIÁ</h2>
                        </div>

                        {/* Divider Line */}
                        <div className="border-b-2 border-black mb-8"></div>

                        {/* Metadata Block - Black Box */}
                        <div className="flex justify-end mb-12">
                            <div className="bg-black text-white p-4 min-w-[300px]">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium opacity-80">Mã số:</span>
                                    <span className="font-bold">{quotation.quote_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium opacity-80">Ngày:</span>
                                    <span className="font-bold">{formatDate(quotation.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* From / To Section - Two Columns */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="text-sm font-bold uppercase mb-2">FROM:</h3>
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold">CÔNG TY TNHH TULIE AGENCY</p>
                                    <p>Tầng 4, Tòa nhà Bitexco, Q.1, TP.HCM</p>
                                    <p><span className="font-semibold">Phone:</span> (+84) 909 123 456</p>
                                    <p><span className="font-semibold">Email:</span> contact@tulie.agency</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase mb-2">TO:</h3>
                                <div className="text-sm leading-relaxed">
                                    <p className="font-bold">{quotation.customer.company_name}</p>
                                    <p>{quotation.customer.address}</p>
                                    <p><span className="font-semibold">Attn:</span> {quotation.customer.contact_name}</p>
                                    <p><span className="font-semibold">MST:</span> {quotation.customer.tax_code}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table Header Description */}
                        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">Chi tiết dịch vụ / Services Description:</h3>

                        {/* Table - High Contrast */}
                        <div className="mb-8">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="py-3 px-4 font-bold text-center border border-black w-12">No</th>
                                        <th className="py-3 px-4 font-bold border border-black">Mô tả dịch vụ</th>
                                        <th className="py-3 px-4 font-bold text-center border border-black w-24">SL</th>
                                        <th className="py-3 px-4 font-bold text-center border border-black w-24">ĐVT</th>
                                        <th className="py-3 px-4 font-bold text-right border border-black w-32">Đơn giá</th>
                                        <th className="py-3 px-4 font-bold text-right border border-black w-32">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items?.map((item: any, index: number) => (
                                        <tr key={index} className="border border-gra-300">
                                            <td className="py-3 px-4 text-center border border-gray-300">{index + 1}</td>
                                            <td className="py-3 px-4 border border-gray-300 font-medium">
                                                {item.name || "Dịch vụ"}
                                                {item.description && <p className="text-xs text-gray-500 font-normal mt-1">{item.description}</p>}
                                            </td>
                                            <td className="py-3 px-4 text-center border border-gray-300">{item.quantity}</td>
                                            <td className="py-3 px-4 text-center border border-gray-300">{item.unit}</td>
                                            <td className="py-3 px-4 text-right border border-gray-300">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-3 px-4 text-right border border-gray-300 font-bold">{formatCurrency(item.quantity * item.unit_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end mb-16">
                            <div className="w-1/2">
                                <div className="flex justify-between py-2 border-b border-gray-300">
                                    <span className="font-bold text-sm">Tạm tính:</span>
                                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-300">
                                    <span className="font-bold text-sm">VAT (10%):</span>
                                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                </div>
                                <div className="flex justify-between py-2 mt-2">
                                    <span className="font-bold text-lg">TỔNG CỘNG:</span>
                                    <span className="font-bold text-lg">{formatCurrency(finalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Footer Divider */}
                        <div className="border-b border-black mb-8"></div>

                        {/* Bottom Section - Payment & Contact - Flex Row */}
                        <div className="flex justify-between items-end gap-8">
                            {/* Payment Method - Black Box */}
                            <div className="bg-black text-white p-6 w-1/2">
                                <h4 className="font-bold mb-2">HÌNH THỨC THANH TOÁN:</h4>
                                <p className="text-sm mb-1"><span className="opacity-80">Ngân hàng:</span> TECHCOMBANK</p>
                                <p className="text-sm mb-1"><span className="opacity-80">Số tài khoản:</span> 190368686868</p>
                                <p className="text-sm"><span className="opacity-80">Chủ tài khoản:</span> NGUYEN VAN A</p>
                            </div>

                            {/* Contact Info */}
                            <div className="text-right text-sm space-y-2">
                                <div className="flex items-center justify-end gap-2">
                                    <Phone className="h-4 w-4" /> (+84) 909 123 456
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Globe className="h-4 w-4" /> www.tulie.agency
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-300 inline-block w-48 text-center text-xs text-gray-500 uppercase tracking-widest">
                                    Authorized Signature
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-lg z-50 print:hidden">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500 hidden sm:block font-medium">
                        Cần hỗ trợ? <span className="text-black font-bold">0909 123 456</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" className="flex-1 sm:flex-none text-gray-500 hover:text-black">
                            Từ chối
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-100 text-black" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-black text-white hover:bg-gray-800 shadow-md w-full sm:w-auto font-bold px-6" onClick={() => setShowConfirm(true)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Chấp nhận ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                         -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: white !important;
                    }
                    /* Ensure background colors (black boxes) print correctly */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Confirmation Dialog - Keeping existing logic */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận chấp nhận báo giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng kiểm tra lại thông tin xác nhận.
                        </DialogDescription>
                    </DialogHeader>
                    {/* ... (Same as before) ... */}
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={confirmer.name}
                                onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                placeholder="Nhập họ tên của bạn"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Hủy</Button>
                        <Button onClick={handleConfirm} className="bg-black text-white hover:bg-gray-800">
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
