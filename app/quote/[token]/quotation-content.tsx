'use client'

import React, { useState, useRef } from 'react'
import { QuotationPaper } from '@/components/quotations/quotation-paper'
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

import { updateQuotationStatus } from '@/lib/supabase/services/portal-actions'

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
            toast.error("vui lòng nhập tên và số điện thoại")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateQuotationStatus(quotation.id, 'accepted', confirmer)
            if (res.success) {
                toast.success("đã xác nhận chấp nhận báo giá thành công")
                setShowConfirm(false)
                // Optionally reload or let handle the parent update
                window.location.reload()
            } else {
                toast.error(res.error || "lỗi khi xác nhận")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            toast.error("vui lòng nhập lý do từ chối")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updateQuotationStatus(quotation.id, 'rejected', { reason: rejectReason })
            if (res.success) {
                toast.success("đã gửi từ chối báo giá")
                setShowReject(false)
                window.location.reload()
            } else {
                toast.error(res.error || "lỗi khi xử lý")
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

    const initialPdfData = {
        type: 'quotation',
        quotation_number: quotation.quotation_number,
        customer: quotation.customer,
        items: quotation.items,
        total_amount: finalAmount,
        amount_in_words: readNumberToWords(finalAmount),
        valid_until: quotation.valid_until ? formatDate(quotation.valid_until) : '30 ngày kể từ ngày báo giá',
        day: new Date(quotation.created_at || new Date()).getDate(),
        month: new Date(quotation.created_at || new Date()).getMonth() + 1,
        year: new Date(quotation.created_at || new Date()).getFullYear(),
        brandConfig: brandConfig,
        bank_account_number: quotation.bank_account_number,
        bank_account_name: quotation.bank_account_name,
        bank_name: quotation.bank_name,
        bank_branch: quotation.bank_branch,
        terms: quotation.terms,
        notes: quotation.notes,
        proposal_content: quotation.proposal_content,
    }

    return (
        <div className="quotation-page min-h-screen bg-gray-100 py-8 pb-32 font-sans text-slate-800">
            <div
                ref={printRef}
                className="quotation-paper mx-auto relative w-full max-w-[210mm] overflow-hidden"
            >
                {/* Main Paper Content */}
                <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-200 quotation-paper">
                    <QuotationPaper quotation={quotation} brandConfig={brandConfig} />
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
                            {quotation.status !== 'accepted' && quotation.status !== 'rejected' ? (
                                <>
                                    <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700" onClick={handlePrint}>
                                        <Printer className="mr-1.5 h-3.5 w-3.5" />
                                        In báo giá
                                    </Button>
                                    <DocumentDownloadButton
                                        type="quotation"
                                        label="Tải báo giá"
                                        variant="outline"
                                        className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700"
                                        documentId={quotation.id}
                                        customerId={quotation.customer_id}
                                        fileName={`Bao_gia_${quotation.quotation_number}.pdf`}
                                        initialData={initialPdfData}
                                    />
                                    <Button
                                        variant="ghost"
                                        className="h-9 sm:h-10 text-[12px] sm:text-sm text-slate-600 hover:text-red-600"
                                        onClick={() => setShowReject(true)}
                                        disabled={isSubmitting}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button
                                        className="h-9 sm:h-10 col-span-2 sm:col-span-1 bg-black text-white hover:bg-zinc-900 font-semibold text-[13px] sm:text-sm px-6"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Chấp nhận ngay
                                    </Button>
                                </>
                            ) : (
                                <div className="col-span-2 flex items-center gap-3">
                                    <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700" onClick={handlePrint}>
                                        <Printer className="mr-1.5 h-3.5 w-3.5" />
                                        In báo giá
                                    </Button>
                                    <DocumentDownloadButton
                                        type="quotation"
                                        label="Tải báo giá"
                                        variant="outline"
                                        className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700"
                                        documentId={quotation.id}
                                        customerId={quotation.customer_id}
                                        fileName={`Bao_gia_${quotation.quotation_number}.pdf`}
                                        initialData={initialPdfData}
                                    />
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${quotation.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} font-semibold text-sm`}>
                                        {quotation.status === 'accepted' ? (
                                            <><CheckCircle className="h-4 w-4" /> Bạn đã chấp nhận báo giá này</>
                                        ) : (
                                            <><XCircle className="h-4 w-4" /> Bạn đã từ chối báo giá này</>
                                        )}
                                    </div>
                                </div>
                            )}
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
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Hủy</Button>
                        <Button onClick={handleConfirm} className="bg-black text-white hover:bg-slate-800" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do từ chối báo giá</DialogTitle>
                        <DialogDescription>
                            Chúng tôi rất tiếc vì báo giá này chưa đáp ứng được yêu cầu. Vui lòng cho biết lý do để chúng tôi cải thiện.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Lý do từ chối <span className="text-red-500">*</span></Label>
                            <textarea
                                id="reason"
                                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="VD: Giá chưa phù hợp, Cần bổ sung thêm hạng mục, Đã chọn đơn vị khác..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReject(false)} disabled={isSubmitting}>Hủy</Button>
                        <Button onClick={handleRejectSubmit} variant="destructive" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
