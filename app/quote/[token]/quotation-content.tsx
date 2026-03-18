'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, CheckCircle2, XCircle, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateQuotationStatus } from '@/lib/supabase/services/portal-actions'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'

// Add missing types for PDF libs
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface QuotationContentProps {
    quotation: any
    brandConfig?: any
}

export function QuotationContent({ quotation: initialQuotation, brandConfig }: QuotationContentProps) {
    const [currentQuotation, setCurrentQuotation] = useState(initialQuotation)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [confirmer, setConfirmer] = useState({
        name: '',
        email: '',
        phone: '',
        position: ''
    })

    // Sibling-related helpers
    const siblings = (initialQuotation as any).siblings || []
    const activeOptions = siblings.filter((s: any) => ['draft', 'sent', 'viewed'].includes(s.status))
    const historyItems = siblings.filter((s: any) => ['accepted', 'rejected', 'expired', 'converted'].includes(s.status))

    // Automatically show accepted one if it exists among siblings
    useEffect(() => {
        const acceptedQuotation = siblings.find((s: any) => s.status === 'accepted')
        if (acceptedQuotation && currentQuotation.status !== 'accepted') {
            setCurrentQuotation(acceptedQuotation)
        }
    }, [initialQuotation, siblings, currentQuotation.status])

    const handleConfirm = async () => {
        if (!confirmer.name || !confirmer.phone) {
            toast.error("Vui lòng nhập tên và số điện thoại")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateQuotationStatus(currentQuotation.id, 'accepted', {
                ...confirmer,
                selectedItemIds: selectedItemIds
            })
            if (res?.success) {
                toast.success("Đã xác nhận chấp nhận báo giá thành công")
                setShowConfirm(false)
                window.location.reload()
            } else {
                toast.error(res?.error || "Lỗi khi xác nhận")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateQuotationStatus(currentQuotation.id, 'rejected', { reason: rejectReason })
            if (res?.success) {
                toast.success("Đã gửi phản hồi từ chối báo giá")
                setShowReject(false)
                window.location.reload()
            } else {
                toast.error(res?.error || "Lỗi khi xử lý")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const items = currentQuotation.items || []
    const hasDiscount = items.some((item: any) => item.discount > 0)

    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
        const initialSelected: string[] = [];
        const seenGroups = new Set<string>();
        items.forEach((item: any) => {
            if (!item.is_optional) {
                if (item.alternative_group && item.alternative_group.trim() !== '') {
                    const groupKey = item.alternative_group.trim().toLowerCase();
                    if (!seenGroups.has(groupKey)) {
                        seenGroups.add(groupKey);
                        initialSelected.push(item.id);
                    }
                } else {
                    initialSelected.push(item.id);
                }
            }
        });
        return initialSelected;
    });

    const toggleItem = (itemId: string, alternativeGroup?: string) => {
        setSelectedItemIds(prev => {
            const isSelected = prev.includes(itemId);

            // If it's part of an alternative group, we switch to it
            if (alternativeGroup && alternativeGroup.trim() !== '') {
                const groupKey = alternativeGroup.trim().toLowerCase();
                // Get all other items in the same group
                const otherInGroup = items
                    .filter((i: any) => i.alternative_group?.trim().toLowerCase() === groupKey && i.id !== itemId)
                    .map((i: any) => i.id);

                // Remove others, add this one
                const filtered = prev.filter(id => !otherInGroup.includes(id));
                if (isSelected) {
                    return filtered.filter(id => id !== itemId);
                } else {
                    return [...filtered, itemId];
                }
            }

            // Normal toggle
            if (isSelected) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    }

    // Calculations based on current selection
    const selectedItems = items.filter((item: any) => selectedItemIds.includes(item.id));
    const subtotalRaw = selectedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = selectedItems.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet
    const vatPercent = currentQuotation.vat_percent || 0
    const vatAmount = subtotalNet * (vatPercent / 100)
    const finalAmount = subtotalNet + vatAmount

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

    // Proposal content helpers
    const pc = currentQuotation.proposal_content || {}
    const hasProposal = currentQuotation.type === 'proposal' && pc

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
            } catch (e) { /* skip unparseable */ }
        }
    }

    return (
        <div className="quotation-page min-h-screen bg-gray-100 py-8 pb-32 font-sans text-slate-800">
            {/* Options Switcher (Hero Section above Paper) */}
            {activeOptions.length > 1 && (
                <div className="max-w-[210mm] mx-auto mb-10 print:hidden px-4 sm:px-0">
                    <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/50 p-6 rounded-3xl shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <Target className="w-40 h-40 text-black rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1.5 text-center md:text-left">
                                <h3 className="text-2xl font-black tracking-tight text-zinc-950 uppercase italic">
                                    Lựa chọn phương án đầu tư
                                </h3>
                                <p className="text-zinc-500 text-sm font-medium">Bản chào giá có {activeOptions.length} lựa chọn phù hợp nhất dành cho bạn.</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 self-center">
                                {activeOptions.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((opt: any, idx: number) => {
                                    const isActive = currentQuotation.id === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setCurrentQuotation(opt);
                                                setSelectedItemIds(() => {
                                                    const init: string[] = [];
                                                    const seen = new Set();
                                                    (opt.items || []).forEach((i: any) => {
                                                        if (!i.is_optional) {
                                                            if (i.alternative_group && i.alternative_group.trim()) {
                                                                const key = i.alternative_group.trim().toLowerCase();
                                                                if (!seen.has(key)) { seen.add(key); init.push(i.id); }
                                                            } else { init.push(i.id); }
                                                        }
                                                    });
                                                    return init;
                                                });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={cn(
                                                "relative px-6 py-4 rounded-2xl transition-all duration-500 group flex flex-col items-center gap-1",
                                                isActive
                                                    ? "bg-zinc-950 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] scale-105"
                                                    : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">PHƯƠNG ÁN {idx + 1}</span>
                                            <span className="text-lg font-bold tabular-nums">{formatCurrency(opt.total_amount)}</span>
                                            {isActive && (
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rotate-45 rounded-sm" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                    .quotation-paper { box-shadow: none !important; margin: 0 !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}} />

            {/* A4 Container */}
            <div
                className="quotation-paper mx-auto bg-white shadow-xl relative w-full max-w-[210mm] overflow-hidden"
            >

                <div className="quotation-inner p-6 sm:p-10">
                    <div>
                        {/* Header Section - Modern & Bilingual */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0">
                            <div className="flex flex-col items-start w-full sm:w-[65%]">
                                {/* Logo Section - Height matches Title for alignment */}
                                <div className="h-20 sm:h-24 flex items-end mb-4 overflow-visible">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                                        alt={brandConfig?.brand_name || "Tulie Agency"}
                                        className="h-16 sm:h-20 w-auto object-contain grayscale"
                                    />
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <h1 className="text-xs sm:text-sm font-bold text-black leading-tight sm:leading-none sm:h-4 flex items-center">
                                        {brandConfig?.company_name || "Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie"}
                                    </h1>

                                    <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-slate-700 leading-snug">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>{brandConfig?.address || "Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>{brandConfig?.hotline || "098.898.4554"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>{brandConfig?.email || "support@tulielab.vn"}</span>
                                    </div>

                                    {brandConfig?.tax_code && (
                                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                            <FileText className="h-3 w-3 shrink-0" />
                                            <span>MST: {brandConfig.tax_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-left sm:text-right w-full sm:w-auto">
                                {/* Title Section - Height matches Logo for alignment */}
                                <div className="h-auto sm:h-24 flex flex-col justify-end mb-4">
                                    <h2 className="text-4xl sm:text-5xl font-bold text-black leading-none" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Báo giá</h2>
                                    <p className="text-xl sm:text-2xl text-black font-medium mt-1" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Quotation</p>
                                </div>

                                <div className="space-y-0.5 text-[12px] sm:text-[13px] text-black">
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Số<span className="text-[0.8em] italic font-normal opacity-70">/ No</span>:</span>
                                        <span>{currentQuotation.quotation_number}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Ngày<span className="text-[0.8em] italic font-normal opacity-70">/ Date</span>:</span>
                                        <span>{formatDate(currentQuotation.created_at)}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Hết hạn<span className="text-[0.8em] italic font-normal opacity-70">/ Valid until</span>:</span>
                                        <span>{formatDate(currentQuotation.valid_until)}</span>
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
                                    <span className="font-semibold text-black">{currentQuotation.customer?.company_name || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                    <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Địa chỉ<span className="text-[0.8em] italic font-normal opacity-70">/ Address</span>:</span>
                                    <span className="text-black">{currentQuotation.customer?.address || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                    <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Người liên hệ<span className="text-[0.8em] italic font-normal opacity-70">/ Attn</span>:</span>
                                    <span className="font-medium text-black">{currentQuotation.customer?.contact_name || "N/A"}</span>
                                </div>
                                {currentQuotation.customer?.tax_code && (
                                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
                                        <span className="text-slate-500 sm:text-slate-700 italic sm:not-italic">Mã số thuế<span className="text-[0.8em] italic font-normal opacity-70">/ Tax ID</span>:</span>
                                        <span className="text-black">{currentQuotation.customer.tax_code}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proposal Content - Premium Timeline Style */}
                        {hasProposal && proposalSections.length > 0 && (
                            <div className="mb-10">
                                {/* Proposal Header */}
                                <div className="relative mb-6 py-4 px-5 rounded-xl text-white overflow-hidden bg-zinc-950"
                                    style={{ backgroundImage: "linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
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
                                <div className="relative pl-8 before:absolute before:left-[11px] before:top-[24px] before:bottom-2 before:w-[2px] before:bg-slate-200 before:rounded-full">
                                    {proposalSections.map((section, idx) => {
                                        const icon = sectionIcons[section.label] || <Info className="w-4 h-4" />;
                                        return (
                                            <div key={idx} className="proposal-section relative mb-5 last:mb-0">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-8 top-[24px] -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-white bg-zinc-900 text-[9px] font-bold z-10"
                                                    style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                    {idx + 1}
                                                </div>

                                                {/* Content Card */}
                                                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden overflow-x-auto">
                                                    {/* Card Header */}
                                                    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b bg-slate-50 border-slate-100 text-zinc-900"
                                                        style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 text-white shadow-sm"
                                                            style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                            {icon}
                                                        </span>
                                                        <h4 className="text-[13px] font-bold leading-tight">
                                                            {section.label}
                                                        </h4>
                                                    </div>
                                                    {/* Card Body */}
                                                    <div className="px-5 py-4 text-[12px] text-slate-800 leading-relaxed space-y-2">
                                                        {section.content.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                            <div key={i} className="flex gap-2.5 pl-1">
                                                                <div className="shrink-0 mt-[7px]">
                                                                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                                                                </div>
                                                                <span className="flex-1 font-semibold text-slate-900">{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                            </div>
                                                        ))}
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
                            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11px] min-w-[600px]">
                                    <thead>
                                        <tr className="text-white shadow-sm table-header-gradient" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E\"), linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
                                            <th className="py-2.5 px-1 font-semibold w-10 text-center normal-case print:hidden">Chọn</th>
                                            <th className="py-2.5 px-1 font-semibold w-10 text-center normal-case">#</th>
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
                                    <tbody className="divide-y divide-slate-100">
                                        {sectionEntries.map(([sectionName, sectionItems], sectionIndex) => (
                                            <React.Fragment key={sectionIndex}>
                                                {sectionName && (
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                        <td className="print:hidden w-10"></td>
                                                        <td className="w-10 py-2.5">
                                                            <div className="w-6 h-6 rounded-md bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center mx-auto"
                                                                style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                                {sectionIndex + 1}
                                                            </div>
                                                        </td>
                                                        <td colSpan={hasDiscount ? 6 : 5} className="px-3 py-2.5 font-semibold text-slate-900 text-[13px] normal-case">
                                                            <span>{sectionName || "Sản phẩm & Dịch vụ chi tiết"}</span>
                                                        </td>
                                                    </tr>
                                                )}

                                                {(() => {
                                                    const sortedItems = sectionItems.sort((a: any, b: any) => a.sort_order - b.sort_order);
                                                    let selectedCounter = 0;
                                                    return sortedItems.map((item: any, index: number) => {
                                                    const isSelected = selectedItemIds.includes(item.id);
                                                    const isAlternative = item.alternative_group && item.alternative_group.trim() !== '';
                                                    if (isSelected) selectedCounter++;
                                                    const displayNumber = isSelected ? selectedCounter : null;

                                                    return (
                                                        <tr key={`${sectionIndex}-${index}`} className={cn(
                                                            "quotation-item-row transition-all duration-200",
                                                            !isSelected && "bg-slate-50 opacity-40 grayscale-[0.5] print:hidden",
                                                            isSelected && "hover:bg-slate-50/50"
                                                        )}>
                                                            <td className="w-10 text-center py-2 align-top print:hidden">
                                                                <div className="flex items-center justify-center">
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleItem(item.id, item.alternative_group)}
                                                                        className="h-5 w-5 rounded-full transition-all data-[state=checked]:bg-zinc-950 data-[state=checked]:border-zinc-950 ring-offset-background [&_svg]:stroke-[3px] [&_svg]:text-white"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="w-10 text-center py-2 align-top">
                                                                <span className="text-xs font-medium text-slate-400 tabular-nums leading-tight">{sectionName ? `${sectionIndex + 1}.${displayNumber ?? (index + 1)}` : displayNumber ?? (index + 1)}</span>
                                                            </td>
                                                            <td className="px-3 align-top py-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-semibold text-slate-900 leading-tight">{item.product_name}</p>
                                                                        {item.is_optional && (
                                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-zinc-300 bg-zinc-50 text-zinc-600 font-bold">Tùy chọn</Badge>
                                                                        )}
                                                                        {isAlternative && (
                                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-zinc-300 bg-zinc-100 text-zinc-700 font-bold">
                                                                                {item.alternative_group}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {item.description && (
                                                                        <div className="text-slate-600 text-[11px] leading-relaxed mt-1 space-y-0.5">
                                                                            {item.description.split('\n').filter((line: string) => line.trim()).map((line: string, di: number) => (
                                                                                <div key={di} className="flex gap-1.5">
                                                                                    <span className="shrink-0 text-slate-400 text-[13px] leading-none mt-[2px]">•</span>
                                                                                    <span className="italic">{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 text-center text-slate-600 align-top py-2">{item.unit}</td>
                                                            <td className="px-3 text-center text-slate-600 align-top py-2">{item.quantity}</td>
                                                            <td className="px-3 text-right text-slate-600 align-top py-2">{formatCurrency(item.unit_price)}</td>
                                                            {hasDiscount && (
                                                                <td className="px-3 text-center text-slate-500 align-top py-2">{item.discount || 0}%</td>
                                                            )}
                                                            <td className="px-3 text-right font-bold text-slate-900 align-top py-2">
                                                                {formatCurrency(item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)))}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                                })()}
                                            </React.Fragment>
                                        ))}
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
                                            <span className="text-zinc-500 italic">Chiết khấu:</span>
                                            <span className="text-zinc-700">-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                    )}
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between py-1.5 text-[12px]">
                                            <span className="text-slate-700 font-medium">Thành tiền sau CK:</span>
                                            <span className="font-medium text-slate-900">{formatCurrency(subtotalNet)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-1.5 text-[12px]">
                                        <span className="text-slate-500 italic">VAT ({currentQuotation.vat_percent}%):</span>
                                        <span className="font-medium text-slate-900">{formatCurrency(vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2.5">
                                        <span className="font-bold text-slate-900 text-sm">Tổng cộng:</span>
                                        <span className="font-bold text-lg text-slate-900">{formatCurrency(finalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-start pt-2 text-[10px] italic text-slate-500">
                                        <span className="shrink-0">Bằng chữ:</span>
                                        <span className="text-right ml-4">{readNumberToWords(finalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Section: Notes & Bank Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                                {/* Left Column: Notes & Terms */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4 h-full">
                                    <div>
                                        <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Ghi chú <span className="text-[0.8em] italic font-normal opacity-70">/ Notes</span>:</h4>
                                        <div className="text-xs text-black leading-relaxed space-y-1">
                                            {(currentQuotation.notes || brandConfig?.default_notes || 'Báo giá có hiệu lực trong vòng 07 ngày.\nGiá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).\nNội dung công việc sẽ được mô tả chi tiết trong hợp đồng.').split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="shrink-0 text-slate-400 mt-[-2px] text-lg font-bold">•</span>
                                                    <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 mt-auto">
                                        <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Điều khoản thanh toán <span className="text-[0.8em] italic font-normal opacity-70">/ Payment Terms</span>:</h4>
                                        <div className="text-xs text-black leading-relaxed space-y-1">
                                            {(currentQuotation.terms || brandConfig?.default_payment_terms || "50% đặt cọc khi xác nhận báo giá\n50% còn lại thanh toán khi hoàn thành").split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="shrink-0 text-slate-400 mt-[-2px] text-lg font-bold">•</span>
                                                    <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Bank Transfer */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-fit">
                                    <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Thông tin chuyển khoản<span className="text-[0.8em] italic font-normal opacity-70 ml-1 normal-case">/ Bank Transfer</span></h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Ngân hàng<span className="text-[0.8em] italic opacity-70">/ Bank</span>:</span>
                                            <span className="font-semibold text-black">{currentQuotation.bank_name || brandConfig?.bank_name || "Techcombank"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Số TK<span className="text-[0.8em] italic opacity-70">/ Account No</span>:</span>
                                            <span className="font-mono text-sm font-semibold text-black leading-none">{currentQuotation.bank_account_no || brandConfig?.bank_account_no || "190368686868"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Chủ TK<span className="text-[0.8em] italic opacity-70">/ Account Name</span>:</span>
                                            <span className=" font-semibold text-black">{currentQuotation.bank_account_name || brandConfig?.bank_account_name || "Công ty TNHH Tulie"}</span>
                                        </div>
                                        {(currentQuotation.bank_branch || brandConfig?.bank_branch) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                                <span className="text-slate-500 sm:text-black italic sm:not-italic">Chi nhánh<span className="text-[0.8em] italic opacity-70">/ Branch</span>:</span>
                                                <span className="font-semibold text-black">{currentQuotation.bank_branch || brandConfig?.bank_branch}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>




                        {/* Decorative Footer */}
                        <div className="pt-6 flex flex-col items-center">
                            <div className="w-full h-px bg-slate-200 mb-6"></div>
                            <div className="flex justify-between items-center w-full px-2 text-[10px] text-slate-600">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-slate-900 ">{brandConfig?.brand_name || "Tulie Agency"}</span>
                                    <span className="h-2 w-px bg-slate-200"></span>
                                    <span>{brandConfig?.company_name || "Giải pháp công nghệ số"}</span>
                                </div>
                                <div className="flex items-center gap-4 font-medium">
                                    <span>{brandConfig?.website || "tulie.agency"}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* History Timeline Panel */}
            {historyItems.length > 0 && (
                <div className="max-w-[210mm] mx-auto mt-12 mb-12 print:hidden px-4 sm:px-0">
                    <div className="bg-white/80 backdrop-blur-md border-[3px] border-zinc-200/50 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg transform -rotate-3">
                                    <Clock className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-950 tracking-tight uppercase italic">Lịch sử phiên bản</h3>
                                    <p className="text-zinc-500 text-sm font-medium">Quản lý các bản thảo và xác nhận trước đó của dự án.</p>
                                </div>
                            </div>

                            <div className="relative pl-12 before:absolute before:left-[17px] before:top-4 before:bottom-0 before:w-[3px] before:bg-zinc-100 before:rounded-full">
                                {historyItems.map((item: any) => (
                                    <div key={item.id} className="relative mb-12 last:mb-0 group cursor-pointer" onClick={() => {
                                        setCurrentQuotation(item);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}>
                                        <div className={cn(
                                            "absolute -left-[45px] top-2 w-[40px] h-[40px] rounded-2xl border-4 border-white z-10 transition-all duration-500 flex items-center justify-center shadow-md group-hover:scale-110",
                                            item.status === 'accepted' ? "bg-zinc-950" :
                                                item.status === 'rejected' ? "bg-rose-500" : "bg-zinc-400"
                                        )}>
                                            {item.status === 'accepted' ? <Check className="w-5 h-5 text-white" /> :
                                                item.status === 'rejected' ? <XCircle className="w-5 h-5 text-white" /> :
                                                    <FileText className="w-5 h-5 text-white" />}
                                        </div>

                                        <div className="bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 rounded-3xl p-6 transition-all duration-300 group-hover:translate-x-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-zinc-950 tracking-tighter">#{item.quotation_number}</span>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] h-5 px-2 font-black uppercase tracking-widest",
                                                            item.status === 'accepted' ? "bg-zinc-100 text-zinc-900 border-zinc-200" :
                                                                item.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-zinc-200/50"
                                                        )}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-[11px]">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black tabular-nums text-zinc-950">{formatCurrency(item.total_amount)}</p>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-600 transition-colors">Xem chi tiết phiên bản này →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 sm:p-4 shadow-md z-50 print:hidden overflow-hidden">
                <div className="container max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-700 hidden sm:block font-medium">
                            Cần hỗ trợ? <span className="text-slate-900 font-semibold">{brandConfig?.hotline || "098.898.4554"}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="default"
                                className="font-medium order-2 sm:order-1"
                                onClick={() => window.print()}
                            >
                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                In báo giá
                            </Button>
                            <Button
                                variant="ghost"
                                size="default"
                                className="font-medium text-muted-foreground hover:text-destructive order-4 sm:order-3"
                                onClick={() => setShowReject(true)}
                                disabled={['accepted', 'rejected'].includes(currentQuotation.status)}
                            >
                                Từ chối
                            </Button>
                            <Button
                                size="default"
                                className="col-span-2 sm:col-span-1 bg-zinc-950 text-white hover:bg-zinc-900 font-bold order-1 sm:order-4"
                                onClick={() => setShowConfirm(true)}
                                disabled={isSubmitting || ['accepted', 'rejected'].includes(currentQuotation.status)}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {currentQuotation.status === 'accepted' ? 'Đã chấp nhận' : 'Xác nhận ngay'}
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
                        box-shadow: none !important;
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
                    
                    th {
                        background-color: #000 !important;
                        color: #fff !important;
                        padding: 6px 10px !important;
                        font-weight: 600 !important;
                        font-size: 9px !important;
                        border: none !important;
                    }
                    
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
                    
                    .table-header-gradient, thead tr {
                        background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E"), linear-gradient(to right, #09090b, #171717, #404040) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[500px] rounded-lg p-0 overflow-hidden shadow-lg">
                    <div className="bg-zinc-900 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Xác nhận chấp nhận báo giá</DialogTitle>
                            <p className="text-zinc-400 text-[10px] font-bold mt-1">Quotation Approval & Confirmation</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[11px] font-bold text-zinc-500">Họ và tên <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={confirmer.name}
                                    onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                    placeholder="Nhập họ tên của bạn"
                                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-[11px] font-bold text-zinc-500">Số điện thoại <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        value={confirmer.phone}
                                        onChange={(e) => setConfirmer({ ...confirmer, phone: e.target.value })}
                                        placeholder="VD: 090..."
                                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="position" className="text-[11px] font-bold text-zinc-500">Chức vụ</Label>
                                    <Input
                                        id="position"
                                        value={confirmer.position}
                                        onChange={(e) => setConfirmer({ ...confirmer, position: e.target.value })}
                                        placeholder="VD: CEO, Manager..."
                                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[11px] font-bold text-zinc-500">Email</Label>
                                <Input
                                    id="email"
                                    value={confirmer.email}
                                    onChange={(e) => setConfirmer({ ...confirmer, email: e.target.value })}
                                    placeholder="your@email.com"
                                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full h-12 bg-black text-white hover:bg-zinc-900 rounded-xl font-bold shadow-xl shadow-black/10 transition-all"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Xác nhận chấp nhận ngay
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                onClick={() => setShowConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Hủy bỏ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="sm:max-w-[500px] rounded-lg p-0 overflow-hidden shadow-lg">
                    <div className="bg-red-600 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-white">Từ chối báo giá</DialogTitle>
                            <p className="text-red-200 text-[10px] font-bold mt-1">Rejection Reason & Feedback</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-[11px] font-bold text-zinc-500">Lý do từ chối <span className="text-red-500">*</span></Label>
                            <textarea
                                id="reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Vui lòng cho chúng tôi biết lý do bạn từ chối báo giá này để chúng tôi có thể cải thiện..."
                                className="min-h-[120px] w-full rounded-xl bg-zinc-50 border-zinc-200 p-4 text-sm focus:ring-red-500 focus:border-red-500 outline-none border transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full h-12 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold shadow-xl shadow-red-600/10 transition-all"
                                onClick={handleRejectSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Gửi phản hồi từ chối
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-zinc-400 hover:text-zinc-600 transition-all"
                                onClick={() => setShowReject(false)}
                                disabled={isSubmitting}
                            >
                                Hủy bỏ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}
