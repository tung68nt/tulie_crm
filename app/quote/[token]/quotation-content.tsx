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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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
    const [layout] = useState<'basic' | 'modern'>('modern')

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
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        const aOrder = a[1][0]?.sort_order ?? 0;
        const bOrder = b[1][0]?.sort_order ?? 0;
        return aOrder - bOrder;
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
        <div className="quotation-page min-h-screen bg-neutral-50/50 py-8 pb-32 font-sans text-neutral-900">
            <div className="max-w-5xl mx-auto px-6">
                {/* Public Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 print:hidden">
                    <div className="flex items-center gap-6">
                        <img
                            src="/file/tulie-agency-logo.png"
                            alt="Logo"
                            className="h-10 w-auto object-contain"
                        />
                        <div className="w-px h-8 bg-neutral-200" />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] bg-white border-neutral-300 font-bold uppercase tracking-wider text-neutral-500">
                                    {quotation.quotation_number}
                                </Badge>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{formatDate(quotation.created_at)}</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight uppercase leading-none">{quotation.customer?.company_name || "Báo giá dịch vụ"}</h1>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="rich" className="w-full space-y-8 print:block">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1 print:hidden">
                        <TabsList className="bg-transparent h-auto p-0 gap-8">
                            <TabsTrigger
                                value="rich"
                                className="bg-transparent border-b-2 border-x-0 border-t-0 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none px-0 py-3 h-auto font-bold text-xs uppercase tracking-widest text-neutral-400 data-[state=active]:text-black transition-all"
                            >
                                <Info className="h-3.5 w-3.5 mr-2" />
                                Chi tiết dữ liệu
                            </TabsTrigger>
                            <TabsTrigger
                                value="paper"
                                className="bg-transparent border-b-2 border-x-0 border-t-0 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent rounded-none px-0 py-3 h-auto font-bold text-xs uppercase tracking-widest text-neutral-400 data-[state=active]:text-black transition-all"
                            >
                                <Printer className="h-3.5 w-3.5 mr-2" />
                                Xem trước bản in
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="rich" className="space-y-10 outline-none print:block">
                        {/* Proposal Content - B&W Magazine Style */}
                        {hasProposal && proposalSections.length > 0 && (
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Đề xuất giải pháp<span className="text-neutral-300 ml-2">/ Proposal</span></h2>
                                    <div className="h-1 w-20 bg-black" />
                                </div>

                                <div className="grid gap-8">
                                    {proposalSections.map((section, idx) => {
                                        const icon = sectionIcons[section.label] || <Info className="w-4 h-4" />;
                                        return (
                                            <div key={idx} className="group relative flex gap-6 md:gap-10">
                                                {/* Number / Connector */}
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-black/10 z-10">
                                                        {idx + 1}
                                                    </div>
                                                    {idx < proposalSections.length - 1 && (
                                                        <div className="w-px h-full bg-neutral-200 my-2" />
                                                    )}
                                                </div>

                                                {/* Content Card */}
                                                <div className="flex-1 pb-10">
                                                    <Card className="border-neutral-200 shadow-sm overflow-hidden rounded-2xl group-hover:border-black transition-all">
                                                        <CardHeader className="bg-neutral-50 px-6 py-4 flex flex-row items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-black">
                                                                {icon}
                                                            </div>
                                                            <CardTitle className="text-sm font-bold uppercase tracking-tight m-0">{section.label}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-6 text-sm text-neutral-600 leading-relaxed whitespace-pre-line font-medium">
                                                            {section.content}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Items Table - High Contrast B&W */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Chi tiết đầu tư<span className="text-neutral-300 ml-2">/ Investment</span></h2>
                                <div className="h-1 w-20 bg-black" />
                            </div>

                            <Card className="border-neutral-200 overflow-hidden shadow-sm rounded-2xl">
                                <Table>
                                    <TableHeader className="bg-black">
                                        <TableRow className="hover:bg-black border-none">
                                            <TableHead className="w-12 text-center text-white text-[10px] font-bold uppercase tracking-widest h-14">#</TableHead>
                                            <TableHead className="text-white text-[10px] font-bold uppercase tracking-widest h-14">Hạng mục & Mô tả</TableHead>
                                            <TableHead className="text-center w-24 text-white text-[10px] font-bold uppercase tracking-widest h-14">ĐVT</TableHead>
                                            <TableHead className="text-center w-20 text-white text-[10px] font-bold uppercase tracking-widest h-14">SL</TableHead>
                                            <TableHead className="text-right w-32 text-white text-[10px] font-bold uppercase tracking-widest h-14">Đơn giá</TableHead>
                                            <TableHead className="text-right w-32 pr-8 text-white text-[10px] font-bold uppercase tracking-widest h-14">Thành tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Grouped Items logic replicated from admin page */}
                                        {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                                            <React.Fragment key={sIdx}>
                                                {(sectionName || sectionEntries.length > 1) && (
                                                    <TableRow className="bg-neutral-50/80 hover:bg-neutral-50/80 border-b border-neutral-100">
                                                        <TableCell colSpan={6} className="py-3 px-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-[10px] font-bold">{sIdx + 1}</div>
                                                                <span className="text-xs font-black uppercase tracking-tight">{sectionName || `Hạng mục ${sIdx + 1}`}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {(sectionItems || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((item: any, iIdx: number) => (
                                                    <TableRow key={item.id} className="hover:bg-neutral-50/30 transition-colors border-b border-neutral-100 last:border-0 group/row">
                                                        <TableCell className="text-center py-5 text-[10px] font-bold text-neutral-400 group-hover/row:text-black">{iIdx + 1}</TableCell>
                                                        <TableCell className="py-5">
                                                            <div className="space-y-1.5">
                                                                <div className="font-bold text-sm uppercase tracking-tight">{item.product_name || item.name}</div>
                                                                {item.description && (
                                                                    <div className="text-[11px] text-neutral-500 leading-relaxed max-w-xl italic pl-3 border-l-2 border-neutral-200">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center text-[11px] font-bold text-neutral-500">{item.unit || '-'}</TableCell>
                                                        <TableCell className="text-center text-sm font-black">{item.quantity || 0}</TableCell>
                                                        <TableCell className="text-right text-sm font-bold">{formatCurrency(item.unit_price || 0)}</TableCell>
                                                        <TableCell className="text-right pr-8 text-sm font-black">{formatCurrency(item.total_price || (item.quantity * item.unit_price) || 0)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Totals Section */}
                                <div className="bg-neutral-50/50 p-8 border-t border-neutral-100">
                                    <div className="flex justify-end">
                                        <div className="w-full max-w-xs space-y-3">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                                <span>Tạm tính</span>
                                                <span className="text-black">{formatCurrency(quotation.subtotal || 0)}</span>
                                            </div>
                                            {(quotation.discount_amount || 0) > 0 && (
                                                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-red-500">
                                                    <span>Chiết khấu ({quotation.discount_percent || 0}%)</span>
                                                    <span>-{formatCurrency(quotation.discount_amount || 0)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                                <span>Thuế VAT ({quotation.vat_percent || 0}%)</span>
                                                <span className="text-black">{formatCurrency(quotation.vat_amount || 0)}</span>
                                            </div>
                                            <Separator className="bg-neutral-200" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-sm font-black uppercase tracking-widest">Tổng đầu tư</span>
                                                <span className="text-2xl font-black tracking-tighter">{formatCurrency(quotation.total_amount || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Terms & Payment - Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                                <CardHeader className="bg-neutral-50 border-b border-neutral-100">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-400">Ghi chú & Điều khoản</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Ghi chú chung</p>
                                        <div className="text-sm text-neutral-600 font-medium leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                            {quotation.notes || brandConfig?.default_notes || 'Không có ghi chú thêm.'}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Tiến độ thanh toán</p>
                                        <div className="text-sm text-neutral-600 font-medium leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                            {quotation.terms || brandConfig?.default_payment_terms || 'Theo thỏa thuận hai bên.'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-black text-white border-none rounded-2xl shadow-2xl overflow-hidden relative">
                                {/* Abstract BG decorative bit */}
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10" />

                                <CardHeader className="border-b border-white/10">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500">Thông tin chuyển khoản</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Ngân hàng</p>
                                            <p className="text-lg font-black tracking-tight">{quotation.bank_name || brandConfig?.bank_name || "Chưa cấu hình"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Số tài khoản</p>
                                            <p className="text-3xl font-black tracking-tighter text-white">{quotation.bank_account_no || brandConfig?.bank_account_no || "Chưa cấu hình"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Chủ tài khoản</p>
                                            <p className="text-sm font-bold uppercase tracking-wider">{quotation.bank_account_name || brandConfig?.bank_account_name || "Chưa cấu hình"}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Chi nhánh</span>
                                            <span className="text-xs font-medium text-neutral-300">{quotation.bank_branch || brandConfig?.bank_branch || "Hà Nội"}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-white/20 text-white uppercase font-bold px-3 py-1">Secure</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="paper" className="outline-none">
                        <div
                            ref={printRef}
                            className="quotation-paper-wrapper relative w-full"
                        >
                            <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-neutral-200 quotation-inner-paper">
                                {layout === 'modern' ? (
                                    <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                                ) : (
                                    <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 print:hidden">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Layout Switcher - Refined Tabs */}
                    <div className="flex items-center gap-3 pl-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">Modern Layout</span>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Active View</span>
                        </div>
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
