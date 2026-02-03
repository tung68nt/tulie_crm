'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer } from 'lucide-react'
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
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col items-start w-[65%]">
                                {/* Logo Section - Height matches Title for alignment */}
                                <div className="h-24 flex items-end mb-4 overflow-visible">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-20 w-auto object-contain" />
                                </div>

                                <div className="space-y-1.5">
                                    <h1 className="text-sm font-bold text-slate-900 uppercase leading-none h-4 flex items-center">
                                        CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE
                                    </h1>

                                    <div className="flex items-start gap-2 text-[13px] text-slate-500 leading-snug">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, <br />Thành phố Hà Nội, Việt Nam</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>098.898.4554</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>support@tulielab.vn</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <FileText className="h-3 w-3 shrink-0" />
                                        <span>0110163102</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                {/* Title Section - Height matches Logo for alignment */}
                                <div className="h-24 flex flex-col justify-end mb-4">
                                    <h2 className="text-5xl font-bold text-slate-900 leading-none tracking-tight">BÁO GIÁ</h2>
                                    <p className="text-2xl text-slate-400 font-light mt-1">QUOTATION</p>
                                </div>

                                <div className="space-y-0.5 text-[13px] text-slate-600">
                                    <p className="flex justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-slate-900">Số<span className="text-[0.8em] italic font-normal opacity-70">/ No</span>:</span>
                                        <span>{quotation.quote_number}</span>
                                    </p>
                                    <p className="flex justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-slate-900">Ngày<span className="text-[0.8em] italic font-normal opacity-70">/ Date</span>:</span>
                                        <span>{formatDate(quotation.created_at)}</span>
                                    </p>
                                    <p className="flex justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-slate-900">Hết hạn<span className="text-[0.8em] italic font-normal opacity-70">/ Valid until</span>:</span>
                                        <span>{formatDate(quotation.valid_until)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-slate-200 mb-6" />

                        {/* Customer Info */}
                        <div className="mb-6">
                            <h3 className="text-[12px] font-bold text-slate-900 mb-2 border-l-4 border-slate-900 pl-3 leading-none h-3 flex items-center">
                                THÔNG TIN KHÁCH HÀNG<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ CUSTOMER</span>
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid gap-1.5 text-[13px]">
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Đơn vị<span className="text-[0.8em] italic font-normal opacity-70">/ Company</span>:</span>
                                    <span className="font-bold text-slate-900">{quotation.customer.company_name}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Địa chỉ<span className="text-[0.8em] italic font-normal opacity-70">/ Address</span>:</span>
                                    <span className="text-slate-900">{quotation.customer.address}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Người liên hệ<span className="text-[0.8em] italic font-normal opacity-70">/ Attn</span>:</span>
                                    <span className="font-medium text-slate-900">{quotation.customer.contact_name}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr]">
                                    <span className="text-slate-500">Mã số thuế<span className="text-[0.8em] italic font-normal opacity-70">/ Tax ID</span>:</span>
                                    <span className="text-slate-900">{quotation.customer.tax_code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mb-6">
                            <h3 className="text-[12px] font-bold text-slate-900 mb-2 border-l-4 border-slate-900 pl-3 leading-none h-3 flex items-center">
                                CHI TIẾT DỊCH VỤ<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ SERVICE DETAILS</span>
                            </h3>
                            <table className="w-full text-left border-collapse text-[13px]">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="py-2 px-4 font-bold w-12 first:rounded-l-lg">#</th>
                                        <th className="py-2 px-4 font-bold">Mô tả/<br /><span className="text-[0.8em] font-normal opacity-60 italic normal-case">Description</span></th>
                                        <th className="py-2 px-4 font-bold text-center w-24">ĐVT/<br /><span className="text-[0.8em] font-normal opacity-60 italic normal-case">Unit</span></th>
                                        <th className="py-2 px-4 font-bold text-center w-20">SL/<br /><span className="text-[0.8em] font-normal opacity-60 italic normal-case">Qty</span></th>
                                        <th className="py-2 px-4 font-bold text-right w-32">Đơn giá/<br /><span className="text-[0.8em] font-normal opacity-60 italic normal-case">Price</span></th>
                                        <th className="py-2 px-4 font-bold text-right w-36 last:rounded-r-lg">Thành tiền/<br /><span className="text-[0.8em] font-normal opacity-60 italic normal-case">Amount</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items?.map((item: any, index: number) => (
                                        <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="py-2.5 px-4 text-slate-500 align-top">{index + 1}</td>
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
                        <div className="flex justify-end mb-8">
                            <div className="w-[60%] bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex justify-between py-1.5 border-b border-slate-200 text-[13px]">
                                    <span className="text-slate-600">Tổng cộng <span className="text-[0.8em] italic font-normal opacity-70">/ Subtotal</span>:</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-slate-200 text-[13px]">
                                    <span className="text-slate-600">Thuế VAT (10%):</span>
                                    <span className="font-medium text-slate-900">{formatCurrency(vatAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-bold text-slate-900">TỔNG CỘNG<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ TOTAL</span>:</span>
                                    <span className="font-bold text-lg text-slate-900 pl-8">{formatCurrency(finalAmount)}</span>
                                </div>
                                <div className="text-right mt-2 text-[11px] italic text-slate-500 border-t border-slate-200 pt-1.5">
                                    Bằng chữ: {readNumberToWords(finalAmount)}./.
                                </div>
                            </div>
                        </div>

                        {/* Footer Section: Notes & Bank Info */}
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            {/* Left Column: Notes & Terms */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4 h-full">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1.5 uppercase text-[11px] tracking-wide">Ghi chú <span className="text-[0.8em] italic font-normal opacity-70">/ Notes</span>:</h4>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-relaxed">
                                        <li>Báo giá có hiệu lực trong vòng 07 ngày.</li>
                                        <li>Giá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).</li>
                                        <li>Nội dung công việc sẽ được mô tả chi tiết trong hợp đồng.</li>
                                    </ul>
                                </div>
                                <div className="border-t border-slate-200 pt-3 mt-auto">
                                    <h4 className="font-bold text-slate-900 mb-1.5 uppercase text-[11px] tracking-wide">Điều khoản thanh toán <span className="text-[0.8em] italic font-normal opacity-70">/ Payment Terms</span>:</h4>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-relaxed">
                                        <li>Lần 1: Thanh toán 50% ngay sau khi ký hợp đồng.</li>
                                        <li>Lần 2: 50% còn lại sau khi nghiệm thu và bàn giao.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Bank Transfer */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
                                <h4 className="font-bold text-slate-900 mb-1.5 uppercase text-[11px] tracking-wide">Thông tin chuyển khoản<span className="text-[0.8em] italic font-normal opacity-70 ml-1 normal-case">/ Bank Transfer</span></h4>
                                <div className="space-y-2 text-xs">
                                    <div className="grid grid-cols-[140px_1fr] items-baseline">
                                        <span className="text-slate-600">Ngân hàng<span className="text-[0.8em] italic opacity-70">/ Bank</span>:</span>
                                        <span className="font-bold text-slate-900">TECHCOMBANK</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] items-baseline">
                                        <span className="text-slate-600">Số TK<span className="text-[0.8em] italic opacity-70">/ Account No</span>:</span>
                                        <span className="font-mono text-sm font-bold text-slate-900 leading-none">190368686868</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] items-baseline">
                                        <span className="text-slate-600">Chủ TK<span className="text-[0.8em] italic opacity-70">/ Account Name</span>:</span>
                                        <span className="uppercase font-bold text-slate-900">CONG TY TNHH TULIE</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] items-baseline">
                                        <span className="text-slate-600">Chi nhánh<span className="text-[0.8em] italic opacity-70">/ Branch</span>:</span>
                                        <span className="font-bold text-slate-900">Thanh Xuân - Hà Nội</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Footer */}
                    <div className="mt-auto pt-6 flex flex-col items-center justify-center opacity-40">
                        <div className="w-full border-t border-slate-200 mb-2"></div>
                        <div className="flex items-center gap-1">
                            <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                            <div className="h-1 w-8 bg-slate-400 rounded-full"></div>
                            <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                        </div>
                    </div>

                    {/* End of Main Content Div */}
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
                            <Printer className="mr-2 h-4 w-4" />
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
