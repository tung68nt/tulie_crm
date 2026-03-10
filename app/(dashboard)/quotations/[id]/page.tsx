'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
    Plus, LayoutGrid, List, FileText, Share2, Copy, ExternalLink, Edit, Printer, Clock, FileDown,
    CheckCircle, XCircle, Layout, ArrowLeft, Target, ClipboardList, Lightbulb, Package, Users,
    Shield, Award, BookOpen, User, Phone, Mail, MapPin, Globe, CreditCard, Building2, Loader2,
    Eye, Info, Receipt, FileSignature
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS } from '@/lib/constants/status'
import { QuotationPaper } from '@/components/quotations/quotation-paper'
import { QuotationDocumentPaper } from '@/components/quotations/quotation-document-paper'
import { QuotationModernPaper } from '@/components/quotations/QuotationModernPaper'
import { QuotationItem, Quotation, QuotationStatus } from '@/types'
import { QuotationEmailButton } from '@/components/quotations/quotation-email-button'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { ConvertQuotationButton } from '@/components/quotations/convert-quotation-button'
import DocumentDownloadButton from '@/components/documents/DocumentDownloadButton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { getQuotationById } from '@/lib/supabase/services/quotation-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { useParams } from 'next/navigation'

export default function QuotationDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [brandConfig, setBrandConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')
    const [layout, setLayout] = useState<'modern' | 'basic'>('modern')
    const [activeTab, setActiveTab] = useState<'data' | 'preview'>('data')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin)
        }

        const fetchData = async () => {
            try {
                const [data, brand] = await Promise.all([
                    getQuotationById(id),
                    getBrandConfig()
                ])
                setQuotation(data)
                setBrandConfig(brand)
            } catch (error) {
                console.error('Error fetching quotation:', error)
                toast.error('Không thể tải dữ liệu báo giá')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!quotation) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <h3 className="text-xl font-bold">Không tìm thấy báo giá</h3>
                <Button asChild variant="outline">
                    <Link href="/quotations">Quay lại danh sách</Link>
                </Button>
            </div>
        )
    }

    // Proposal content helpers
    const pc = quotation.proposal_content || {}
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0)

    const sectionIcons: Record<string, React.ReactNode> = {
        'introduction': <Target className="h-4 w-4" />,
        'scope_of_work': <ClipboardList className="h-4 w-4" />,
        'methodology': <Lightbulb className="h-4 w-4" />,
        'deliverables': <Package className="h-4 w-4" />,
        'team': <Users className="h-4 w-4" />,
        'timeline': <Clock className="h-4 w-4" />,
        'warranty': <Shield className="h-4 w-4" />,
        'why_us': <Award className="h-4 w-4" />,
    };

    const proposalSections = [
        { label: 'Mục tiêu & Giới thiệu', key: 'introduction' },
        { label: 'Phạm vi công việc (Scope of Work)', key: 'scope_of_work' },
        { label: 'Phương pháp & Cách tiếp cận', key: 'methodology' },
        { label: 'Sản phẩm bàn giao (Deliverables)', key: 'deliverables' },
        { label: 'Đội ngũ & Nhân sự', key: 'team' },
        { label: 'Tiến độ & Timeline', key: 'timeline' },
        { label: 'Chính sách bảo hành & Hỗ trợ', key: 'warranty' },
        { label: 'Vì sao chọn chúng tôi?', key: 'why_us' },
    ].filter(s => !!pc[s.key]);

    const publicUrl = quotation.public_token ? `${baseUrl}/quote/${quotation.public_token}` : null
    const portalUrl = quotation.public_token ? `${baseUrl}/portal/${quotation.public_token}` : null

    return (
        <div className="flex flex-col gap-6 pb-20">
            <div className="print:hidden space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-zinc-100 h-11 w-11 transition-all">
                            <Link href="/quotations">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-md">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="px-3 h-6 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-bold text-[10px] flex items-center tracking-tight uppercase shadow-sm">
                                        {quotation.quotation_number}
                                    </div>
                                    <Badge variant="secondary" className={cn("px-3 h-6 flex items-center rounded-lg text-[10px] font-bold tracking-tight border-none whitespace-nowrap",
                                        quotation.status === 'draft' ? "bg-zinc-100 text-zinc-600" :
                                            quotation.status === 'sent' ? "bg-blue-50 text-blue-600" :
                                                quotation.status === 'accepted' ? "bg-emerald-50 text-emerald-600" :
                                                    "bg-zinc-100 text-zinc-600"
                                    )}>
                                        {QUOTATION_STATUS_LABELS[quotation.status as QuotationStatus] || quotation.status}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold leading-none tracking-tight text-zinc-950">{quotation.customer?.company_name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2.5 h-11 px-6 font-bold rounded-xl border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition-all text-sm">
                                    <Share2 className="h-4 w-4" />
                                    Gửi & Chia sẻ
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-68 rounded-[16px] p-2.5 shadow-2xl border-zinc-100">
                                <DropdownMenuLabel className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Link & Portal công khai</DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1.5 opacity-50" />

                                {!quotation.public_token ? (
                                    <div className="p-4 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-2xl mx-1 mb-1 font-bold">
                                        Vui lòng nhấn Sửa và Lưu để kích hoạt link chia sẻ.
                                    </div>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild className="rounded-xl px-4 py-3 font-bold text-zinc-700 cursor-pointer">
                                            <Link href={portalUrl || '#'} target="_blank">
                                                <Layout className="h-4 w-4 mr-3 opacity-50" />
                                                Mở Portal khách hàng
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (portalUrl) {
                                                    navigator.clipboard.writeText(portalUrl)
                                                    toast.success('Đã sao chép link portal')
                                                }
                                            }}
                                            className="rounded-xl px-4 py-3 font-bold text-zinc-700 cursor-pointer"
                                        >
                                            <Copy className="h-4 w-4 mr-3 opacity-50" />
                                            Sao chép link portal
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="my-2 opacity-50" />
                                        <DropdownMenuItem asChild className="rounded-xl px-4 py-3 font-bold text-zinc-700 cursor-pointer">
                                            <Link href={publicUrl || '#'} target="_blank">
                                                <ExternalLink className="h-4 w-4 mr-3 opacity-50" />
                                                Mở Link báo giá
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <QuotationEmailButton quotation={quotation} triggerType="menuitem" />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" asChild className="h-11 px-6 font-bold rounded-xl border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition-all text-sm">
                            <Link href={`/quotations/${quotation.id}/edit`} className="flex items-center gap-2.5">
                                <Edit className="h-4 w-4 text-zinc-400" />
                                Sửa
                            </Link>
                        </Button>

                        {['draft', 'sent', 'accepted', 'viewed'].includes(quotation.status) && (
                            <ConvertQuotationButton quotationId={quotation.id} />
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <div className="bg-zinc-100/60 p-1 rounded-2xl h-12 flex items-center gap-1 border border-zinc-200/40 w-full max-w-[380px] shadow-sm">
                        <button
                            onClick={() => setActiveTab('data')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-2 text-xs font-bold transition-all h-full",
                                activeTab === 'data'
                                    ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
                            )}
                        >
                            <Info className="h-4 w-4" />
                            CHI TIẾT DỮ LIỆU
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-2 text-xs font-bold transition-all h-full",
                                activeTab === 'preview'
                                    ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
                            )}
                        >
                            <Eye className="h-4 w-4" />
                            XEM TRƯỚC BẢN IN
                        </button>
                    </div>
                </div>

                {activeTab === 'data' && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Info Card */}
                            <Card className="rounded-2xl border-zinc-200/60 shadow-sm overflow-hidden bg-white">
                                <div className="bg-zinc-50/50 px-8 py-4 border-b border-zinc-200/60">
                                    <CardTitle className="text-[11px] font-bold flex items-center gap-2.5 uppercase tracking-wider text-zinc-400">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Thông tin khách hàng
                                    </CardTitle>
                                </div>
                                <CardContent className="p-8">
                                    <div className="grid gap-10 sm:grid-cols-2">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Đơn vị</p>
                                                <p className="font-bold text-2xl text-zinc-950 tracking-tight leading-tight">{quotation.customer?.company_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Địa chỉ</p>
                                                <p className="text-sm font-medium text-zinc-600 leading-relaxed max-w-sm">{quotation.customer?.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-2">
                                            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email tiếp nhận</span>
                                                <span className="text-sm font-bold text-zinc-900">{quotation.customer?.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Hotline liên hệ</span>
                                                <span className="text-sm font-bold text-zinc-900">{quotation.customer?.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Proposal Content */}
                            {hasProposal && proposalSections.length > 0 && (
                                <Card className="rounded-2xl border-zinc-200/60 shadow-sm overflow-hidden bg-white">
                                    <div className="bg-zinc-950 px-8 py-5 relative">
                                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }}>
                                        </div>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Đề xuất giải pháp</CardTitle>
                                                <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Proposal — {proposalSections.length} Stages</p>
                                            </div>
                                            <Target className="h-6 w-6 text-zinc-600" />
                                        </div>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="relative pl-12 before:absolute before:left-[17px] before:top-[32px] before:bottom-8 before:w-[2px] before:bg-zinc-100 before:rounded-full">
                                            {proposalSections.map((section, idx) => (
                                                <div key={idx} className="relative mb-8 last:mb-0">
                                                    <div className="absolute -left-12 top-[32px] -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white bg-zinc-950 text-[12px] font-bold z-10 shadow-xl border-[3px] border-white">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="rounded-xl border border-zinc-200/60 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-zinc-300/60 group">
                                                        <div className="flex items-center gap-4 px-6 py-4 border-b bg-zinc-50/50 border-zinc-100 group-hover:bg-zinc-50 transition-colors">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white shadow group-hover:scale-105 transition-transform duration-300">
                                                                {sectionIcons[section.key] || <Info className="h-4 w-4" />}
                                                            </span>
                                                            <h4 className="text-[14px] font-bold text-zinc-900">
                                                                {section.label}
                                                            </h4>
                                                        </div>
                                                        <div className="px-6 py-5 text-[13px] text-zinc-600 font-medium leading-relaxed whitespace-pre-line bg-white">
                                                            {pc[section.key]}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Items Table */}
                            <Card className="rounded-2xl border-zinc-200/60 shadow-sm overflow-hidden bg-white">
                                <div className="bg-zinc-950 px-8 py-5 relative">
                                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }}>
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Chi tiết hạng mục</CardTitle>
                                            <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Investment Plan & Pricing Framework</p>
                                        </div>
                                        <Receipt className="h-6 w-6 text-zinc-600" />
                                    </div>
                                </div>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/70 border-zinc-100">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-14 text-center font-bold text-[10px] uppercase tracking-wider text-zinc-400 py-4">#</TableHead>
                                                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-zinc-400">Hạng mục & Mô tả</TableHead>
                                                <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider text-zinc-400">ĐVT</TableHead>
                                                <TableHead className="text-center font-bold text-[10px] uppercase tracking-wider text-zinc-400">SL</TableHead>
                                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider text-zinc-400">Đơn giá</TableHead>
                                                <TableHead className="text-right pr-8 font-bold text-[10px] uppercase tracking-wider text-zinc-400">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(quotation.items || []).map((item: any, idx: number) => (
                                                <TableRow key={item.id} className="hover:bg-zinc-50/40 group border-zinc-100">
                                                    <TableCell className="text-center font-medium text-zinc-400 text-xs tabular-nums py-5">{idx + 1}</TableCell>
                                                    <TableCell className="py-5">
                                                        <p className="font-bold text-zinc-950 text-sm leading-tight mb-1">{item.product_name}</p>
                                                        {item.description && <p className="text-[11px] text-zinc-500 font-medium leading-relaxed italic border-l-2 border-zinc-200 pl-3 py-0.5">{item.description}</p>}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-zinc-600 text-sm whitespace-nowrap">{item.unit}</TableCell>
                                                    <TableCell className="text-center font-bold text-zinc-950 text-sm">{item.quantity}</TableCell>
                                                    <TableCell className="text-right font-medium text-zinc-700 text-sm tabular-nums whitespace-nowrap">{formatCurrency(item.unit_price)}</TableCell>
                                                    <TableCell className="text-right pr-8 font-bold text-zinc-950 text-sm tabular-nums whitespace-nowrap">{formatCurrency(item.total_price)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="bg-zinc-50 border-t border-zinc-100 p-8 flex justify-end">
                                        <div className="w-full max-sm space-y-4">
                                            <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider italic">
                                                <span>Tạm tính (Subtotal):</span>
                                                <span className="text-zinc-950 not-italic text-sm">{formatCurrency(quotation.subtotal || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider italic">
                                                <span>Thuế VAT ({quotation.vat_percent || 0}%):</span>
                                                <span className="text-zinc-950 not-italic text-sm">{formatCurrency(quotation.vat_amount || 0)}</span>
                                            </div>
                                            <div className="pt-5 border-t border-zinc-200 flex justify-between items-center">
                                                <span className="font-bold text-xs uppercase tracking-tight text-zinc-500">Tổng thanh toán:</span>
                                                <span className="font-bold text-3xl text-zinc-950 tabular-nums tracking-tight">{formatCurrency(quotation.total_amount || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {/* Combined Status Card */}
                            <Card className="p-8 rounded-2xl border-zinc-200/60 shadow-sm space-y-8 bg-white overflow-hidden">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50/70 p-6 rounded-xl border border-zinc-100 text-center space-y-1 flex flex-col justify-center min-h-[100px]">
                                        <p className="text-4xl font-bold text-zinc-950 tabular-nums leading-none tracking-tight">{quotation.view_count || 0}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-t border-zinc-200/40 pt-3 mx-2">Lượt xem</p>
                                    </div>
                                    <div className="bg-zinc-50/70 p-6 rounded-xl border border-zinc-100 text-center space-y-1 flex flex-col justify-center min-h-[100px]">
                                        <p className="text-xs font-bold text-zinc-950 leading-tight tracking-tight">
                                            {quotation.valid_until ? formatDate(quotation.valid_until) : 'N/A'}
                                        </p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-t border-zinc-200/40 pt-3 mx-2">Ngày hết hạn</p>
                                    </div>
                                </div>

                                <div className="space-y-4 relative pl-3 border-l border-zinc-100 py-1">
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-bold uppercase text-zinc-900">Khởi tạo báo giá</p>
                                            <p className="text-[11px] font-medium text-zinc-400">{formatDate(quotation.created_at)}</p>
                                        </div>
                                    </div>
                                    {quotation.updated_at !== quotation.created_at && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5" />
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-bold uppercase text-zinc-500">Cập nhật cuối</p>
                                                <p className="text-[11px] font-medium text-zinc-400">{formatDate(quotation.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Payment Details Card */}
                            <Card className="p-8 rounded-2xl border-zinc-950/20 shadow-lg bg-zinc-950 text-white relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-[0.06] pointer-events-none group-hover:opacity-[0.09] transition-opacity duration-500"
                                    style={{ backgroundImage: "radial-gradient(#fff 0.8px, transparent 0.8px)", backgroundSize: "12px 12px" }}>
                                </div>
                                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-8 border-b border-zinc-800/60 pb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2.5">
                                        <CreditCard className="h-4 w-4" />
                                        Thông tin thanh toán
                                    </span>
                                    <Globe className="h-4 w-4 opacity-50" />
                                </h4>
                                <div className="space-y-7 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Đơn vị thụ hưởng</p>
                                        <p className="font-bold text-sm tracking-tight">{quotation.bank_account_name || brandConfig?.bank_account_name || "CÔNG TY TNHH TULIE"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Số tài khoản chính</p>
                                        <p className="font-bold text-3xl tracking-tighter text-white/95 font-mono select-all">
                                            {quotation.bank_account_no || brandConfig?.bank_account_no || "0110163102"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Ngân hàng</p>
                                            <p className="font-bold text-xs text-zinc-300">{quotation.bank_name || brandConfig?.bank_name || "MB BANK"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Chi nhánh</p>
                                            <p className="font-bold text-xs text-zinc-300">{quotation.bank_branch || brandConfig?.bank_branch || "VIỆT NAM"}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="space-y-8">
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                            {/* Layout Toggle - Segmented Control */}
                            <div className="bg-zinc-100/60 p-1 rounded-2xl h-12 flex items-center gap-1 border border-zinc-200/40 w-full max-w-[340px] shadow-sm">
                                <button
                                    onClick={() => setLayout('modern')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all h-full",
                                        layout === 'modern'
                                            ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
                                    )}
                                >
                                    <Layout className="h-4 w-4" />
                                    Hiện đại
                                </button>
                                <button
                                    onClick={() => setLayout('basic')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all h-full",
                                        layout === 'basic'
                                            ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
                                    )}
                                >
                                    <FileSignature className="h-4 w-4" />
                                    Cơ bản
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 font-bold rounded-xl gap-2.5 border-zinc-300 text-zinc-900 bg-white hover:bg-zinc-50 transition-all shadow-sm text-sm"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="h-4 w-4" />
                                    In báo giá
                                </Button>

                                {layout === 'modern' ? (
                                    <Button
                                        className="h-11 px-8 font-bold rounded-xl gap-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-md text-sm"
                                        onClick={() => window.print()}
                                    >
                                        <FileDown className="h-4 w-4" />
                                        Tải Mẫu Hiện đại
                                    </Button>
                                ) : (
                                    <DocumentDownloadButton
                                        type="quotation"
                                        documentId={quotation.id}
                                        customerId={quotation.customer_id}
                                        variant="default"
                                        size="default"
                                        className="h-11 px-8 font-bold rounded-xl gap-3 bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-md text-sm"
                                        label="Tải Mẫu Cơ bản"
                                        initialData={quotation}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center bg-zinc-100 rounded-[40px] p-8 md:p-16 border border-zinc-200/60 min-h-[900px] shadow-inner relative group">
                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}>
                            </div>
                            <div className="w-full max-w-[210mm] bg-white shadow-[0_50px_120px_-20px_rgba(0,0,0,0.18)] overflow-hidden rounded-sm transition-transform ring-1 ring-zinc-300/40 relative z-10 border border-zinc-100">
                                {layout === 'modern' ? (
                                    <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                                ) : (
                                    <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print specific container - ensures multi-page support */}
            <div className="hidden print:block !m-0 !p-0">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            @page { margin: 0; size: A4 portrait; }
                            html, body { 
                                margin: 0 !important; 
                                padding: 0 !important; 
                                background: white !important;
                                height: auto !important;
                                overflow: visible !important;
                                width: 100% !important;
                            }
                            body > div { width: 100% !important; max-width: none !important; margin: 0 !important; }
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .print:hidden { display: none !important; }
                        }
                    ` }} />
                <div className="bg-white w-full">
                    {layout === 'modern' ? (
                        <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                    ) : (
                        <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                    )}
                </div>
            </div>
        </div>
    )
}
