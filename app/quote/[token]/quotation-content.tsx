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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 pb-32 font-sans text-slate-900 dark:text-slate-100 print:bg-white print:p-0">
            {/* Main Content Container */}
            <div className="w-full max-w-[210mm] mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200/60 dark:border-slate-700 overflow-hidden relative print:shadow-none print:w-full print:border-none">
                {/* Top Accent Line */}
                <div className="h-1.5 w-full bg-black absolute top-0 left-0"></div>

                <div className="p-8 md:p-12 lg:p-16">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                        <div className="flex flex-col gap-1">
                            {/* Logo Placeholder */}
                            <div className="size-16 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 flex items-center justify-center text-slate-900 dark:text-slate-300">
                                <Globe className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Báo Giá</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Reference: #{quotation.quote_number}</p>
                        </div>
                        <div className="flex flex-col items-start text-left gap-2">
                            <div className="inline-flex items-center px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-600">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Issued Date</span>
                                <span className="ml-3 text-sm font-bold text-slate-900 dark:text-white">{formatDate(quotation.created_at)}</span>
                            </div>
                            <div className="inline-flex items-center px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-600">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Valid Until</span>
                                <span className="ml-3 text-sm font-bold text-slate-900 dark:text-white">{formatDate(quotation.valid_until)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Addresses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-t border-b border-slate-100 dark:border-slate-700 py-8">
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">From</p>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CÔNG TY TNHH TULIE AGENCY</h4>
                            <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-1">
                                <p>Tầng 4, Tòa nhà Bitexco</p>
                                <p>Q.1, TP.HCM</p>
                                <p className="mt-3 text-slate-900 dark:text-slate-200 font-medium flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" /> contact@tulie.agency
                                </p>
                            </div>
                        </div>
                        <div className="md:pl-12 md:border-l md:border-slate-100 dark:md:border-slate-700">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Bill To</p>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{quotation.customer.company_name}</h4>
                            <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-1">
                                <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 opacity-70" /> {quotation.customer.contact_name}</p>
                                <p>{quotation.customer.address}</p>
                                <p className="mt-2 text-slate-500 text-xs">Tax Code: {quotation.customer.tax_code}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mb-12 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-100">
                                    <th className="py-4 pr-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider w-1/2">Description / Hạng mục</th>
                                    <th className="py-4 px-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-right">Quantity</th>
                                    <th className="py-4 px-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-right">Unit Price</th>
                                    <th className="py-4 pl-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600 dark:text-slate-300">
                                {quotation.items?.map((item: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-6 pr-4 align-top">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.name || "Dịch vụ"}</p>
                                            {item.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[480px]">
                                                    {item.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-6 px-4 text-right text-sm font-medium align-top">{item.quantity} {item.unit}</td>
                                        <td className="py-6 px-4 text-right text-sm font-medium align-top">{formatCurrency(item.unit_price)}</td>
                                        <td className="py-6 pl-4 text-right text-sm font-bold text-slate-900 dark:text-white align-top">
                                            {formatCurrency(item.quantity * item.unit_price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-16">
                        <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                                <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Tax / VAT (10%)</span>
                                <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-900 dark:text-white font-bold text-lg">Grand Total</span>
                                <span className="text-slate-900 font-black text-2xl tracking-tight leading-none">{formatCurrency(finalAmount)}</span>
                            </div>
                            <p className="text-xs text-right text-slate-400">Currency: VND</p>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8 border border-slate-100 dark:border-slate-700 mb-8">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                            <Info className="h-4 w-4 text-slate-400" />
                            Lưu ý báo giá (Notes)
                        </h5>
                        <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2.5">
                            <li>Báo giá này có hiệu lực trong vòng 07 ngày kể từ ngày ban hành.</li>
                            <li>Chi phí trên <strong>chưa bao gồm</strong> chi phí mua tên miền (Domain) và thuê máy chủ (Hosting) hoặc các dịch vụ bên thứ 3 khác (nếu không được liệt kê).</li>
                            <li>Khách hàng có trách nhiệm cung cấp đầy đủ nội dung (hình ảnh, bài viết, logo) để phục vụ quá trình thiết kế.</li>
                            <li>Tiến độ thanh toán: 50% sau khi ký hợp đồng và 50% sau khi nghiệm thu bàn giao.</li>
                        </ul>
                    </div>

                    {/* Bank Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8 border border-slate-100 dark:border-slate-700 mb-16">
                        <div className="flex items-center gap-2 mb-5 text-slate-900 dark:text-white">
                            <CreditCard className="h-5 w-5" />
                            <h5 className="text-xs font-bold uppercase tracking-wide">Thông tin tài khoản (Bank Account)</h5>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 border-b border-slate-200 dark:border-slate-700 gap-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ngân hàng / Bank</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">TECHCOMBANK - TCB</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 border-b border-slate-200 dark:border-slate-700 gap-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Số tài khoản / Account No.</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wide">190368686868</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chủ tài khoản / Account Holder</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">Nguyen Van A</span>
                            </div>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="mt-12 flex justify-between items-end">
                        <div className="flex flex-col gap-8 w-64">
                            <div className="border-b border-slate-300 dark:border-slate-600 h-10 w-full"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Authorized Signature</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Generated by Tulie CRM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 print:hidden">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 hidden sm:block">
                        Câu hỏi? Liên hệ <span className="font-bold text-slate-900">support@tulie.agency</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" className="flex-1 sm:flex-none text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-slate-300 shadow-sm text-slate-700 bg-white hover:bg-slate-50">
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-black hover:bg-slate-800 text-white shadow-lg shadow-black/20 w-full sm:w-auto font-semibold px-6" onClick={() => setShowConfirm(true)}>
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
                        <Button onClick={handleConfirm} className="bg-black text-white hover:bg-slate-800">
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
