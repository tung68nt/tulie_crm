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
    const [layout, setLayout] = useState<'premium' | 'formal'>('premium')

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
        ...quotation,
        brandConfig: brandConfig,
        subtotal: quotation.subtotal || subtotalNet,
        vat_amount: quotation.vat_amount || vatAmount,
        total_amount: quotation.total_amount || finalAmount,
        amount_in_words: readNumberToWords(finalAmount),
    }

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);
        toast.info("đang khởi tạo file pdf chất lượng cao...");

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
                    // Force print styles or hide things in clone if needed
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

            // Handle multi-page if needed, but for now simple 1-page fit or split
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`Bao_gia_${quotation.quotation_number}.pdf`);
            toast.success("đã tải báo giá thành công");
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error("lỗi khi tạo file pdf, vui lòng thử In nhanh (Ctrl+P)");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="quotation-page min-h-screen bg-gray-100 py-8 pb-32 font-sans text-slate-800">
            <div
                ref={printRef}
                className="quotation-paper-wrapper mx-auto relative w-full max-w-[210mm]"
            >
                {/* Main Paper Content */}
                <div className="bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-200 quotation-inner-paper">
                    {layout === 'premium' ? (
                        <QuotationPaper quotation={quotation} brandConfig={brandConfig} />
                    ) : (
                        <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                    )}
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
                            <Button
                                variant="outline"
                                className="h-9 sm:h-10 text-[12px] sm:text-sm border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-bold"
                                onClick={() => setLayout(layout === 'premium' ? 'formal' : 'premium')}
                            >
                                <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                                {layout === 'premium' ? 'Mẫu Hành chính' : 'Mẫu Cao cấp'}
                            </Button>
                            {layout === 'formal' ? (
                                <DocumentDownloadButton
                                    type="quotation"
                                    documentId={quotation.id}
                                    customerId={quotation.customer_id}
                                    variant="outline"
                                    className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 font-bold"
                                    label="Tải PDF"
                                    initialData={quotation}
                                />
                            ) : (
                                <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700 font-bold" onClick={handleDownloadPDF} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                                    {isDownloading ? 'Đang tạo...' : 'Tải PDF'}
                                </Button>
                            )}
                            <Button variant="outline" className="h-9 sm:h-10 text-[12px] sm:text-sm border-slate-300 hover:bg-slate-50 text-slate-700" onClick={handlePrint}>
                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                In nhanh
                            </Button>
                            {quotation.status !== 'accepted' && quotation.status !== 'rejected' ? (
                                <>
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
                                        Xác nhận
                                    </Button>
                                </>
                            ) : (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${quotation.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} font-semibold text-sm`}>
                                    {quotation.status === 'accepted' ? 'Đã được chấp nhận' : 'Đã bị từ chối'}
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
                        margin: 0;
                    }
                    
                    /* Force total overflow and height to prevent single-page crop */
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
                    }

                    /* Important: ensure the content inside QuotationPaper is well-spaced for paper */
                    .quotation-paper-content {
                        padding: 10mm 15mm !important;
                    }
                    
                    /* Hide non-print UI elements */
                    .fixed, .print\\:hidden, [data-sonner-toaster], #headlessui-portal-root {
                        display: none !important;
                    }
                    
                    /* Header Scaling */
                    .text-\\[42px\\] { font-size: 32pt !important; }
                    .text-\\[58px\\] { font-size: 36pt !important; }
                    .text-\\[18px\\] { font-size: 14pt !important; }
                    .text-\\[24px\\] { font-size: 17pt !important; }
                    .leading-\\[0\\.8\\] { line-height: 0.8 !important; }
                    
                    /* Proposal Spacing */
                    .relative.pl-12 { padding-left: 3rem !important; }
                    
                    /* Break control for sections and rows */
                    .proposal-section, .rounded-3xl, .rounded-2xl, tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Typography scaling for A4 */
                    .text-xl { font-size: 1.25rem !important; }
                    .text-lg { font-size: 1.125rem !important; }
                    .text-sm { font-size: 10pt !important; }
                    .text-xs { font-size: 8pt !important; }
                    .text-white { color: white !important; -webkit-text-fill-color: white !important; }
                    .text-zinc-400 { color: #a1a1aa !important; }
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
