'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, CheckCircle2, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen } from 'lucide-react'
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
import { Loader2 } from 'lucide-react'

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

export function QuotationContent({ quotation, brandConfig }: QuotationContentProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [confirmer, setConfirmer] = useState({
        name: '',
        email: '',
        phone: '',
        position: ''
    })

    const handleConfirm = async () => {
        if (!confirmer.name || !confirmer.phone) {
            toast.error("Vui lòng nhập tên và số điện thoại")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateQuotationStatus(quotation.id, 'accepted', confirmer)
            if (res.success) {
                toast.success("Đã xác nhận chấp nhận báo giá thành công")
                setShowConfirm(false)
                window.location.reload()
            } else {
                toast.error(res.error || "Lỗi khi xác nhận")
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
            const res = await updateQuotationStatus(quotation.id, 'rejected', { reason: rejectReason })
            if (res.success) {
                toast.success("Đã gửi phản hồi từ chối báo giá")
                setShowReject(false)
                window.location.reload()
            } else {
                toast.error(res.error || "Lỗi khi xử lý")
            }
        } finally {
            setIsSubmitting(false)
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
    const hasProposal = quotation.type === 'proposal' && pc

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (isDownloading) return;
        const element = printRef.current;
        if (!element) return;

        setIsDownloading(true);
        const toastId = toast.loading('Đang chuẩn bị bản in PDF...');

        try {
            // Load libraries with reliable checks
            const loadScript = (src: string, globalCheck: string): Promise<any> => {
                return new Promise((resolve, reject) => {
                    const existing = document.querySelector(`script[src="${src}"]`);
                    if ((window as any)[globalCheck] || (globalCheck.includes('.') && getGlobalByString(globalCheck))) {
                        return resolve((window as any)[globalCheck]);
                    }

                    const script = document.createElement('script');
                    script.src = src;
                    script.async = true;
                    script.onload = () => {
                        // Small delay to ensure global is bound
                        setTimeout(() => resolve((window as any)[globalCheck]), 100);
                    };
                    script.onerror = () => reject(new Error(`Failed to load ${src}`));
                    document.body.appendChild(script);
                });
            };

            const getGlobalByString = (path: string) => {
                return path.split('.').reduce((obj, key) => obj && obj[key], window as any);
            };

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf');

            const html2canvas = (window as any).html2canvas;
            const jspdfLib = (window as any).jspdf;

            if (!html2canvas || !jspdfLib) {
                throw new Error('PDF Libraries not ready after loading');
            }

            const { jsPDF } = jspdfLib;

            // Wait longer for images/styles to settle
            await new Promise(r => setTimeout(r, 2000));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                onclone: (doc: Document) => {
                    // Sanitize any inline oklch() colors directly on elements
                    try {
                        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
                        let node: Node | null;
                        while (node = walker.nextNode()) {
                            const el = node as HTMLElement;
                            if (el.style && el.style.cssText && el.style.cssText.includes('oklch')) {
                                el.style.cssText = el.style.cssText.replace(/oklch\([^)]*\)/g, (match) => {
                                    const lMatch = match.match(/oklch\(([\d.]+)/);
                                    const l = lMatch ? parseFloat(lMatch[1]) : 0.5;
                                    if (l > 0.85) return '#ffffff';
                                    if (l > 0.7) return '#f1f5f9';
                                    if (l > 0.5) return '#94a3b8';
                                    if (l > 0.3) return '#475569';
                                    return '#0f172a';
                                });
                            }
                        }
                    } catch (e) { /* safe fallback */ }

                    // CRITICAL: Sanitize all modern CSS color functions inside <style> tags
                    // html2canvas CSS parser crashes completely on oklch() and color-mix().
                    try {
                        const styleTags = doc.querySelectorAll('style');
                        for (let i = 0; i < styleTags.length; i++) {
                            let css = styleTags[i].innerHTML;
                            if (css && (css.includes('oklch') || css.includes('color-mix') || css.includes('oklab') || css.includes('oklch('))) {
                                // Super aggressive replacement
                                css = css.replace(/color-mix\((?:[^()]+|\([^()]*\))*\)/g, '#0f172a');
                                css = css.replace(/oklch\((?:[^()]+|\([^()]*\))*\)/g, '#0f172a');
                                css = css.replace(/oklab\((?:[^()]+|\([^()]*\))*\)/g, '#0f172a');
                                css = css.replace(/oklch\([^)]+\)/g, '#0f172a');
                                styleTags[i].innerHTML = css;
                            }
                        }
                        const root = doc.documentElement;
                        if (root.style.cssText.includes('oklch')) root.style.cssText = '';
                    } catch (e) { console.error('PDF Sanitize Error:', e); }

                    const style = doc.createElement('style');
                    style.innerHTML = `
                        @page { size: A4; margin: 0; }
                        body { background: white !important; font-family: sans-serif !important; }
                        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                        
                        /* Override ALL CSS custom properties that may use oklch */
                        :root, *, *::before, *::after {
                            --background: #ffffff !important;
                            --foreground: #0f172a !important;
                            --card: #ffffff !important;
                            --card-foreground: #0f172a !important;
                            --popover: #ffffff !important;
                            --popover-foreground: #0f172a !important;
                            --primary: #000000 !important;
                            --primary-foreground: #ffffff !important;
                            --secondary: #f1f5f9 !important;
                            --secondary-foreground: #0f172a !important;
                            --muted: #f8fafc !important;
                            --muted-foreground: #64748b !important;
                            --accent: #f1f5f9 !important;
                            --accent-foreground: #0f172a !important;
                            --destructive: #ef4444 !important;
                            --border: #e2e8f0 !important;
                            --input: #e2e8f0 !important;
                            --ring: #94a3b8 !important;
                            --sidebar-background: #ffffff !important;
                            --sidebar-foreground: #0f172a !important;
                            --sidebar-primary: #000000 !important;
                            --sidebar-primary-foreground: #ffffff !important;
                            --sidebar-accent: #f1f5f9 !important;
                            --sidebar-accent-foreground: #0f172a !important;
                            --sidebar-border: #e2e8f0 !important;
                            --sidebar-ring: #94a3b8 !important;
                        }

                        /* Force desktop layout for PDF - override sm: breakpoints */
                        .quotation-paper { min-height: auto !important; }
                        .quotation-inner { display: block !important; min-height: auto !important; }
                        .fixed.bottom-0 { display: none !important; }
                    `;
                    doc.head.appendChild(style);

                    // Force crossOrigin for images
                    const images = doc.getElementsByTagName('img');
                    for (let n = 0; n < images.length; n++) {
                        images[n].crossOrigin = 'anonymous';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Handle multi-page if content is too long
            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }

            pdf.save(`Bao_gia_${quotation.quotation_number || 'draft'}.pdf`);
            toast.success('Đã tải PDF thành công!', { id: toastId });
        } catch (err) {
            console.error('PDF Generation Detail:', err);
            toast.error('Lỗi tạo PDF tự động. Vui lòng nhấn "In báo giá" và chọn "Lưu thành PDF".', { id: toastId });
            throw err;
        } finally {
            setIsDownloading(false);
        }
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
                ref={printRef}
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
                                                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse text-[11px] min-w-[600px] sm:min-w-0">
                                    <thead>
                                        <tr className="text-white shadow-sm table-header-gradient" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E\"), linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
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
                                    <tbody className="divide-y divide-slate-100">
                                        {sectionEntries.map(([sectionName, sectionItems], sectionIndex) => (
                                            <React.Fragment key={sectionIndex}>
                                                {sectionName && (
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                        <td colSpan={hasDiscount ? 7 : 6} className="px-3 py-2.5 font-bold text-slate-900 text-[13px] normal-case">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-bold"
                                                                    style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                                    {sectionIndex + 1}
                                                                </span>
                                                                <span>{sectionName || "Sản phẩm & Dịch vụ chi tiết"}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                                {sectionItems.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any, index: number) => (
                                                    <tr key={`${sectionIndex}-${index}`} className="quotation-item-row hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-3 text-slate-500 align-top text-center py-2">{index + 1}</td>
                                                        <td className="px-3 align-top py-2">
                                                            <p className="font-semibold text-slate-900 leading-tight">{item.product_name}</p>
                                                            {item.description && (
                                                                <p className="text-slate-500 text-[10px] mt-0.5 leading-snug whitespace-pre-line border-l-2 border-slate-100 pl-2 py-0.5 mt-1">{item.description}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-3 text-center text-slate-600 align-top py-2">{item.unit}</td>
                                                        <td className="px-3 text-center text-slate-600 align-top py-2">{item.quantity}</td>
                                                        <td className="px-3 text-right text-slate-600 align-top py-2">{formatCurrency(item.unit_price)}</td>
                                                        {hasDiscount && (
                                                            <td className="px-3 text-center text-slate-500 align-top py-2">{item.discount || 0}%</td>
                                                        )}
                                                        <td className="px-3 text-right font-bold text-slate-900 align-top py-2">{formatCurrency(item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)))}</td>
                                                    </tr>
                                                ))}
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
                                            <span className="text-emerald-600 italic">Chiết khấu:</span>
                                            <span className="text-emerald-700">-{formatCurrency(totalDiscount)}</span>
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
                                        Bằng chữ: {readNumberToWords(finalAmount)}
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
                                            {(quotation.notes || brandConfig?.default_notes || 'Báo giá có hiệu lực trong vòng 07 ngày.\nGiá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).\nNội dung công việc sẽ được mô tả chi tiết trong hợp đồng.').split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="shrink-0 text-slate-500">•</span>
                                                    <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 pt-3 mt-auto">
                                        <h4 className="font-semibold text-black mb-1.5  text-[12px] ">Điều khoản thanh toán <span className="text-[0.8em] italic font-normal opacity-70">/ Payment Terms</span>:</h4>
                                        <div className="text-xs text-black leading-relaxed space-y-1">
                                            {(quotation.terms || brandConfig?.default_payment_terms || "50% đặt cọc khi xác nhận báo giá\n50% còn lại thanh toán khi hoàn thành").split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <span className="shrink-0 text-slate-500">•</span>
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
                                            <span className="font-semibold text-black">{quotation.bank_name || brandConfig?.bank_name || "Techcombank"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Số TK<span className="text-[0.8em] italic opacity-70">/ Account No</span>:</span>
                                            <span className="font-mono text-sm font-semibold text-black leading-none">{quotation.bank_account_no || brandConfig?.bank_account_no || "190368686868"}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                            <span className="text-slate-500 sm:text-black italic sm:not-italic">Chủ TK<span className="text-[0.8em] italic opacity-70">/ Account Name</span>:</span>
                                            <span className=" font-semibold text-black">{quotation.bank_account_name || brandConfig?.bank_account_name || "Công ty TNHH Tulie"}</span>
                                        </div>
                                        {(quotation.bank_branch || brandConfig?.bank_branch) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-baseline">
                                                <span className="text-slate-500 sm:text-black italic sm:not-italic">Chi nhánh<span className="text-[0.8em] italic opacity-70">/ Branch</span>:</span>
                                                <span className="font-semibold text-black">{quotation.bank_branch || brandConfig?.bank_branch}</span>
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

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-2xl z-50 print:hidden overflow-hidden">
                <div className="container max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-700 hidden sm:block font-medium">
                            Cần hỗ trợ? <span className="text-slate-900 font-semibold">{brandConfig?.hotline || "098.898.4554"}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 order-2 sm:order-1"
                                onClick={() => window.print()}
                            >
                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                In báo giá
                            </Button>
                            <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 order-3 sm:order-2" onClick={handleDownloadPDF} disabled={isDownloading}>
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                {isDownloading ? 'Đang tạo...' : 'Tải báo giá'}
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-9 sm:h-10 text-[12px] sm:text-sm text-slate-600 hover:text-red-600 order-4 sm:order-3"
                                onClick={() => setShowReject(true)}
                            >
                                Từ chối
                            </Button>
                            <Button
                                className="h-9 sm:h-10 col-span-2 sm:col-span-1 bg-black text-white hover:bg-zinc-900 shadow-md font-semibold text-[13px] sm:text-sm px-6 order-1 sm:order-4"
                                onClick={() => setShowConfirm(true)}
                                disabled={isSubmitting || quotation.status === 'accepted'}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {quotation.status === 'accepted' ? 'Đã chấp nhận' : 'Chấp nhận ngay'}
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
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl [&_[data-slot=dialog-close]_svg]:text-white">
                    <div className="bg-zinc-900 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Xác nhận chấp nhận báo giá</DialogTitle>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Quotation Approval & Confirmation</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Họ và tên <span className="text-red-500">*</span></Label>
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
                                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Số điện thoại <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        value={confirmer.phone}
                                        onChange={(e) => setConfirmer({ ...confirmer, phone: e.target.value })}
                                        placeholder="VD: 090..."
                                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="position" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Chức vụ</Label>
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
                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</Label>
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
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
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
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl [&_[data-slot=dialog-close]_svg]:text-white">
                    <div className="bg-red-600 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-white">Từ chối báo giá</DialogTitle>
                            <p className="text-red-200 text-xs font-bold uppercase tracking-widest mt-1">Rejection Reason & Feedback</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Lý do từ chối <span className="text-red-500">*</span></Label>
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
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
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
