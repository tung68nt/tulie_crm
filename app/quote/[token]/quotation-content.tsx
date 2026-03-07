'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen } from 'lucide-react'
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
import { toast } from 'sonner'
import DocumentDownloadButton from '@/components/documents/DocumentDownloadButton'

// Add missing types for PDF libs
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface QuotationContentProps {
    quotation: any
}

export function QuotationContent({ quotation }: QuotationContentProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)
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

    // Use items from quotation data
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
        // Keep '' (no section) at the end or handle sorting by sort_order of first item
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return a[1][0].sort_order - b[1][0].sort_order;
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

    // Calculations based on real data
    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = items.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet
    const vatAmount = quotation.vat_amount || 0
    const finalAmount = quotation.total_amount || (subtotalNet + vatAmount)

    // Proposal content helpers
    const pc = quotation.proposal_content || {}
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0)

    const handlePrint = () => {
        window.print();
    };

    // Build proposal sections for rendering
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
            } catch (e) { /* skip unparseable */ }
        }
    }

    return (
        <div className="quotation-page min-h-screen bg-gray-100 py-8 pb-32 font-sans text-slate-800">
            {/* Global print style enforcement */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    body { background: #e5e7eb; }
                    .quotation-paper { box-: none !important; margin: 0 !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}} />

            {/* A4 Container */}
            <div
                ref={printRef}
                className="quotation-paper mx-auto bg-white  relative w-full max-w-[210mm] overflow-hidden"
            >

                <div className="quotation-inner p-6 sm:p-10">
                    <div>
                        {/* Header Section - Modern & Bilingual */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0">
                            <div className="flex flex-col items-start w-full sm:w-[65%]">
                                {/* Logo Section - Height matches Title for alignment */}
                                <div className="h-20 sm:h-24 flex items-end mb-4 overflow-visible">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-16 sm:h-20 w-auto object-contain" />
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <h1 className="text-xs sm:text-sm font-semibold text-black leading-tight sm:leading-none sm:h-4 flex items-center">
                                        Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie
                                    </h1>

                                    <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-slate-700 leading-snug">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, <br className="hidden sm:block" />Thành phố Hà Nội, Việt Nam</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>098.898.4554</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>info@tulie.vn</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <FileText className="h-3 w-3 shrink-0" />
                                        <span>0110163102</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left sm:text-right w-full sm:w-auto">
                                {/* Title Section - Height matches Logo for alignment */}
                                <div className="h-auto sm:h-24 flex flex-col justify-end mb-4">
                                    <h2 className="text-4xl sm:text-5xl font-black text-black leading-none" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Báo giá</h2>
                                    <p className="text-xl sm:text-2xl text-black font-medium mt-1" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Quotation</p>
                                </div>

                                <div className="space-y-0.5 text-[12px] sm:text-[13px] text-black">
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Số<span className="text-[0.8em] italic font-normal opacity-70">/ No</span>:</span>
                                        <span>{quotation.quotation_number}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Ngày<span className="text-[0.8em] italic font-normal opacity-70">/ Date</span>:</span>
                                        <span>{formatDate(quotation.created_at)}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Hết hạn<span className="text-[0.8em] italic font-normal opacity-70">/ Valid until</span>:</span>
                                        <span>{formatDate(quotation.valid_until)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-slate-200 my-6" />

                        <div className="mb-6">
                            <h3 className="text-[13px] font-semibold text-black mb-2 border-l-4 border-black pl-3 leading-none h-3.5 flex items-center">
                                Thông tin khách hàng<span className="text-[0.8em] italic font-normal opacity-70">/ Customer</span>
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2 text-[12px] sm:text-[13px]">
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                    <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Đơn vị<span className="text-[0.8em] italic font-normal opacity-70">/ Company</span>:</span>
                                    <span className="font-semibold text-black">{quotation.customer?.company_name || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                    <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Địa chỉ<span className="text-[0.8em] italic font-normal opacity-70">/ Address</span>:</span>
                                    <span className="text-black">{quotation.customer?.address || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                    <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Người liên hệ<span className="text-[0.8em] italic font-normal opacity-70">/ Attn</span>:</span>
                                    <span className="font-medium text-black">{quotation.customer?.contact_name || "N/A"}</span>
                                </div>
                                {quotation.customer?.tax_code && (
                                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                        <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Mã số thuế<span className="text-[0.8em] italic font-normal opacity-70">/ Tax ID</span>:</span>
                                        <span className="text-black">{quotation.customer.tax_code}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proposal Content - Premium Timeline Style */}
                        {hasProposal && proposalSections.length > 0 && (
                            <div className="mb-10">
                                {/* Proposal Header */}
                                <div className="relative mb-6 py-4 px-5 rounded-xl text-white overflow-hidden  bg-zinc-950"
                                    style={{ backgroundImage: "linear-gradient(to right, #09090b, #171717, #404040)" }}>
                                    {/* Dot pattern as a separate layer for html2canvas compatibility */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-[15px] font-bold">Đề xuất giải pháp</h3>
                                        <p className="text-[11px] text-zinc-300 mt-0.5">Proposal — {proposalSections.length} hạng mục</p>
                                    </div>
                                </div>

                                {/* Timeline Steps */}
                                <div className="relative pl-8 before:absolute before:left-[11px] before:top-[23px] before:bottom-2 before:w-[2px] before:bg-slate-200 before:rounded-full">
                                    {proposalSections.map((section, idx) => {
                                        const icon = sectionIcons[section.label] || <Info className="w-4 h-4" />;
                                        return (
                                            <div key={idx} className="proposal-section relative mb-5 last:mb-0">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-8 top-[23px] -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-white bg-zinc-900 text-[9px] font-bold z-10">
                                                    {idx + 1}
                                                </div>

                                                {/* Content Card */}
                                                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                                    {/* Card Header */}
                                                    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b bg-slate-50 border-slate-100 text-zinc-900">
                                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 text-white ">
                                                            {icon}
                                                        </span>
                                                        <h4 className="text-[13px] font-bold leading-tight">
                                                            {section.label}
                                                        </h4>
                                                    </div>
                                                    {/* Card Body */}
                                                    <div className="px-4 py-3 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                        {section.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Investment Details Table */}
                        <div className="mb-8 pt-6 border-t border-slate-100/50 mt-2">
                            <h3 className="text-[14px] font-bold text-black mb-6 border-l-4 border-black pl-3 flex items-center">
                                <span className="text-primary mr-2">{hasProposal ? `${proposalSections.length + 1}.` : ''}</span>
                                {hasProposal ? 'Kế hoạch đầu tư' : 'Chi tiết dịch vụ'}
                                {!hasProposal && <span className="text-[0.8em] italic font-normal opacity-70 ml-1">/ Service Details</span>}
                                {hasProposal && <span className="text-[0.7em] italic font-normal opacity-50 ml-2 tracking-tight">(Investment Plan)</span>}
                            </h3>
                            <div className="rounded-xl overflow-hidden border border-slate-200">
                                {/* Table Header - Premium style with gradient and dots */}
                                <div className="relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(to right, #09090b, #171717, #404040)' }}>
                                    <div className="absolute inset-0 opacity-15 pointer-events-none"
                                        style={{ backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "12px 12px" }}></div>
                                    <table className="w-full text-left text-[11px] relative z-10">
                                        <thead>
                                            <tr className="text-white">
                                                <th className="py-2.5 px-3 font-semibold w-8 text-center normal-case">#</th>
                                                <th className="py-2.5 px-3 font-semibold normal-case">
                                                    Hạng mục & Mô tả <br />
                                                    <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Items</span>
                                                </th>
                                                <th className="py-2.5 px-3 font-semibold text-center w-20 normal-case">
                                                    ĐVT <br />
                                                    <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Unit</span>
                                                </th>
                                                <th className="py-2.5 px-3 font-semibold text-center w-20 normal-case">
                                                    SL <br />
                                                    <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Qty</span>
                                                </th>
                                                <th className="py-2.5 px-3 font-semibold text-right w-24 normal-case">
                                                    Đơn giá <br />
                                                    <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Price</span>
                                                </th>
                                                {hasDiscount && <th className="py-2.5 px-3 font-semibold text-center w-16 normal-case text-[10px]">CK(%)</th>}
                                                <th className="py-2.5 px-4 font-semibold text-right w-28 normal-case">
                                                    Thành tiền <br />
                                                    <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Amount</span>
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                {/* Table Body */}
                                <table className="w-full text-left border-collapse text-[11px] min-w-[600px] sm:min-w-0">
                                    <thead className="sr-only">
                                        <tr><th>#</th><th>Item</th><th>Unit</th><th>Qty</th><th>Price</th>{hasDiscount && <th>%</th>}<th>Amount</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(() => {
                                            let globalItemIndex = 0;
                                            // Handle cases where sections might be empty but we want to show 1-2-3-4
                                            const activeSections = sectionEntries.filter(([name, items]) => name || items.length > 0);

                                            return activeSections.map(([sectionName, sectionItems], sectionIndex) => (
                                                <React.Fragment key={sectionIndex}>
                                                    {/* Always show section header if there are multiple sections or a name is provided */}
                                                    {(sectionName || activeSections.length > 1) && (
                                                        <tr className="relative overflow-hidden group/section">
                                                            <td colSpan={hasDiscount ? 7 : 6} className="p-0 border-b border-slate-200">
                                                                <div className="relative bg-slate-100 px-4 py-3 min-h-[44px] flex items-center justify-between overflow-hidden">
                                                                    {/* Content Layer */}
                                                                    <div className="relative z-10 flex items-center gap-4">
                                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 border border-slate-200">
                                                                            <span className="text-xs font-bold">{sectionIndex + 1}</span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <h3 className="text-[13px] font-bold text-slate-800 leading-none mb-0.5">
                                                                                {sectionName || `Hạng mục ${sectionIndex + 1}`}
                                                                            </h3>
                                                                            <p className="text-[9px] text-slate-500 font-bold">Category Details / <span className="opacity-80">Phân loại chi tiết</span></p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {sectionItems.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any, index: number) => {
                                                        const currentGlobalIdx = ++globalItemIndex;
                                                        return (
                                                            <tr key={`${sectionIndex}-${index}`} className="quotation-item-row hover:bg-zinc-50/50 transition-colors group/row">
                                                                <td className="px-4 text-zinc-400 text-center py-4 bg-zinc-50/30 font-bold border-r border-zinc-100 group-hover/row:text-zinc-900 transition-colors">
                                                                    <span className="text-[10px] tabular-nums">{currentGlobalIdx}</span>
                                                                </td>
                                                                <td className="px-2 sm:px-4 align-top py-4">
                                                                    <p className="font-bold text-stone-900 leading-tight text-[12px]">{item.product_name}</p>
                                                                    {item.description && (
                                                                        <p className="text-zinc-500 text-[10px] mt-1.5 leading-relaxed whitespace-pre-line border-l-2 border-stone-200 pl-3 py-0.5 font-medium">{item.description}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 text-center text-zinc-600 align-top py-4 tabular-nums font-medium">{item.unit}</td>
                                                                <td className="px-4 text-center text-zinc-600 align-top py-4 tabular-nums font-bold">{item.quantity}</td>
                                                                <td className="px-4 text-right text-stone-900 align-top py-4 tabular-nums font-bold">{formatCurrency(item.unit_price)}</td>
                                                                {hasDiscount && (
                                                                    <td className="px-4 text-center text-stone-600 align-top py-4 tabular-nums font-bold bg-stone-50/50">-{item.discount || 0}%</td>
                                                                )}
                                                                <td className="px-4 text-right font-bold text-stone-900 align-top py-4 tabular-nums bg-stone-50/30">{formatCurrency(item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)))}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 mt-6">
                                <div className="hidden sm:block"></div>
                                <div className="w-full bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 divide-y divide-slate-100">
                                    <div className="flex justify-between py-1.5 text-[12px]">
                                        <span className="text-slate-500 italic">Tạm tính:</span>
                                        <span className="font-medium text-slate-900">{formatCurrency(subtotalRaw)}</span>
                                    </div>
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between py-1.5 text-[12px]">
                                            <span className="text-stone-600 font-medium">Chiết khấu:</span>
                                            <span className="text-stone-700 font-medium">-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-1.5 text-[12px]">
                                        <span className="text-slate-500 italic">VAT ({quotation.vat_percent}%):</span>
                                        <span className="font-medium text-slate-900">{formatCurrency(vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2.5">
                                        <span className="font-bold text-slate-900 text-sm">Tổng cộng:</span>
                                        <span className="font-bold text-lg text-slate-900">{formatCurrency(finalAmount)}</span>
                                    </div>
                                    <div className="text-right pt-2 text-[10px] italic text-slate-500">
                                        {readNumberToWords(finalAmount)}./.
                                    </div>
                                </div>
                            </div>

                            {/* Footer Section: Notes & Bank Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                                {/* Left Column: Notes & Terms */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4 h-full">
                                    <div>
                                        <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Ghi chú <span className="text-[0.8em] italic font-normal opacity-70">/ Notes</span>:</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-xs text-black leading-relaxed">
                                            {quotation.notes ? (
                                                <li className="list-none -ml-4 whitespace-pre-line">{quotation.notes}</li>
                                            ) : (
                                                <>
                                                    <li>Báo giá có hiệu lực trong vòng 07 ngày.</li>
                                                    <li>Giá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).</li>
                                                    <li>Nội dung công việc sẽ được mô tả chi tiết trong hợp đồng.</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 mt-auto">
                                        <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Điều khoản thanh toán <span className="text-[0.8em] italic font-normal opacity-70">/ Payment Terms</span>:</h4>
                                        <div className="text-xs text-black leading-relaxed whitespace-pre-line">
                                            {quotation.terms || "• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành"}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Bank Transfer */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
                                    <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Thông tin chuyển khoản<span className="text-[0.8em] italic font-normal opacity-70 ml-1 normal-case">/ Bank Transfer</span></h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Ngân hàng<span className="text-[0.8em] italic opacity-70">/ Bank</span>:</span>
                                            <span className="font-semibold text-black">{quotation.bank_name || "Techcombank"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Số TK<span className="text-[0.8em] italic opacity-70">/ Account No</span>:</span>
                                            <span className="font-mono text-sm font-semibold text-black leading-none">{quotation.bank_account_no || "190368686868"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Chủ TK<span className="text-[0.8em] italic opacity-70">/ Account Name</span>:</span>
                                            <span className=" font-semibold text-black">{quotation.bank_account_name || "Công ty TNHH Tulie"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Chi nhánh<span className="text-[0.8em] italic opacity-70">/ Branch</span>:</span>
                                            <span className="font-semibold text-black">{quotation.bank_branch || "Thanh Xuân - Hà Nội"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Footer */}
                        <div className="pt-6 flex flex-col items-center">
                            <div className="w-full h-px bg-slate-200 mb-6"></div>
                            <div className="flex justify-between items-center w-full px-2 text-[10px] text-slate-600">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-slate-900 ">Tulie Agency</span>
                                    <span className="h-2 w-px bg-slate-200"></span>
                                    <span>Giải pháp công nghệ số</span>
                                </div>
                                <div className="flex items-center gap-4 font-medium">
                                    <span>tulie.agency</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4  z-50 print:hidden overflow-hidden">
                <div className="container max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-700 hidden sm:block font-medium">
                            Cần hỗ trợ? <span className="text-slate-900 font-semibold">098.898.4554</span>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 order-2 sm:order-1" onClick={handlePrint}>
                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                In báo giá
                            </Button>
                            <DocumentDownloadButton
                                type="quotation"
                                label="Tải báo giá"
                                variant="outline"
                                className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 order-3 sm:order-2"
                                documentId={quotation.id}
                                customerId={quotation.customer_id}
                                fileName={`Bao_gia_${quotation.quotation_number}.pdf`}
                            />
                            <Button variant="ghost" className="h-9 sm:h-10 text-[12px] sm:text-sm text-slate-600 hover:text-red-600 order-4 sm:order-3">
                                Từ chối
                            </Button>
                            <Button className="h-9 sm:h-10 col-span-2 sm:col-span-1 bg-black text-white hover:bg-zinc-900  font-semibold text-[13px] sm:text-sm px-6 order-1 sm:order-4" onClick={() => setShowConfirm(true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Chấp nhận ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles - Comprehensive to match live view exactly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                    
                    /* Force color printing */
                    *, *::before, *::after {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        overflow: visible !important;
                    }
                    
                    /* Hide non-print elements */
                    .fixed.bottom-0,
                    #headlessui-portal-root,
                    [data-sonner-toaster] {
                        display: none !important;
                    }
                    
                    /* === MAIN CONTAINERS - remove all min-height === */
                    .quotation-page {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        min-height: 0 !important;
                        height: auto !important;
                    }
                    
                    .quotation-paper {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        box-: none !important;
                        min-height: 0 !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    
                    .quotation-inner {
                        padding: 3mm 5mm !important;
                        min-height: 0 !important;
                        height: auto !important;
                        display: block !important;
                    }
                    
                    /* === FORCE DESKTOP LAYOUT for all sm: classes === */
                    .flex-col.sm\\:flex-row { flex-direction: row !important; }
                    .sm\\:flex-row { flex-direction: row !important; }
                    .sm\\:gap-0 { gap: 0 !important; }
                    .w-full.sm\\:w-\\[65\\%\\] { width: 65% !important; }
                    .sm\\:w-auto { width: auto !important; }
                    .sm\\:text-right { text-align: right !important; }
                    .sm\\:justify-end { justify-content: flex-end !important; }
                    .sm\\:not-italic { font-style: normal !important; }
                    .sm\\:text-slate-700 { color: rgb(51 65 85) !important; }
                    .sm\\:text-black { color: #000 !important; }
                    .sm\\:text-sm { font-size: 12px !important; }
                    .sm\\:text-5xl { font-size: 3rem !important; }
                    .sm\\:text-2xl { font-size: 1.5rem !important; }
                    .sm\\:text-\\[13px\\] { font-size: 13px !important; }
                    .hidden.sm\\:block { display: block !important; }
                    .sm\\:block { display: block !important; }
                    .sm\\:h-24 { height: 6rem !important; }
                    .sm\\:h-20 { height: 5rem !important; }
                    .sm\\:p-10 { padding: 3mm 5mm !important; }
                    .sm\\:min-w-0 { min-width: 0 !important; }
                    .text-left.sm\\:text-right { text-align: right !important; }
                    
                    /* Grid layouts - force desktop */
                    .grid.grid-cols-1.sm\\:grid-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .grid.grid-cols-1.sm\\:grid-cols-\\[140px_1fr\\] {
                        grid-template-columns: 140px 1fr !important;
                    }
                    
                    /* Quotation info right side - force right align */
                    .quotation-inner p.flex.sm\\:justify-end {
                        justify-content: flex-end !important;
                    }
                    
                    /* === BACKGROUNDS === */
                    .bg-slate-50 {
                        background-color: #f8fafc !important;
                    }
                    .bg-slate-100 {
                        background-color: #f1f5f9 !important;
                    }
                    
                    /* === TABLE === */
                    table {
                        width: 100% !important;
                        border-collapse: separate !important;
                        border-spacing: 0 !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        overflow: hidden !important;
                        min-width: 0 !important;
                    }
                    
                    /* Table body cells only - NOT header */
                    td {
                        border-bottom: 0.5px solid #e2e8f0 !important;
                        padding: 5px 10px !important;
                        vertical-align: top !important;
                        font-size: 9px !important;
                    }
                    
                    tbody tr:last-child td { border-bottom: none !important; }
                    
                    /* === FONT SIZES - smaller for print === */
                    .text-xs { font-size: 9px !important; }
                    .text-sm { font-size: 11px !important; }
                    .text-\\[12px\\] { font-size: 10px !important; }
                    .text-\\[13px\\] { font-size: 11px !important; }
                    .text-\\[14px\\] { font-size: 12px !important; }
                    .text-\\[11px\\] { font-size: 9px !important; }
                    .text-\\[10px\\] { font-size: 8px !important; }
                    .text-\\[9px\\] { font-size: 7px !important; }
                    .text-\\[15px\\] { font-size: 13px !important; }
                    
                    /* Divider */
                    hr {
                        border-top: 1px solid #e2e8f0 !important;
                        margin: 8px 0 !important;
                    }
                    
                    /* Overflow fix */
                    .overflow-x-auto { overflow: visible !important; }
                    .min-w-\\[600px\\] { min-width: 0 !important; }
                    
                    /* Summary section */
                    .sm\\:w-\\[60\\%\\] { width: 55% !important; }
                    
                    /* Page break control */
                    .proposal-section { 
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    /* Spacing adjustments for print - tighter */
                    .mb-5 { margin-bottom: 8px !important; }
                    .mb-6 { margin-bottom: 10px !important; }
                    .mb-8 { margin-bottom: 12px !important; }
                    .mb-10 { margin-bottom: 16px !important; }
                    .mt-8 { margin-top: 12px !important; }
                    .my-6 { margin-top: 8px !important; margin-bottom: 8px !important; }
                    .gap-6 { gap: 10px !important; }
                    .gap-4 { gap: 6px !important; }
                    .space-y-5 > * + * { margin-top: 8px !important; }
                    .space-y-1\.5 > * + * { margin-top: 2px !important; }
                    .pt-6 { padding-top: 10px !important; }
                    
                    .p-4 { padding: 8px !important; }
                    .p-5 { padding: 10px !important; }
                    .rounded-xl { border-radius: 12px !important; }
                    .rounded-lg { border-radius: 8px !important; }
                }
            ` }} />

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
                        <Button onClick={handleConfirm} className="bg-black text-white hover:bg-slate-800">
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
