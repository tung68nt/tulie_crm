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

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = document.querySelector('.mx-auto.bg-white.shadow-xl');
        if (!element) return;

        // Dynamically load html2pdf.js
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
            // @ts-ignore
            if (window.html2pdf) {
                const opt = {
                    margin: 0,
                    filename: `Bao_gia_${quotation.quote_number || 'draft'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                // @ts-ignore
                window.html2pdf().set(opt).from(element).save();
            }
        };
        document.body.appendChild(script);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 py-8 pb-32 font-sans text-slate-800 print:bg-white print:p-0">
            {/* A4 Container */}
            <div className="mx-auto bg-white shadow-xl overflow-hidden relative print:shadow-none print:mx-0 print:w-full" style={{ width: '210mm', minHeight: '297mm' }}>

                <div className="p-10 h-full flex flex-col justify-between">
                    <div>
                        {/* Header Section - Modern & Bilingual */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-start gap-4 w-1/2">
                                {/* Logo Placeholder */}
                                <div className="h-14 w-14 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
                                    <Globe className="h-8 w-8" />
                                </div>
                                <div className="space-y-0.5">
                                    <h1 className="text-base font-bold text-slate-900">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</h1>
                                    <p className="text-xs text-slate-500">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</p>
                                    <p className="text-xs text-slate-500">MST: 0110163102</p>
                                    <div className="flex gap-3 text-xs text-slate-500 pt-1">
                                        <span>Hotline: 098.898.4554</span>
                                        <span>Email: support@tulielab.vn</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">BÁO GIÁ</h2>
                                <p className="text-lg text-slate-400 font-light mb-4">QUOTATION</p>

                                <div className="space-y-1 text-sm text-slate-600">
                                    <p><span className="font-medium text-slate-900">Số / No:</span> {quotation.quote_number}</p>
                                    <p><span className="font-medium text-slate-900">Ngày / Date:</span> {formatDate(quotation.created_at)}</p>
                                    <p><span className="font-medium text-slate-900">Hết hạn / Valid until:</span> {formatDate(quotation.valid_until)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-slate-200 mb-10" />

                        {/* Customer Info */}
                        <div className="mb-12">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">
                                THÔNG TIN KHÁCH HÀNG / CUSTOMER
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 grid gap-3 text-sm">
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Đơn vị / Company:</span>
                                    <span className="font-bold text-slate-900">{quotation.customer.company_name}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Địa chỉ / Address:</span>
                                    <span className="text-slate-900">{quotation.customer.address}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Người liên hệ / Attn:</span>
                                    <span className="font-medium text-slate-900">{quotation.customer.contact_name}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Mã số thuế / Tax ID:</span>
                                    <span className="text-slate-900">{quotation.customer.tax_code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mb-10">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">
                                CHI TIẾT DỊCH VỤ / SERVICE DETAILS
                            </h3>
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700">
                                        <th className="py-3 px-4 font-semibold w-12 border-y border-slate-200">#</th>
                                        <th className="py-3 px-4 font-semibold border-y border-slate-200">Mô tả / Description</th>
                                        <th className="py-3 px-4 font-semibold border-y border-slate-200 text-center w-24">ĐVT / Unit</th>
                                        <th className="py-3 px-4 font-semibold border-y border-slate-200 text-center w-20">SL / Qty</th>
                                        <th className="py-3 px-4 font-semibold border-y border-slate-200 text-right w-32">Đơn giá / Price</th>
                                        <th className="py-3 px-4 font-semibold border-y border-slate-200 text-right w-36">Thành tiền / Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items?.map((item: any, index: number) => (
                                        <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="py-4 px-4 text-slate-500 align-top">{index + 1}</td>
                                            <td className="py-4 px-4 align-top">
                                                <p className="font-semibold text-slate-900">{item.name || "Dịch vụ"}</p>
                                                {item.description && (
                                                    <p className="text-slate-500 text-xs mt-1 leading-relaxed whitespace-pre-line">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center text-slate-600 align-top">{item.unit}</td>
                                            <td className="py-4 px-4 text-center text-slate-600 align-top">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right text-slate-600 align-top">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-4 px-4 text-right font-medium text-slate-900 align-top">{formatCurrency(item.quantity * item.unit_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/2 bg-slate-50 p-6 rounded-lg border border-slate-100">
                                <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                                    <span className="text-slate-600">Tổng cộng / Subtotal:</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                                    <span className="text-slate-600">Thuế VAT (10%):</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(vatAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="font-bold text-lg text-slate-900">TỔNG CỘNG / TOTAL:</span>
                                    <span className="font-bold text-xl text-slate-900">{formatCurrency(finalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms - New Section */}
                        <div className="grid grid-cols-2 gap-8 text-xs text-slate-600 mb-8">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wide">Ghi chú / Notes:</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Báo giá có hiệu lực trong vòng 07 ngày.</li>
                                    <li>Giá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).</li>
                                    <li>Nội dung công việc sẽ được mô tả chi tiết trong hợp đồng.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wide">Điều khoản thanh toán / Payment Terms:</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Lần 1: Thanh toán 50% ngay sau khi ký hợp đồng.</li>
                                    <li>Lần 2: Thanh toán 50% còn lại sau khi nghiệm thu và bàn giao.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Bank & Signature */}
                        <div className="bg-slate-900 text-white p-8 rounded-xl flex justify-between items-center mt-auto">
                            <div>
                                <h4 className="font-bold mb-3 text-sm uppercase opacity-90">Thông tin chuyển khoản / Bank Transfer</h4>
                                <p className="text-sm mb-1"><span className="text-slate-400">Ngân hàng:</span> TECHCOMBANK</p>
                                <p className="text-sm mb-1"><span className="text-slate-400">Số tài khoản:</span> 190368686868</p>
                                <p className="text-sm"><span className="text-slate-400">Chủ tài khoản:</span> CONG TY TNHH TULIE</p>
                            </div>
                            <div className="text-right">
                                <div className="h-16 flex items-end justify-end mb-2">
                                    {/* Placeholder for Signature */}
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">Authorized Signature</p>
                                <p className="text-[10px] opacity-50 mt-1">Tulie Technology Solutions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg z-50 print:hidden">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 hidden sm:block font-medium">
                        Cần hỗ trợ? <span className="text-slate-900 font-bold">098.898.4554</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" className="flex-1 sm:flex-none text-slate-500 hover:text-slate-900">
                            Từ chối
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-slate-300 hover:bg-slate-50 text-slate-700" onClick={handlePrint}>
                            <span className="material-symbols-outlined mr-2" style={{ fontSize: '18px' }}>print</span>
                            In báo giá
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-slate-300 hover:bg-slate-50 text-slate-700" onClick={handleDownloadPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 shadow-md w-full sm:w-auto font-medium px-6" onClick={() => setShowConfirm(true)}>
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
                    /* Hide non-printable elements */
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print-bg-slate-100 {
                        background-color: #f1f5f9 !important;
                    }
                    .print-bg-slate-900 {
                         background-color: #0f172a !important;
                         color: white !important;
                    }
                }
            `}</style>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận chấp nhận báo giá</DialogTitle>
                        <DialogDescription>
                            Vui lòng kiểm tra lại thông tin xác nhận.
                        </DialogDescription>
                    </DialogHeader>
                    {/* ... Inputs ... */}
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
                        <Button onClick={handleConfirm} className="bg-slate-900 text-white hover:bg-slate-800">
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
