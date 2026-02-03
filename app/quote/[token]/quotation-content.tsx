'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, Box } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

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
        <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-8 pb-32 font-sans text-gray-900 dark:text-gray-100">
            {/* Main Content Container - Modern Web Style */}
            <div className="container max-w-5xl mx-auto px-4 sm:px-6">

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    {/* Header - Condensed & Clean */}
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">BÁO GIÁ</h1>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <span>#{quotation.quote_number}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{formatDate(quotation.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm font-normal py-1 px-3 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200">
                                    Hết hạn: <span className="font-semibold ml-1 text-gray-900 dark:text-white">{formatDate(quotation.valid_until)}</span>
                                </Badge>
                                <Badge className="text-sm font-medium py-1 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                    Đang chờ duyệt
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* From/To Grid - Optimized for Readability */}
                    <div className="grid md:grid-cols-2">
                        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Nhà cung cấp</h3>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                    <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">CÔNG TY TNHH TULIE AGENCY</h4>
                                    <div className="mt-1 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                                        <p>Tầng 4, Tòa nhà Bitexco, Q.1, TP.HCM</p>
                                        <p>contact@tulie.agency</p>
                                        <p>(+84) 909 123 456</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Khách hàng</h3>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{quotation.customer.company_name}</h4>
                                    <div className="mt-1 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                                        <p>{quotation.customer.contact_name}</p>
                                        <p>{quotation.customer.address}</p>
                                        <p className="text-xs text-gray-400 mt-1">MST: {quotation.customer.tax_code}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table - Clean & Modern */}
                    <div className="border-t border-gray-100 dark:border-zinc-800">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 dark:bg-zinc-800/50">
                                    <tr className="border-b border-gray-100 dark:border-zinc-800">
                                        <th className="py-3 px-6 md:px-8 font-semibold text-gray-500 dark:text-gray-400 w-1/2">Hạng mục</th>
                                        <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 text-center">ĐVT</th>
                                        <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 text-center">SL</th>
                                        <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 text-right">Đơn giá</th>
                                        <th className="py-3 px-6 md:px-8 font-semibold text-gray-500 dark:text-gray-400 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                    {quotation.items?.map((item: any, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-4 px-6 md:px-8 align-top">
                                                <div className="font-medium text-gray-900 dark:text-white mb-0.5">{item.name || "Dịch vụ"}</div>
                                                {item.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-lg">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{item.unit}</td>
                                            <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400 font-medium">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-4 px-6 md:px-8 text-right font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(item.quantity * item.unit_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary & Footer - Layout Grid */}
                    <div className="grid md:grid-cols-12 gap-8 p-6 md:p-8 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50">
                        {/* Left Column: Terms & Bank */}
                        <div className="md:col-span-7 space-y-6">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-gray-100 dark:border-zinc-700 shadow-sm">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-gray-400" />
                                    Thông tin thanh toán
                                </h5>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="text-gray-500">Ngân hàng</div>
                                    <div className="font-medium text-gray-900 dark:text-white">TECHCOMBANK</div>
                                    <div className="text-gray-500">Số tài khoản</div>
                                    <div className="font-mono font-medium text-gray-900 dark:text-white">190368686868</div>
                                    <div className="text-gray-500">Chủ tài khoản</div>
                                    <div className="font-medium text-gray-900 dark:text-white">NGUYEN VAN A</div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-1 pl-1">
                                <p>• Báo giá có hiệu lực 07 ngày.</p>
                                <p>• Chưa bao gồm chi phí tên miền/hosting bên thứ 3.</p>
                            </div>
                        </div>

                        {/* Right Column: Totals */}
                        <div className="md:col-span-5 flex flex-col justify-center">
                            <div className="space-y-3 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>VAT (10%)</span>
                                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-black dark:text-white tracking-tight">{formatCurrency(finalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Footer - Only visible in Print/PDF */}
                <div className="hidden print:flex justify-between items-end mt-12 px-8">
                    <div className="flex flex-col gap-8 w-64">
                        <div className="border-b border-black h-1"></div>
                        <p className="text-xs font-bold uppercase">Authorized Signature</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                        Generated by Tulie CRM
                    </div>
                </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-zinc-800 p-4 shadow-lg z-50 print:hidden">
                <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block font-medium">
                        Bạn cần hỗ trợ? <span className="text-gray-900 dark:text-white">0909 123 456</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" className="flex-1 sm:flex-none text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            Từ chối
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700">
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </Button>
                        <Button className="flex-1 sm:flex-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-md w-full sm:w-auto font-semibold px-6" onClick={() => setShowConfirm(true)}>
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
                            Vui lòng kiểm tra lại thông tin liên hệ của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={confirmer.name}
                                onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                placeholder="Nhập họ tên của bạn"
                                className="border-gray-300 dark:border-zinc-700"
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
                                    className="border-gray-300 dark:border-zinc-700"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={confirmer.email}
                                    onChange={(e) => setConfirmer({ ...confirmer, email: e.target.value })}
                                    placeholder="email@company.com"
                                    className="border-gray-300 dark:border-zinc-700"
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
