'use client'

import React from 'react'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { MapPin, Phone, Mail, Globe, Info, Calendar, User, Building2, CreditCard, ChevronRight, FileText, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface QuotationModernPaperProps {
    quotation: any
    brandConfig?: any
}

/**
 * Modern B&W Quotation Paper with Bilingual Support
 * Designed for 1:1 LiveView and PDF/Print fidelity.
 */
export function QuotationModernPaper({ quotation, brandConfig }: QuotationModernPaperProps) {
    if (!quotation) return null

    const items = quotation.items || []

    // Group items by section
    const sections: Record<string, any[]> = items.reduce((acc: any, item: any) => {
        const sectionName = item.section_name || '';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionEntries = Object.entries(sections).sort((a, b) => {
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return (a[1][0].sort_order || 0) - (b[1][0].sort_order || 0);
    });

    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
    const totalDiscount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price * (item.discount || 0) / 100), 0);
    const subtotal = subtotalRaw - totalDiscount;
    const vatAmount = subtotal * (quotation.vat_rate || 0) / 100;
    const finalAmount = subtotal + vatAmount;

    // Proposal sections from database or dynamic calculation
    let proposalContent = quotation.proposal_content || {}
    if (typeof proposalContent === 'string') {
        try {
            proposalContent = JSON.parse(proposalContent)
        } catch (e) {
            proposalContent = {}
        }
    }
    const hasProposal = proposalContent && Object.values(proposalContent).some(v => v && String(v).trim().length > 0)

    const bankInfo = {
        company: {
            name: brandConfig?.bank_account_name || 'CÔNG TY TNHH TULIE',
            no: brandConfig?.bank_account_no || '0110163102',
            bank: brandConfig?.bank_name || 'MB BANK',
            branch: brandConfig?.bank_branch || 'SỞ GIAO DỊCH'
        },
        personal: {
            name: brandConfig?.studio_bank_account_name || 'NGUYỄN ĐỨC TÙNG',
            no: brandConfig?.studio_bank_account_no || '0988984554',
            bank: brandConfig?.studio_bank_name || 'TECHCOMBANK'
        }
    }

    return (
        <div
            className="flex flex-col bg-white text-black font-sans min-h-[297mm] w-full max-w-[210mm] mx-auto overflow-hidden print:m-0 print:p-0"
            style={{
                '--font-kaine': "'Kaine', 'Inter', sans-serif"
            } as any}
        >
            {/* 1. BRANDING HEADER */}
            <div className="p-12 pb-8 border-b-2 border-black flex justify-between items-start bg-black text-white print:bg-black print:text-white">
                <div className="flex flex-col gap-4">
                    <img
                        src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                        alt="Logo"
                        className="h-12 w-auto object-contain invert brightness-0 grayscale brightness-200"
                    />
                    <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest opacity-80">
                        <p>Tulie Agency — Solution & Services</p>
                        <p>www.tulie.vn | 098.898.4554</p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <h1 className="text-5xl font-black uppercase leading-none tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>
                        Báo giá
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-tight -mt-1 opacity-70">
                        Quotation
                    </p>
                    <div className="mt-8 space-y-1 text-[11px] font-bold text-right border-r-4 border-white/20 pr-4">
                        <p className="opacity-60 uppercase">Reference No.</p>
                        <p className="text-lg">#{quotation.quotation_number}</p>
                    </div>
                </div>
            </div>

            <div className="p-12 pt-10 flex-1 flex flex-col gap-14">
                {/* 2. CLIENT & QUOTE INFO AREA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                        <div className="space-y-2 pb-4 border-b border-zinc-100">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                Kính gửi / <span className="text-black">Attention To</span>
                            </p>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
                                {quotation.customer?.company_name || quotation.customer?.name}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 text-[11px] font-semibold text-zinc-600">
                            <div className="flex items-start gap-4">
                                <User className="h-4 w-4 shrink-0 mt-0.5 text-black" />
                                <div>
                                    <p className="uppercase text-[9px] text-zinc-400">Người liên hệ / Contact personnel</p>
                                    <p className="text-black">{quotation.customer?.name || quotation.customer?.representative || 'Vui lòng cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-black" />
                                <div>
                                    <p className="uppercase text-[9px] text-zinc-400">Email address</p>
                                    <p className="text-black">{quotation.customer?.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-black" />
                                <div>
                                    <p className="uppercase text-[9px] text-zinc-400">Phone number</p>
                                    <p className="text-black">{quotation.customer?.phone || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col justify-between border border-zinc-100">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ban hành / Issue Date</p>
                                    <p className="text-sm font-black text-black">{formatDate(quotation.created_at)}</p>
                                </div>
                                <Calendar className="h-5 w-5 text-zinc-300" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hết hạn / Valid Until</p>
                                    <p className="text-sm font-black text-black">{formatDate(quotation.valid_until)}</p>
                                </div>
                                <Clock className="h-5 w-5 text-zinc-300" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duyệt bởi / Created By</p>
                                    <p className="text-sm font-black text-black">Nguyễn Đức Tùng</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">NT</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. PROPOSAL CONTENT (MODERN MAGAZINE STYLE) */}
                {hasProposal && (
                    <div className="space-y-12">
                        <div className="flex items-baseline gap-4 border-b-4 border-black pb-4">
                            <h3 className="text-3xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-kaine)' }}>
                                Kế hoạch & Giải pháp
                            </h3>
                            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Solution Proposal</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                            {proposalContent.introduction && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        01. Mục tiêu chiến lược / <span className="text-zinc-400 text-xs">Strategic Goals</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.introduction}
                                    </div>
                                </div>
                            )}
                            {proposalContent.scope_of_work && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        02. Phạm vi công việc / <span className="text-zinc-400 text-xs">Scope of Work</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.scope_of_work}
                                    </div>
                                </div>
                            )}
                            {proposalContent.methodology && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        03. Phương pháp tiếp cận / <span className="text-zinc-400 text-xs">Methodology</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.methodology}
                                    </div>
                                </div>
                            )}
                            {proposalContent.deliverables && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        04. Sản phẩm bàn giao / <span className="text-zinc-400 text-xs">Deliverables</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.deliverables}
                                    </div>
                                </div>
                            )}
                            {proposalContent.team && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        05. Đội ngũ thực hiện / <span className="text-zinc-400 text-xs">Project Team</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.team}
                                    </div>
                                </div>
                            )}
                            {proposalContent.timeline && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        06. Lộ trình triển khai / <span className="text-zinc-400 text-xs">Implementation</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.timeline}
                                    </div>
                                </div>
                            )}
                            {proposalContent.warranty && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        07. Chính sách bảo hành / <span className="text-zinc-400 text-xs">Warranty & Support</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.warranty}
                                    </div>
                                </div>
                            )}
                            {proposalContent.why_us && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                                        <div className="w-2 h-6 bg-black" />
                                        08. Vì sao chọn chúng tôi? / <span className="text-zinc-400 text-xs">Why Us?</span>
                                    </h4>
                                    <div className="text-[12px] leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium pl-4">
                                        {proposalContent.why_us}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. PRICING TABLE */}
                <div className="overflow-hidden border-2 border-black rounded-3xl">
                    <div className="bg-black p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-white text-xl font-black uppercase tracking-tight">Chi tiết hạng mục</h4>
                                <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px] font-bold uppercase tracking-widest px-2 h-5">Quotation items</Badge>
                            </div>
                            <p className="text-zinc-400 text-[11px] font-medium">Chi tiết các hạng mục và chi phí dịch vụ</p>
                        </div>
                        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </div>
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-black/5 text-black border-b border-black/10 uppercase font-black tracking-tight print:bg-transparent">
                                <th className="py-4 px-6 w-12 text-center">#</th>
                                <th className="py-4 px-6">Hạng mục & Mô tả / <span className="opacity-40">Items</span></th>
                                <th className="py-4 px-6 w-20 text-center uppercase tracking-wider">ĐVT / <span className="opacity-40 text-[9px]">Unit</span></th>
                                <th className="py-4 px-6 w-16 text-center">SL / <span className="opacity-40 text-[9px]">Qty</span></th>
                                <th className="py-4 px-6 w-32 text-right">Đơn giá / <span className="opacity-40 text-[9px]">Price</span></th>
                                <th className="py-4 px-6 w-36 text-right">Thành tiền / <span className="opacity-40 text-[9px]">Amount</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-200">
                            {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                                <React.Fragment key={sectionName || sIdx}>
                                    {sectionName && (
                                        <tr className="bg-zinc-50 border-y-2 border-black">
                                            <td colSpan={6} className="py-2.5 px-4 font-black text-[10px] text-black uppercase tracking-[0.3em] bg-zinc-200 print:bg-zinc-200">
                                                Section {sIdx + 1}: {sectionName}
                                            </td>
                                        </tr>
                                    )}
                                    {sectionItems.map((item: any, iIdx: number) => (
                                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                                            <td className="py-4 px-4 text-center font-black text-zinc-300 group-hover:text-black">{iIdx + 1}</td>
                                            <td className="py-5 px-6">
                                                <p className="font-black text-black text-[13px] uppercase tracking-tight mb-1">{item.product_name || item.name}</p>
                                                {item.description && (
                                                    <p className="text-zinc-500 text-[10px] leading-relaxed italic pr-10">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center text-zinc-400 font-bold">{item.unit || '-'}</td>
                                            <td className="py-4 px-4 text-center font-black text-black">{item.quantity}</td>
                                            <td className="py-4 px-4 text-right font-bold text-zinc-500 tabular-nums">
                                                {formatCurrency(item.unit_price).replace('₫', '')}
                                            </td>
                                            <td className="py-4 px-4 text-right font-black text-black text-[12px] tabular-nums">
                                                {formatCurrency(item.quantity * item.unit_price).replace('₫', '')}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 5. TOTALS AREA */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                    <div className="flex-1 w-full space-y-6">
                        <div className="bg-zinc-50 p-10 rounded-[32px] border border-zinc-100 flex flex-col justify-center min-h-[160px]">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                                Tổng cộng bằng chữ / <span className="text-black">Amount in words</span>
                            </p>
                            <p className="text-base text-black font-black leading-tight italic first-letter:uppercase">
                                {readNumberToWords(finalAmount)} đồng chẵn./.
                            </p>
                        </div>
                        {/* Notes */}
                        {quotation.notes && (
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] border-l-4 border-black pl-3 flex justify-between">
                                    Ghi chú thêm / <span className="text-zinc-400">Additional Notes</span>
                                </h5>
                                <div className="text-[10px] leading-relaxed text-zinc-600 font-medium italic whitespace-pre-wrap pl-4 max-w-lg">
                                    {quotation.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-[420px] bg-black text-white p-12 rounded-[48px] shadow-2xl space-y-6 relative overflow-hidden print:bg-black">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-400/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm font-bold opacity-50">
                                <span>Tạm tính / Subtotal</span>
                                <span className="tabular-nums">{formatCurrency(subtotalRaw).replace('₫', '')}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-bold text-zinc-300">
                                    <span>Chiết khấu / Discount</span>
                                    <span className="tabular-nums">-{formatCurrency(totalDiscount).replace('₫', '')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm font-bold opacity-50">
                                <span>Thuế VAT / Tax ({quotation.vat_rate || 0}%)</span>
                                <span className="tabular-nums">{formatCurrency(vatAmount).replace('₫', '')}</span>
                            </div>
                        </div>

                        <div className="pt-8 mt-4 border-t border-white/10 relative z-10">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Tổng thanh toán / Total Payment</p>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-5xl font-black tabular-nums tracking-tighter" style={{ fontFamily: 'var(--font-kaine)' }}>
                                            {formatCurrency(finalAmount).replace('₫', '')}
                                        </p>
                                        <span className="text-sm font-black opacity-30">VNĐ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. BANKING INFO (Company Only) */}
                <div className="mt-10 max-w-md">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                                Thông tin thanh toán / <span className="text-black">Payment Details</span>
                            </h5>
                            <div className="grid grid-cols-1 gap-3 text-[11px] font-medium p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100/50">
                                    <span className="text-zinc-400 uppercase text-[9px]">Ngân hàng / Bank</span>
                                    <span className="text-black font-bold">{bankInfo.company.bank}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100/50">
                                    <span className="text-zinc-400 uppercase text-[9px]">Số tài khoản / Account No.</span>
                                    <span className="text-black font-black text-sm tracking-widest">{bankInfo.company.no}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-400 uppercase text-[9px]">Chủ tài khoản / Account Name</span>
                                    <span className="text-black font-bold uppercase">{bankInfo.company.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6.5 SIGNATURE SECTION */}
                <div className="mt-16 grid grid-cols-2 gap-20 text-center">
                    <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-950">Đại diện khách hàng</p>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-tight font-bold italic">(Ký & ghi rõ họ tên / Customer Signature)</p>
                        <div className="h-28" />
                        <div className="h-px w-40 bg-zinc-200 mx-auto" />
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-950">Đại diện Tulie Agency</p>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-tight font-bold italic">(Ký & đóng dấu / Authorized Signature)</p>
                        <div className="h-28 relative flex items-center justify-center">
                            {/* Digital Signature Placeholder or Seal if needed */}
                            <div className="absolute opacity-10 grayscale">
                                <img src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"} className="w-24 h-auto" alt="Seal" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="h-px w-40 bg-zinc-200 mx-auto" />
                            <p className="text-[12px] font-black uppercase tracking-tighter text-black mt-2">
                                {quotation.signer_name || brandConfig?.ceo_name || 'Nguyễn Đức Tùng'}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic leading-none">
                                {quotation.signer_title || brandConfig?.ceo_title || 'CEO & Founder'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. COPYRIGHT FOOTER */}
            <div className="p-10 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/50 print:bg-zinc-50">
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">Tulie Agency © {new Date().getFullYear()}</span>
                    <span className="w-px h-3 bg-zinc-200" />
                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-tight">Global Creative Standards</span>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-950 uppercase tracking-[0.2em]">
                    <Globe className="h-4 w-4 text-zinc-200" />
                    <span className="opacity-60">tulie.vn</span>
                </div>
            </div>

            {/* Print Injected Styles for 1:1 Fidelity */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white !important;
                    }
                    .print\\:bg-black {
                        background-color: black !important;
                        color: white !important;
                    }
                    .print\\:bg-zinc-200 {
                         background-color: #e4e4e7 !important;
                    }
                    .print\\:bg-zinc-50 {
                         background-color: #fafafa !important;
                    }
                    .print\\:text-white {
                        color: white !important;
                    }
                    * {
                        page-break-inside: avoid !important;
                    }
                }
            `}} />
        </div>
    )
}
