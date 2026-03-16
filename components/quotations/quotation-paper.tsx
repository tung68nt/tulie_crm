
'use client'

import React from 'react'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { MapPin, Phone, Mail, FileText, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen, Info, FilePenLine, UserCheck, Box, CheckCircle2, AlertCircle, Calendar, ChevronRight, Globe } from 'lucide-react'

interface QuotationPaperProps {
    quotation: any
    brandConfig?: any
}

export function QuotationPaper({ quotation, brandConfig }: QuotationPaperProps) {
    if (!quotation) return null

    const items = quotation.items || []
    const hasDiscount = items.some((item: any) => item.discount > 0)

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

    const proposalSections = quotation.proposal_sections || []
    const hasProposal = proposalSections.length > 0

    return (
        <div className="bg-white text-zinc-950 font-sans p-10 sm:p-14 min-h-[297mm] shadow-lg relative overflow-hidden flex flex-col print:shadow-none print:p-8" id="quotation-print">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-zinc-950 opacity-100" />

            {/* Header / Branding */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-12">
                {/* Left Side: Logo and Company Branding */}
                <div className="flex flex-col">
                    <div className="h-20 sm:h-24 flex items-start mb-10">
                        <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-16 sm:h-20 w-auto object-contain -ml-1" />
                    </div>
                </div>

                {/* Right Side: Large 'Báo giá' Header */}
                <div className="text-right flex flex-col justify-start">
                    <div className="h-20 sm:h-24 flex flex-col justify-start items-end mb-10">
                        <h2 className="text-[58px] font-bold text-black leading-[0.8] uppercase tracking-tighter" style={{ fontFamily: "'Kaine', 'Inter', sans-serif" }}>Báo giá</h2>
                        <p className="text-[24px] text-zinc-950 font-bold mt-1 tracking-tight" style={{ fontFamily: "'Kaine', 'Inter', sans-serif" }}>Quotation</p>
                    </div>
                </div>

                {/* --- Divider Level --- */}

                {/* Left Side: Full Company Specs */}
                <div className="space-y-4 pt-2">
                    <h1 className="text-[14px] font-bold text-black uppercase tracking-tight mb-2 whitespace-nowrap block w-full max-w-full">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</h1>
                    <div className="space-y-2 text-[11px] text-zinc-900 font-medium">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                            <span>Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, TP. Hà Nội, Việt Nam</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>098.898.4554</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>info@tulie.vn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>0110163102</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Quote Metadata */}
                <div className="pt-2">
                    <div className="space-y-2 text-[11px] font-bold uppercase tracking-tight text-right">
                        <div className="flex justify-end gap-2 group">
                            <span className="text-slate-400 group-hover:text-black">No.</span>
                            <span className="text-black bg-zinc-100 px-2 py-0.5 rounded ml-2">#{quotation.quotation_number}</span>
                        </div>
                        <div className="flex justify-end gap-2 group">
                            <span className="text-slate-400 group-hover:text-black">Date</span>
                            <span className="text-black ml-2">{formatDate(quotation.created_at)}</span>
                        </div>
                        <div className="flex justify-end gap-2 group">
                            <span className="text-slate-400 group-hover:text-black">Exp.</span>
                            <span className="text-black ml-2">{formatDate(quotation.valid_until)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Section */}
            <div className="mt-12 bg-zinc-950 p-8 rounded-xl text-white flex items-center justify-between relative overflow-hidden print:bg-black" style={{ backgroundImage: 'radial-gradient(circle at top right, #27272a, #09090b)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3">Người nhận — <span className="text-white font-semibold">Customer Information</span></p>
                        <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{quotation.customers?.company_name || quotation.customers?.full_name}</h3>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] font-medium text-zinc-300">
                            <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{quotation.customers?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{quotation.customers?.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{quotation.customers?.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposal Section */}
            {hasProposal && (
                <div className="mt-12">
                    <div className="flex items-center gap-4 mb-10 group bg-zinc-950 p-6 rounded-xl relative overflow-hidden print:bg-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                            backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                        }} />
                        <div className="relative z-10">
                            <h3 className="text-[18px] font-bold uppercase tracking-tight text-white !important">Đề xuất giải pháp</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-widest font-medium">proposal — {proposalSections.length} hạng mục</p>
                        </div>
                    </div>

                    <div className="relative space-y-16">
                        {proposalSections.map((section: any, idx: number) => (
                            <div key={idx} className="relative">
                                {/* Group Title */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-2 w-2 rounded-full bg-zinc-950 shadow-sm" />
                                    <h4 className="text-[13px] font-bold text-zinc-900 uppercase bg-zinc-50 border border-slate-100 px-4 py-1.5 rounded-full tracking-tight">
                                        {section.label}
                                    </h4>
                                </div>

                                {/* Horizontal Timeline Steps */}
                                <div className="grid grid-cols-3 gap-8 relative items-start">
                                    {/* Connection Line - Bold & Descriptive */}
                                    <div className="absolute top-6 left-[15%] right-[15%] h-[2px] bg-zinc-950 z-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any} />
                                    <div className="absolute top-6 left-[15%] right-[15%] h-4 border-t-2 border-dashed border-zinc-200 -translate-y-1/2 z-0 opacity-50" />

                                    {/* Step 1: Current Proposal content */}
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-zinc-950 text-white flex items-center justify-center border-4 border-white shadow-sm" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#09090b !important' }}>
                                                {idx === 0 ? <FileText size={18} /> : <Box size={18} />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bước 1</p>
                                                <h4 className="text-[13px] font-bold text-zinc-900 uppercase">Báo giá & Đề xuất</h4>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm group hover:border-zinc-300 transition-all p-4">
                                            <div className="text-[12px] text-zinc-600 leading-relaxed font-medium">
                                                {section.content}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Placeholder Contract */}
                                    <div className="relative z-10 space-y-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white">
                                                <FilePenLine size={18} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bước 2</p>
                                                <h4 className="text-[12px] font-bold text-zinc-900 uppercase">Hợp đồng kinh tế</h4>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 h-[100px] flex items-center justify-center text-center">
                                            <p className="text-[10px] italic text-slate-400">Dự thảo sau khi báo giá được phê duyệt</p>
                                        </div>
                                    </div>

                                    {/* Step 3: Placeholder Delivery */}
                                    <div className="relative z-10 space-y-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white">
                                                <UserCheck size={18} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bước 3</p>
                                                <h4 className="text-[12px] font-bold text-zinc-900 uppercase">Bàn giao</h4>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 h-[100px] flex items-center justify-center text-center">
                                            <p className="text-[10px] italic text-slate-400">Biên bản xác nhận hoàn tất dịch vụ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 pt-4 border-t border-slate-100">
                <h3 className="text-[12px] font-bold text-black mb-4 border-l-4 border-black pl-3 uppercase tracking-wider">
                    {hasProposal ? 'Kế hoạch đầu tư' : 'Chi tiết dịch vụ'} / <span className="text-slate-400 font-normal">Investment Plan</span>
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                    {/* Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-15deg] z-0">
                        <span className="text-[120px] font-bold uppercase whitespace-nowrap">Tulie Agency</span>
                    </div>
                    <table className="w-full text-left border-collapse text-[12px] relative z-10">
                        <thead>
                            <tr className="text-white relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to right, #09090b, #171717, #404040)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                <th className="py-3 px-3 font-semibold w-10 text-center relative z-10 font-mono">#</th>
                                <th className="py-3 px-4 font-semibold uppercase tracking-tight relative z-10">Dịch vụ & Mô tả</th>
                                <th className="py-3 px-3 font-semibold text-center w-24 uppercase tracking-tight relative z-10">ĐVT</th>
                                <th className="py-3 px-3 font-semibold text-center w-16 uppercase tracking-tight relative z-10">SL</th>
                                <th className="py-3 px-4 font-semibold text-right w-32 uppercase tracking-tight relative z-10">Đơn giá</th>
                                <th className="py-3 px-4 font-semibold text-right w-36 uppercase tracking-tight relative z-10">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sectionEntries.map(([sectionName, sectionItems], sectionIndex) => (
                                <React.Fragment key={sectionName || 'default'}>
                                    {sectionName && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={6} className="py-2.5 px-4 font-bold text-[10px] text-zinc-950 uppercase tracking-widest border-l-2 border-zinc-950 italic">
                                                {sectionName}
                                            </td>
                                        </tr>
                                    )}
                                    {sectionItems.map((item: any, idx: number) => (
                                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="py-3 px-3 text-center text-slate-400 font-mono align-top">{idx + 1}</td>
                                            <td className="py-3 px-4 align-top">
                                                <p className="font-bold text-zinc-950 text-[13px] mb-0.5 uppercase tracking-tight">{item.name}</p>
                                                {item.description && (
                                                    <p className="text-slate-500 text-[11px] leading-relaxed italic">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center align-top text-slate-600 font-medium">{item.unit || '-'}</td>
                                            <td className="py-3 px-3 text-center align-top text-zinc-950 font-bold">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right align-top font-medium text-slate-600">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-3 px-4 text-right align-top font-bold text-zinc-950">
                                                {formatCurrency(item.quantity * item.unit_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-12 items-start">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 italic">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        Bằng chữ / Amount in words
                    </p>
                    <p className="text-[11px] text-zinc-800 font-semibold leading-relaxed first-letter:uppercase">
                        {readNumberToWords(finalAmount)} đồng./.
                    </p>
                </div>

                <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-[11px] px-2">
                        <span className="text-slate-500 font-bold uppercase tracking-tight">Tạm tính / Subtotal</span>
                        <span className="text-zinc-950 font-bold">{formatCurrency(subtotalRaw)}</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between items-center text-[11px] px-2 text-green-600 font-medium">
                            <span className="font-bold uppercase tracking-tight">Chiết khấu / Discount</span>
                            <span className="font-bold">-{formatCurrency(totalDiscount)}</span>
                        </div>
                    )}
                    {totalDiscount > 0 && (
                        <div className="flex justify-between items-center text-[11px] px-2 border-t border-slate-200 pt-2">
                            <span className="text-zinc-950 font-bold uppercase tracking-tight">Thành tiền sau CK</span>
                            <span className="text-zinc-950 font-bold">{formatCurrency(subtotal)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[11px] px-2">
                        <span className="text-slate-500 font-bold uppercase tracking-tight">VAT ({quotation.vat_rate || 0}%)</span>
                        <span className="text-zinc-950 font-bold">{formatCurrency(vatAmount)}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t-2 border-zinc-950 flex justify-between items-center bg-zinc-950 text-white p-4 rounded-xl shadow-lg print:bg-black" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <span className="text-[12px] font-bold uppercase tracking-widest">Tổng cộng / Total</span>
                        <span className="text-xl font-bold">{formatCurrency(finalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Bank Accounts */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 group hover:border-zinc-300 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-zinc-950 text-white flex items-center justify-center print:bg-black">
                            <CheckCircle2 size={16} />
                        </div>
                        <h4 className="text-[11px] font-bold text-zinc-950 uppercase tracking-widest">Tulie Agency (Công ty)</h4>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-medium">
                        <p className="text-slate-500 uppercase tracking-tight">Chủ TK: <span className="text-zinc-950 font-bold">{brandConfig?.bank_account_name}</span></p>
                        <p className="text-slate-500 uppercase tracking-tight">Số TK: <span className="text-zinc-950 font-semibold text-[12px]">{brandConfig?.bank_account_no}</span></p>
                        <p className="text-slate-500 uppercase tracking-tight">Ngân hàng: <span className="text-zinc-950 font-bold">{brandConfig?.bank_name}</span></p>
                        {brandConfig?.bank_branch && <p className="text-slate-500 uppercase tracking-tight font-italic">CN: {brandConfig.bank_branch}</p>}
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 group hover:border-zinc-300 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                        </div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tulie Studio (Cá nhân)</h4>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-medium">
                        <p className="text-slate-500 uppercase tracking-tight">Chủ TK: <span className="text-zinc-950 font-bold">{brandConfig?.studio_bank_account_name}</span></p>
                        <p className="text-slate-500 uppercase tracking-tight">Số TK: <span className="text-zinc-950 font-semibold text-[12px]">{brandConfig?.studio_bank_account_no}</span></p>
                        <p className="text-slate-500 uppercase tracking-tight">Ngân hàng: <span className="text-zinc-950 font-bold">{brandConfig?.studio_bank_name}</span></p>
                        {brandConfig?.studio_bank_branch && <p className="text-slate-500 uppercase tracking-tight font-italic">CN: {brandConfig.studio_bank_branch}</p>}
                    </div>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-auto pt-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                <div className="space-y-6">
                    {quotation.notes && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={12} />
                                Ghi chú / Notes
                            </p>
                            <div className="text-[10px] text-zinc-600 font-medium leading-relaxed whitespace-pre-line italic p-4 bg-slate-50 rounded-xl border-l-2 border-slate-200">
                                {quotation.notes}
                            </div>
                        </div>
                    )}
                    {brandConfig?.default_payment_terms && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} />
                                Điều khoản thanh toán
                            </p>
                            <div className="text-[10px] text-zinc-600 font-medium leading-relaxed whitespace-pre-line italic p-4 bg-slate-50 rounded-xl border-l-2 border-slate-200">
                                {brandConfig.default_payment_terms}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center space-y-20 pb-10">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-950">Đại diện Tulie Agency</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-tight font-bold">Authorized Signature</p>
                    </div>
                    <div className="space-y-1">
                        <div className="h-0.5 w-40 bg-zinc-200 mx-auto" />
                        <p className="text-[11px] font-bold text-zinc-950 uppercase tracking-tight">
                            {quotation.signer_name || brandConfig?.ceo_name || 'Nguyễn Đức Tùng'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold italic">
                            {quotation.signer_title || brandConfig?.ceo_title || 'CEO & Founder'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                <div className="flex items-center gap-4">
                    <span className="text-zinc-950">www.tulie.vn</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>Business Solution Agency</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={10} />
                    <span>Global Standard Services</span>
                </div>
            </div>
        </div>
    )
}
