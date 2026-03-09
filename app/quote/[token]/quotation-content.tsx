'use client'

import React, { useState, useRef } from 'react'
import { QuotationPaper } from '@/components/quotations/quotation-paper'
import { QuotationDocumentPaper } from '@/components/quotations/quotation-document-paper'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, XCircle, Download, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

import { QuotationModernPaper } from '@/components/quotations/QuotationModernPaper'
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
    const [layout, setLayout] = useState<'basic' | 'modern'>('modern')

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
                // Optionally reload or let handle the parent update
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
                toast.success("Đã gửi từ chối báo giá")
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

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);
        toast.info("Đang khởi tạo file PDF chất lượng cao...");

        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = printRef.current;
            const canvas = await html2canvas(element, {
                scale: 2, // High quality
                useCORS: true,
                logging: false,
                windowWidth: 1200, // Fixed width for consistent layout
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('.quotation-inner-paper') as HTMLElement;
                    if (el) {
                        el.style.boxShadow = 'none';
                        el.style.borderRadius = '0';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`Bao_gia_${quotation.quotation_number}.pdf`);
            toast.success("Đã tải báo giá thành công");
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error("Lỗi khi tạo file PDF, vui lòng thử In nhanh (Ctrl+P)");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="quotation-page min-h-screen bg-neutral-100 py-8 pb-32 font-sans text-neutral-900">
            <div
                ref={printRef}
                className="quotation-paper-wrapper mx-auto relative w-full max-w-[210mm]"
            >
                {/* Main Paper Content */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-neutral-200 quotation-inner-paper">
                    {layout === 'modern' ? (
                        <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                    ) : (
                        <QuotationPaper quotation={quotation} brandConfig={brandConfig} />
                    )}
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 print:hidden">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Layout Switcher - Refined Tabs */}
                    <div className="bg-neutral-100 p-1 rounded-xl flex items-center w-full sm:w-auto">
                        <button
                            onClick={() => setLayout('modern')}
                            className={cn(
                                "flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold rounded-lg transition-all uppercase tracking-wider",
                                layout === 'modern' ? "bg-white text-black shadow-sm ring-1 ring-black/5" : "text-neutral-500 hover:text-black"
                            )}
                        >
                            Modern
                        </button>
                        <button
                            onClick={() => setLayout('basic')}
                            className={cn(
                                "flex-1 sm:flex-none px-6 py-2 text-[11px] font-bold rounded-lg transition-all uppercase tracking-wider",
                                layout === 'basic' ? "bg-white text-black shadow-sm ring-1 ring-black/5" : "text-neutral-500 hover:text-black"
                            )}
                        >
                            Basic
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <Button variant="outline" size="sm" className="h-10 rounded-xl border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold px-4" onClick={handleDownloadPDF} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Tải file
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 rounded-xl border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold px-4" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            In
                        </Button>

                        {quotation.status !== 'accepted' && quotation.status !== 'rejected' ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 px-4"
                                    onClick={() => setShowReject(true)}
                                    disabled={isSubmitting}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-10 rounded-xl bg-black text-white hover:bg-neutral-800 font-bold px-6 shadow-lg shadow-black/10"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={isSubmitting}
                                >
                                    Chấp nhận
                                </Button>
                            </div>
                        ) : (
                            <div className={cn(
                                "h-10 px-4 flex items-center gap-2 rounded-xl border font-bold text-xs uppercase tracking-wider",
                                quotation.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                            )}>
                                {quotation.status === 'accepted' ? 'Đã duyệt' : 'Đã từ chối'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Styles - Comprehensive to match live view exactly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    
                    html, body, .quotation-page, .quotation-paper-wrapper, .quotation-inner-paper {
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        position: static !important;
                    }

                    .quotation-inner-paper {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 !important;
                    }

                    .fixed, .print\\:hidden, [data-sonner-toaster], #headlessui-portal-root {
                        display: none !important;
                    }
                    
                    * {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
                ` }} />

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="rounded-3xl border-neutral-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight">Xác nhận chấp nhận báo giá</DialogTitle>
                        <DialogDescription className="text-sm">
                            Vui lòng kiểm tra lại thông tin xác nhận trước khi gửi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase text-neutral-500">Họ và tên <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={confirmer.name}
                                onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                placeholder="Nhập họ tên của bạn"
                                className="h-12 rounded-xl border-neutral-200"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase text-neutral-500">Số điện thoại <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phone"
                                    value={confirmer.phone}
                                    onChange={(e) => setConfirmer({ ...confirmer, phone: e.target.value })}
                                    placeholder="VD: 090..."
                                    className="h-12 rounded-xl border-neutral-200"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase text-neutral-500">Email</Label>
                                <Input
                                    id="email"
                                    value={confirmer.email}
                                    onChange={(e) => setConfirmer({ ...confirmer, email: e.target.value })}
                                    placeholder="email@company.com"
                                    className="h-12 rounded-xl border-neutral-200"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" className="h-12 rounded-xl border-neutral-200 font-bold px-6" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Hủy</Button>
                        <Button onClick={handleConfirm} className="h-12 rounded-xl bg-black text-white hover:bg-neutral-800 font-bold px-8 shadow-lg shadow-black/10" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận ngay'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="rounded-3xl border-neutral-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight">Từ chối báo giá</DialogTitle>
                        <DialogDescription className="text-sm">
                            Vui lòng cho biết lý do để chúng tôi có thể cải thiện dịch vụ tốt hơn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-xs font-bold uppercase text-neutral-500">Lý do từ chối <span className="text-red-500">*</span></Label>
                            <textarea
                                id="reason"
                                className="flex min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="VD: Giá chưa phù hợp, Cần bổ sung thêm hạng mục..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" className="h-12 rounded-xl border-neutral-200 font-bold px-6" onClick={() => setShowReject(false)} disabled={isSubmitting}>Hủy</Button>
                        <Button onClick={handleRejectSubmit} className="h-12 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold px-8" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
