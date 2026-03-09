
'use client'

import React from 'react'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { MapPin, Phone, Mail, FileText, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen, Info } from 'lucide-react'

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

    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = items.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet
    const vatAmount = quotation.vat_amount || 0
    const finalAmount = quotation.total_amount || (subtotalNet + vatAmount)

    const pc = quotation.proposal_content || {}
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0)

    const proposalSections: { label: string; content: string }[] = []
    if (hasProposal) {
        if (pc.introduction) proposalSections.push({ label: 'Mục tiêu & Giới thiệu', content: pc.introduction })
        if (pc.scope_of_work) proposalSections.push({ label: 'Phạm vi công việc (Scope of Work)', content: pc.scope_of_work })
        if (pc.methodology) proposalSections.push({ label: 'Phương pháp & Cách tiếp cận', content: pc.methodology })
        if (pc.deliverables) proposalSections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: pc.deliverables })
        if (pc.team) proposalSections.push({ label: 'Đội ngũ & Nhân sự', content: pc.team })
        if (pc.timeline) proposalSections.push({ label: 'Tiến độ & Timeline', content: pc.timeline })
        if (pc.warranty) proposalSections.push({ label: 'Chính sách bảo hành & Hỗ trợ', content: pc.warranty })
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
            } catch (e) { }
        }
    }

    return (
        <div className="quotation-inner p-6 sm:p-12 font-sans text-slate-800 bg-white">
            {/* Header Grid - Precise Alignment */}
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
                        <h2 className="text-7xl sm:text-8xl font-black text-black leading-[0.7] uppercase tracking-tighter" style={{ fontFamily: "'Kaine', 'Inter', sans-serif" }}>Báo giá</h2>
                        <p className="text-3xl sm:text-4xl text-zinc-950 font-bold mt-2 tracking-tight" style={{ fontFamily: "'Kaine', 'Inter', sans-serif" }}>Quotation</p>
                    </div>
                </div>

                {/* --- Divider Level --- */}

                {/* Left Side: Full Company Specs */}
                <div className="space-y-4 pt-2">
                    <h1 className="text-[14px] font-bold text-black uppercase tracking-tight mb-2">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</h1>
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

                {/* Right Side: Detailed Metadata */}
                <div className="text-right pt-2">
                    <div className="space-y-1.5 text-[11px] text-zinc-900">
                        <p className="flex justify-end gap-1.5">
                            <span className="font-bold">Số/ No:</span>
                            <span className="font-medium">{quotation.quotation_number}</span>
                        </p>
                        <p className="flex justify-end gap-1.5">
                            <span className="font-bold">Ngày/ Date:</span>
                            <span className="font-medium">{formatDate(quotation.created_at)}</span>
                        </p>
                        <p className="flex justify-end gap-1.5">
                            <span className="font-bold">Hết hạn/ Valid until:</span>
                            <span className="font-medium">{quotation.valid_until ? formatDate(quotation.valid_until) : '21/03/2026'}</span>
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 my-10" />

            <div className="mb-12">
                <h3 className="text-[14px] font-bold text-black mb-4 border-l-4 border-black pl-3 uppercase tracking-tight">
                    Thông tin khách hàng/ <span className="text-slate-400 font-medium text-[11px]">Customer</span>
                </h3>
                <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 grid grid-cols-1 gap-2.5 text-[12px]">
                    <div className="grid grid-cols-[140px_1fr] items-center">
                        <span className="text-slate-500">Đơn vị/ <span className="text-slate-400">Company:</span></span>
                        <span className="font-bold text-slate-900">{quotation.customer?.company_name || quotation.customer_name || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center">
                        <span className="text-slate-500">Địa chỉ/ <span className="text-slate-400">Address:</span></span>
                        <span className="text-slate-800 font-medium">{quotation.customer?.address || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center">
                        <span className="text-slate-500">Người liên hệ/ <span className="text-slate-400">Attn:</span></span>
                        <span className="font-bold text-slate-900">{quotation.customer?.contact_person || quotation.customer?.contact_name || "N/A"}</span>
                    </div>
                </div>
            </div>

            {hasProposal && proposalSections.length > 0 && (
                <div className="mb-12">
                    <div className="relative mb-10 py-6 px-8 rounded-2xl text-white bg-zinc-950 overflow-hidden group">
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                                backgroundSize: '16px 16px'
                            }}
                        />
                        <div className="relative z-10">
                            <h3 className="text-[18px] font-bold uppercase tracking-tight">Đề xuất giải pháp</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-widest font-medium">proposal — {proposalSections.length} hạng mục</p>
                        </div>
                    </div>

                    <div className="relative pl-12 space-y-10 before:absolute before:left-[11px] before:top-4 before:bottom-0 before:w-[2px] before:bg-slate-100">
                        {proposalSections.map((section, idx) => (
                            <div key={idx} className="relative">
                                {/* Circular Index - Aligned perfectly with Header Icon */}
                                <div className="absolute -left-12 top-[26px] -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-zinc-950 text-white z-10 border-4 border-white shadow-sm">
                                    {idx + 1}
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-3.5 px-6 py-4 border-b bg-slate-50/50 border-slate-100 text-zinc-900">
                                        <div className="p-1.5 rounded-lg bg-zinc-950 text-white flex-shrink-0">
                                            {idx === 0 ? <Target size={14} /> : <ClipboardList size={14} />}
                                        </div>
                                        <h4 className="text-[14px] font-bold leading-tight uppercase tracking-tight text-zinc-950">
                                            {section.label}
                                        </h4>
                                    </div>
                                    <div className="px-8 py-6 text-[12px] text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-8 pt-4 border-t border-slate-100">
                <h3 className="text-[12px] font-bold text-black mb-4 border-l-4 border-black pl-3 uppercase tracking-wider">
                    {hasProposal ? 'Kế hoạch đầu tư' : 'Chi tiết dịch vụ'} / <span className="text-slate-400 font-normal">Investment Plan</span>
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="text-white relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to right, #09090b, #171717, #404040)' }}>
                                <th className="py-3 px-3 font-semibold w-10 text-center relative z-10 font-mono">#</th>
                                <th className="py-3 px-4 font-semibold uppercase tracking-tight relative z-10">Dịch vụ & Mô tả</th>
                                <th className="py-3 px-3 font-semibold text-center w-24 uppercase tracking-tight relative z-10">ĐVT</th>
                                <th className="py-3 px-3 font-semibold text-center w-20 uppercase tracking-tight relative z-10">SL</th>
                                <th className="py-3 px-3 font-semibold text-right w-28 uppercase tracking-tight relative z-10">Đơn giá</th>
                                <th className="py-3 px-4 font-semibold text-right w-32 uppercase tracking-tight relative z-10">Thành tiền</th>
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "12px 12px" }}></div>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sectionEntries.map(([sectionName, sectionItems], sectionIndex) => (
                                <React.Fragment key={sectionIndex}>
                                    {(sectionName || sectionEntries.length > 1) && (
                                        <tr className="bg-slate-50/80">
                                            <td colSpan={6} className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white text-[10px] font-bold shadow-sm">
                                                        {sectionIndex + 1}
                                                    </div>
                                                    <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                                                        {sectionName || `Nhóm dịch vụ ${sectionIndex + 1}`}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {sectionItems.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-3 text-center py-4 text-slate-400 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-4 align-top">
                                                <p className="font-bold text-slate-900 text-[12px]">{item.product_name}</p>
                                                {item.description && <p className="text-slate-500 text-[10px] mt-1 whitespace-pre-line leading-relaxed">{item.description}</p>}
                                            </td>
                                            <td className="px-3 text-center py-4">{item.unit}</td>
                                            <td className="px-3 text-center py-4 font-bold">{item.quantity}</td>
                                            <td className="px-3 text-right py-4 font-bold">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-4 text-right py-4 font-bold bg-slate-50/30">
                                                {formatCurrency(item.total_price || (item.quantity * item.unit_price))}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-6">
                    <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500 italic">Tạm tính:</span>
                            <span className="font-bold">{formatCurrency(subtotalRaw)}</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500 italic">Thuế VAT ({quotation.vat_percent || 0}%):</span>
                            <span className="font-bold">{formatCurrency(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="font-bold text-slate-900 uppercase text-[12px]">Tổng cộng:</span>
                            <span className="font-bold text-xl text-black">{formatCurrency(finalAmount)}</span>
                        </div>
                        <p className="text-right text-[10px] text-slate-400 italic mt-1">{readNumberToWords(finalAmount)}./.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col gap-4">
                    <div>
                        <h4 className="text-[11px] font-bold text-black uppercase mb-2">Ghi chú / <span className="text-slate-400 font-normal italic">Notes</span></h4>
                        <ul className="text-[11px] space-y-1 text-slate-600 list-none font-medium">
                            {(quotation.notes || brandConfig?.default_notes || "Báo giá có hiệu lực trong vòng 07 ngày.\nGiá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).\nNội dung công việc sẽ được mô tả chi tiết trong hợp đồng.")
                                .split('\n').filter(Boolean).map((l: string, i: number) => (
                                    <li key={i}>• {l.replace(/^[-•]\s*/, '')}</li>
                                ))}
                        </ul>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-[11px] font-bold text-black uppercase mb-2">Điều khoản thanh toán / <span className="text-slate-400 font-normal italic">Terms</span></h4>
                        <ul className="text-[11px] space-y-1 text-slate-600 list-none font-medium">
                            {(quotation.terms || brandConfig?.default_payment_terms || "50% đặt cọc khi xác nhận\n50% sau khi bàn giao")
                                .split('\n').filter(Boolean).map((l: string, i: number) => (
                                    <li key={i}>• {l.replace(/^[-•]\s*/, '')}</li>
                                ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    <h4 className="text-[11px] font-bold text-black uppercase mb-3 text-center">Thông tin thanh toán</h4>
                    <div className="space-y-2.5 text-[11px] font-medium">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-slate-500">Ngân hàng:</span>
                            <span className="text-slate-900 font-bold">{quotation.bank_name || brandConfig?.bank_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-slate-500">Số tài khoản:</span>
                            <span className="text-slate-900 font-bold tracking-wider">{quotation.bank_account_no || brandConfig?.bank_account_no}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-slate-500">Chủ tài khoản:</span>
                            <span className="text-slate-900 font-bold uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Chi nhánh:</span>
                            <span className="text-slate-900">{quotation.bank_branch || brandConfig?.bank_branch}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center opacity-70 grayscale">
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-slate-900">Tulie Agency</span>
                    <span className="text-[10px] text-slate-500 tracking-tight">Giải pháp công nghệ & Truyền thông số</span>
                </div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400">
                    WWW.TULIE.AGENCY
                </div>
            </div>
        </div>
    )
}
