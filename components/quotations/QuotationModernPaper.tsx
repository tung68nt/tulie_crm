'use client'

import React from 'react'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { MapPin, Phone, Mail, FileText, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuotationModernPaperProps {
    quotation: any
    brandConfig?: any
}

/**
 * Premium Modern Quotation Paper (Magazine Layout)
 * Matches the LiveView (Portal) style 1:1.
 */
export function QuotationModernPaper({ quotation, brandConfig }: QuotationModernPaperProps) {
    if (!quotation) return null

    const items = quotation.items || []
    const hasDiscount = items.some((item: any) => item.discount > 0)

    // Helper: Group items by section_name
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

    // Icon mapping for proposal section types
    const sectionIcons: Record<string, React.ReactNode> = {
        'Mục tiêu & Giới thiệu': <Target className="w-4 h-4" />,
        'Phạm vi công việc (Scope of Work)': <ClipboardList className="w-4 h-4" />,
        'Phương pháp & Cách tiếp cận': <Lightbulb className="w-4 h-4" />,
        'Sản phẩm bàn giao (Deliverables)': <Package className="w-4 h-4" />,
        'Đội ngũ chuyên trách': <Users className="w-4 h-4" />,
        'Lộ trình triển khai (Timeline)': <Clock className="w-4 h-4" />,
        'Bảo hành & Hỗ trợ': <Shield className="w-4 h-4" />,
        'Vì sao chọn chúng tôi?': <Award className="w-4 h-4" />,
        'Case Studies & Portfolio': <BookOpen className="w-4 h-4" />,
    };

    // Calculations
    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = items.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet
    const vatAmount = quotation.vat_amount || 0
    const finalAmount = quotation.total_amount || (subtotalNet + vatAmount)

    // Proposal content
    const pc = quotation.proposal_content || {}
    const hasProposal = quotation.type === 'proposal' && pc

    const proposalSections: { label: string; content: string }[] = []
    if (hasProposal) {
        if (pc.introduction) proposalSections.push({ label: 'Mục tiêu & Giới thiệu', content: pc.introduction })
        if (pc.scope_of_work) proposalSections.push({ label: 'Phạm vi công việc (Scope of Work)', content: pc.scope_of_work })
        if (pc.methodology) proposalSections.push({ label: 'Phương pháp & Cách tiếp cận', content: pc.methodology })
        if (pc.deliverables) proposalSections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: pc.deliverables })
        if (pc.team) proposalSections.push({ label: 'Đội ngũ chuyên trách', content: pc.team })
        if (pc.timeline) proposalSections.push({ label: 'Lộ trình triển khai (Timeline)', content: pc.timeline })
        if (pc.warranty) proposalSections.push({ label: 'Bảo hành & Hỗ trợ', content: pc.warranty })
        if (pc.why_us) proposalSections.push({ label: 'Vì sao chọn chúng tôi?', content: pc.why_us })
        if (pc.case_studies) proposalSections.push({ label: 'Case Studies & Portfolio', content: pc.case_studies })
        if (pc.custom_sections) {
            try {
                const custom = typeof pc.custom_sections === 'string' ? JSON.parse(pc.custom_sections) : pc.custom_sections
                if (Array.isArray(custom)) {
                    custom.forEach((s: any) => {
                        if (s.title && s.content) proposalSections.push({ label: s.title, content: s.content })
                    })
                }
            } catch (e) { /* skip */ }
        }
    }

    return (
        <div className="quotation-paper-modern bg-white w-full max-w-[210mm] mx-auto shadow-sm print:shadow-none min-h-[297mm] flex flex-col">
            {/* 1:1 SYNCED HEADER */}
            <div className="p-10">
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-col items-start w-[65%]">
                        <div className="h-24 flex items-end mb-4">
                            <img
                                src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                                alt={brandConfig?.brand_name || "Tulie Agency"}
                                className="h-20 w-auto object-contain grayscale"
                            />
                        </div>

                        <div className="space-y-1.5 w-full">
                            <h1 className="text-sm font-bold text-black flex items-center h-4">
                                {brandConfig?.company_name || "Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie"}
                            </h1>

                            <div className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                                <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                <span>{brandConfig?.address || "Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội"}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[13px] text-slate-700">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span>{brandConfig?.hotline || "098.898.4554"}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[13px] text-slate-700">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span>{brandConfig?.email || "support@tulielab.vn"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="h-24 flex flex-col justify-end mb-4">
                            <h2 className="text-5xl font-black text-black leading-none" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Báo giá</h2>
                            <p className="text-2xl text-black font-medium mt-1" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Quotation</p>
                        </div>

                        <div className="space-y-0.5 text-[13px] text-black">
                            <p className="flex justify-end gap-1 h-4 items-center">
                                <span className="font-medium text-black">Số<span className="text-[0.8em] italic font-normal opacity-70">/ No</span>:</span>
                                <span>{quotation.quotation_number}</span>
                            </p>
                            <p className="flex justify-end gap-1 h-4 items-center">
                                <span className="font-medium text-black">Ngày<span className="text-[0.8em] italic font-normal opacity-70">/ Date</span>:</span>
                                <span>{formatDate(quotation.created_at)}</span>
                            </p>
                            <p className="flex justify-end gap-1 h-4 items-center">
                                <span className="font-medium text-black">Hết hạn<span className="text-[0.8em] italic font-normal opacity-70">/ Valid until</span>:</span>
                                <span>{formatDate(quotation.valid_until)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-200 my-8" />

                {/* CUSTOMER INFO */}
                <div className="mb-8">
                    <h3 className="text-[13px] font-semibold text-black mb-3 border-l-4 border-black pl-3 flex items-center h-4">
                        Thông tin khách hàng<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ Customer</span>
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-2.5 text-[13px]">
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-700">Đơn vị<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ Company</span>:</span>
                            <span className="font-semibold text-black">{quotation.customer?.company_name || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-700">Địa chỉ<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ Address</span>:</span>
                            <span className="text-black">{quotation.customer?.address || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr]">
                            <span className="text-slate-700">Người liên hệ<span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ Attn</span>:</span>
                            <span className="font-medium text-black">{quotation.customer?.contact_name || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* PROPOSAL TIMELINE */}
                {hasProposal && proposalSections.length > 0 && (
                    <div className="mb-12">
                        <div className="relative mb-8 py-4 px-6 rounded-xl text-white overflow-hidden bg-zinc-950"
                            style={{ backgroundImage: "linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
                            <div className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[16px] font-bold uppercase tracking-tight">Đề xuất giải pháp & Kế hoạch</h3>
                                <p className="text-[11px] text-zinc-300 mt-0.5 font-medium">Strategic Solution Proposal — {proposalSections.length} Sections</p>
                            </div>
                        </div>

                        <div className="relative pl-10 before:absolute before:left-[13px] before:top-[28px] before:bottom-4 before:w-[2px] before:bg-slate-200 before:rounded-full">
                            {proposalSections.map((section, idx) => {
                                const icon = sectionIcons[section.label] || <Info className="w-4 h-4" />;
                                return (
                                    <div key={idx} className="relative mb-6 last:mb-0">
                                        <div className="absolute -left-10 top-[28px] -translate-y-1/2 w-[28px] h-[28px] rounded-full flex items-center justify-center text-white bg-zinc-900 text-[10px] font-bold z-10"
                                            style={{ WebkitPrintColorAdjust: 'exact' }}>
                                            {idx + 1}
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                            <div className="flex items-center gap-3 px-5 py-3 border-b bg-slate-50/80 border-slate-100 text-zinc-900">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white shadow-sm"
                                                    style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                    {icon}
                                                </span>
                                                <h4 className="text-[14px] font-bold leading-tight">
                                                    {section.label}
                                                </h4>
                                            </div>
                                            <div className="px-5 py-4 text-[12px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                {section.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PRICING TABLE */}
                <div className="mb-10">
                    <h3 className="text-[15px] font-bold text-black mb-6 border-l-4 border-black pl-3 flex items-center h-4">
                        <span className="text-black mr-2 font-black">{hasProposal ? `${proposalSections.length + 1}.` : ''}</span>
                        {hasProposal ? 'Kế hoạch đầu tư' : 'Chi tiết dịch vụ'}
                        <span className="text-[0.7em] italic font-normal opacity-50 ml-2 tracking-tight">(Investment Plan)</span>
                    </h3>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-[12px]">
                            <thead>
                                <tr className="text-white" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E\"), linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
                                    <th className="py-4 px-4 font-bold w-10 text-center">#</th>
                                    <th className="py-4 px-4 font-bold">Hạng mục & Mô tả <br /><span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Items</span></th>
                                    <th className="py-4 px-4 font-bold text-center w-20">ĐVT <br /><span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Unit</span></th>
                                    <th className="py-4 px-4 font-bold text-center w-20">SL <br /><span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Qty</span></th>
                                    <th className="py-4 px-4 font-bold text-right w-28">Đơn giá <br /><span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Price</span></th>
                                    {hasDiscount && <th className="py-4 px-4 font-bold text-center w-20 text-[10px]">CK(%)</th>}
                                    <th className="py-4 px-6 font-bold text-right w-32">Thành tiền <br /><span className="text-[9px] font-normal opacity-60 uppercase tracking-wider">Amount</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                                    <React.Fragment key={sIdx}>
                                        {sectionName && (
                                            <tr className="bg-slate-100 border-b border-slate-200">
                                                <td colSpan={hasDiscount ? 7 : 6} className="px-5 py-3 font-bold text-slate-900 text-[13px]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-bold"
                                                            style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                            {sIdx + 1}
                                                        </span>
                                                        <span>{sectionName}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {sectionItems.map((item: any, iIdx: number) => (
                                            <tr key={iIdx} className="hover:bg-slate-50/50">
                                                <td className="px-4 text-slate-400 align-top text-center py-4">{iIdx + 1}</td>
                                                <td className="px-4 align-top py-4">
                                                    <p className="font-bold text-slate-900 text-[13px]">{item.product_name}</p>
                                                    {item.description && (
                                                        <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed whitespace-pre-line border-l-2 border-slate-100 pl-3 italic">{item.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 text-center text-slate-600 align-top py-4">{item.unit}</td>
                                                <td className="px-4 text-center text-slate-600 align-top py-4">{item.quantity}</td>
                                                <td className="px-4 text-right text-slate-600 align-top py-4">{formatCurrency(item.unit_price)}</td>
                                                {hasDiscount && (
                                                    <td className="px-4 text-center text-slate-500 align-top py-4">{item.discount || 0}%</td>
                                                )}
                                                <td className="px-6 text-right font-black text-slate-900 align-top py-4">{formatCurrency(item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)))}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <div className="w-[360px] bg-slate-50 p-6 rounded-2xl border border-slate-200/50 space-y-3">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-slate-500 font-medium italic">Tạm tính:</span>
                                <span className="font-black text-slate-950">{formatCurrency(subtotalRaw)}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-emerald-600 font-medium italic">Chiết khấu:</span>
                                    <span className="text-emerald-700">-{formatCurrency(totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[13px]">
                                <span className="text-slate-500 font-medium italic">VAT ({quotation.vat_percent}%):</span>
                                <span className="font-black text-slate-950">{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-black text-slate-950 uppercase tracking-tighter text-sm">Tổng thanh toán:</span>
                                <span className="font-black text-2xl text-slate-950">{formatCurrency(finalAmount)}</span>
                            </div>
                            <div className="text-right pt-2 text-[10px] italic text-slate-500 font-medium">
                                Bằng chữ: {readNumberToWords(finalAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TERMS & BANKING */}
                <div className="grid grid-cols-2 gap-6 mt-12 pb-12">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-6">
                        <div>
                            <h4 className="font-bold text-black mb-2.5 text-[13px] uppercase tracking-wide">Ghi chú <span className="text-[0.8em] italic font-normal opacity-70">/ Notes</span></h4>
                            <div className="text-[11px] text-slate-800 space-y-1.5 font-medium">
                                {(quotation.notes || brandConfig?.default_notes || 'Báo giá có hiệu lực trong vòng 07 ngày.').split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                    <div key={i} className="flex gap-2.5 items-start">
                                        <span className="shrink-0 text-slate-400 mt-1">•</span>
                                        <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-slate-200 pt-5 mt-auto">
                            <h4 className="font-bold text-black mb-2.5 text-[13px] uppercase tracking-wide">Thanh toán <span className="text-[0.8em] italic font-normal opacity-70">/ Payment</span></h4>
                            <div className="text-[11px] text-slate-800 space-y-1.5 font-medium">
                                {(quotation.terms || brandConfig?.default_payment_terms || "50% đặt cọc khi xác nhận\n50% khi hoàn thành").split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                                    <div key={i} className="flex gap-2.5 items-start">
                                        <span className="shrink-0 text-slate-400 mt-1">•</span>
                                        <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col">
                        <h4 className="font-bold text-black mb-4 text-[13px] uppercase tracking-wide">Thông tin chuyển khoản <span className="text-[0.8em] italic font-normal opacity-70">/ Bank</span></h4>
                        <div className="space-y-4 text-[12px]">
                            <div className="grid grid-cols-[110px_1fr] items-baseline">
                                <span className="text-slate-500 italic">Ngân hàng:</span>
                                <span className="font-bold text-black">{quotation.bank_name || brandConfig?.bank_name || "MB Bank"}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-baseline">
                                <span className="text-slate-500 italic">Số tài khoản:</span>
                                <span className="font-mono font-black text-sm text-black tracking-tight">{quotation.bank_account_no || brandConfig?.bank_account_no || "0110163102"}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-baseline">
                                <span className="text-slate-500 italic">Chủ tài khoản:</span>
                                <span className="font-bold text-black uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name || "CÔNG TY TNHH TULIE"}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-baseline">
                                <span className="text-slate-500 italic">Chi nhánh:</span>
                                <span className="text-black font-medium">{quotation.bank_branch || brandConfig?.bank_branch || "Sở Giao Dịch"}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-8"></div>
                    </div>
                </div>
            </div>

            {/* SYNCED DECORATIVE FOOTER */}
            <div className="mt-auto p-10 border-t border-slate-100 flex flex-col items-center">
                <div className="flex justify-between items-center w-full text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-950">{brandConfig?.brand_name || "Tulie Agency"}</span>
                        <span className="h-3 w-px bg-slate-200"></span>
                        <span>{brandConfig?.company_name || "Digital Solutions"}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>{brandConfig?.website || "tulie.vn"}</span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .quotation-paper-modern {
                        box-shadow: none !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />
        </div>
    )
}
