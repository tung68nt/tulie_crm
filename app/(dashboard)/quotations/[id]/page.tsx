'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    ExternalLink,
    FileSignature,
    Eye,
    Clock,
    Building2,
    CreditCard,
    Layout,
    Share2,
    Receipt,
    Info,
    Copy,
    Loader2,
    Target,
    ClipboardList,
    Lightbulb,
    Package,
    Users,
    Shield,
    Award,
} from 'lucide-react'
import { QuotationStatus, QuotationItem, Quotation } from '@/types'
import { QuotationEmailButton } from '@/components/quotations/quotation-email-button'
import { SetPasswordDialog } from '@/components/quotations/set-password-dialog'
import { ConvertQuotationButton } from '@/components/quotations/convert-quotation-button'
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
import { useParams } from 'next/navigation'

export default function QuotationDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin)
        }

        const fetchData = async () => {
            try {
                const data = await getQuotationById(id)
                setQuotation(data)
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
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/quotations">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground ">{quotation.quotation_number}</span>
                            <Badge className={QUOTATION_STATUS_COLORS[quotation.status as QuotationStatus] || 'bg-gray-100'}>
                                {QUOTATION_STATUS_LABELS[quotation.status as QuotationStatus] || quotation.status}
                            </Badge>
                        </div>
                        <h2 className="text-2xl font-bold  leading-none">{quotation.customer?.company_name}</h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Gửi & Chia sẻ Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 h-10 px-4 font-semibold">
                                <Share2 className="h-4 w-4" />
                                Gửi & Chia sẻ
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>Link & Portal công khai</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {!quotation.public_token ? (
                                <div className="p-3 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md mx-2 mb-2">
                                    Thiếu mã token. Hãy thử nhấn Sửa và Lưu lại để tạo mã.
                                </div>
                            ) : (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={portalUrl || '#'} target="_blank" className="cursor-pointer">
                                            <Layout className="h-4 w-4" />
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
                                        className="cursor-pointer"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Sao chép link portal
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={publicUrl || '#'} target="_blank" className="cursor-pointer">
                                            <ExternalLink className="h-4 w-4" />
                                            Mở Link báo giá
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (publicUrl) {
                                                navigator.clipboard.writeText(publicUrl)
                                                toast.success('Đã sao chép link báo giá')
                                            }
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Sao chép link báo giá
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <QuotationEmailButton quotation={quotation} triggerType="menuitem" />
                            <SetPasswordDialog quotationId={quotation.id} hasPassword={!!quotation.password_hash} triggerType="menuitem" />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

                    <Button variant="outline" asChild className="h-10 px-4 font-semibold">
                        <Link href={`/quotations/${quotation.id}/edit`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Sửa
                        </Link>
                    </Button>

                    {['draft', 'sent', 'accepted', 'viewed'].includes(quotation.status) && (
                        <ConvertQuotationButton quotationId={quotation.id} />
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Đơn vị</p>
                                    <p className="font-semibold text-lg">{quotation.customer?.company_name}</p>
                                    <p className="text-sm text-muted-foreground mt-2">Địa chỉ</p>
                                    <p className="text-sm">{quotation.customer?.address || 'N/A'}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{quotation.customer?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Điện thoại:</span>
                                        <span className="font-medium">{quotation.customer?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposal Content - Premium Timeline Style */}
                    {hasProposal && proposalSections.length > 0 && (
                        <Card className="mb-6 overflow-hidden border-slate-200">
                            <CardHeader className="bg-zinc-950 py-4 px-5 text-white relative">
                                <div className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                                </div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-bold">Đề xuất giải pháp</CardTitle>
                                        <CardDescription className="text-[11px] text-zinc-400 mt-0.5">Proposal — {proposalSections.length} hạng mục</CardDescription>
                                    </div>
                                    <Layout className="h-5 w-5 text-zinc-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                <div className="relative pl-8 before:absolute before:left-[11px] before:top-[12px] before:bottom-0 before:w-[2px] before:bg-slate-100 before:rounded-full">
                                    {proposalSections.map((section, idx) => {
                                        const icon = sectionIcons[section.key] || <Info className="w-4 h-4" />;
                                        return (
                                            <div key={idx} className="relative mb-8 last:mb-0">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-8 top-[12px] -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-white bg-zinc-900 text-[10px] font-bold z-10 border-2 border-white ">
                                                    {idx + 1}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-zinc-900">
                                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600">
                                                            {icon}
                                                        </span>
                                                        <h4 className="text-sm font-bold uppercase tracking-tight">
                                                            {section.label}
                                                        </h4>
                                                    </div>
                                                    <div className="text-[13px] text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                                                        {pc[section.key]}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Items Card */}
                    <Card className="mb-6 overflow-hidden border-slate-200">
                        <CardHeader className="bg-zinc-950 py-4 px-5 text-white relative">
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-bold">Chi tiết hạng mục</CardTitle>
                                        <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">Quotation Items</div>
                                    </div>
                                    <CardDescription className="text-[11px] text-zinc-400 mt-0.5">Chi tiết các hạng mục và chi phí dịch vụ</CardDescription>
                                </div>
                                <Receipt className="h-5 w-5 text-zinc-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="relative overflow-hidden bg-zinc-950 border-b-0 rounded-t-xl group p-0">
                                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                                        style={{ backgroundImage: "linear-gradient(to right, #09090b, #171717, #404040)" }}></div>
                                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                                        style={{ backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "12px 12px" }}></div>
                                    <TableRow className="border-b-0 relative z-10 hover:bg-transparent">
                                        <TableHead className="pl-6 font-bold text-white text-[10px] h-12">Dịch vụ / Sản phẩm</TableHead>
                                        <TableHead className="text-center w-24 font-bold text-white text-[10px] h-12">Số lượng</TableHead>
                                        <TableHead className="text-right w-32 font-bold text-white text-[10px] h-12">Đơn giá</TableHead>
                                        <TableHead className="text-right w-36 pr-6 font-bold text-white text-[10px] h-12">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                        let globalItemIndex = 0;
                                        const sections: Record<string, QuotationItem[]> = (quotation.items || []).reduce((acc: any, item: any) => {
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

                                        return sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                                            <React.Fragment key={sIdx}>
                                                {(sectionName || sectionEntries.length > 1) && (
                                                    <TableRow className="group/section hover:bg-transparent">
                                                        <TableCell colSpan={4} className="p-0 border-b border-stone-800">
                                                            <div className="relative bg-stone-900 px-6 py-3 min-h-[44px] flex items-center justify-between overflow-hidden">
                                                                {/* Background Layer: Gradient + Dots */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 opacity-90" />
                                                                <div
                                                                    className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
                                                                    style={{
                                                                        backgroundImage: `radial-gradient(#fff 0.5px, transparent 0.5px)`,
                                                                        backgroundSize: '12px 12px'
                                                                    }}
                                                                />

                                                                {/* Content Layer */}
                                                                <div className="relative z-10 flex items-center gap-4">
                                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20  backdrop-blur-md">
                                                                        <span className="text-xs font-bold">{sIdx + 1}</span>
                                                                    </div>
                                                                    <div className="flex flex-col text-white">
                                                                        <h3 className="text-[13px] font-bold leading-none mb-0.5">{sectionName || `Hạng mục ${sIdx + 1}`}</h3>
                                                                        <p className="text-[9px] text-zinc-400 font-bold">Category Details / <span className="italic opacity-60">Phân loại chi tiết</span></p>
                                                                    </div>
                                                                </div>
                                                                <div className="relative z-10 flex h-6 items-center px-2 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/40">Section {sIdx + 1}</div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {sectionItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((item, iIdx) => {
                                                    const currentGlobalIdx = ++globalItemIndex;
                                                    return (
                                                        <TableRow key={item.id} className="hover:bg-slate-50/50 group/row">
                                                            <TableCell className="pl-6 py-4">
                                                                <div className="flex gap-3">
                                                                    <span className="text-zinc-400 font-bold tabular-nums w-4 mt-0.5 text-[10px] group-hover/row:text-zinc-900 transition-colors">{currentGlobalIdx}.</span>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-slate-900 text-[13px]">{item.product_name}</p>
                                                                        {item.description && (
                                                                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 max-w-xl whitespace-pre-line border-l-2 border-stone-200 pl-3 py-0.5 font-medium">{item.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center whitespace-nowrap align-top py-4 font-bold text-slate-900">
                                                                {item.quantity} <span className="text-[10px] text-zinc-400 font-medium">{item.unit}</span>
                                                            </TableCell>
                                                            <TableCell className="text-right align-top py-4 tabular-nums font-bold text-slate-900">
                                                                {formatCurrency(item.unit_price || 0)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold pr-6 align-top py-4 tabular-nums bg-slate-50/30">
                                                                {formatCurrency(item.total_price || 0)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))
                                    })()}
                                </TableBody>
                            </Table>

                            <div className="border-t p-6">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tạm tính:</span>
                                            <span className="font-medium">{formatCurrency(quotation.subtotal || 0)}</span>
                                        </div>
                                        {(quotation.discount_amount || 0) > 0 && (
                                            <div className="flex justify-between text-sm text-destructive">
                                                <span>Chiết khấu ({quotation.discount_percent || 0}%):</span>
                                                <span>-{formatCurrency(quotation.discount_amount || 0)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">VAT ({quotation.vat_percent || 0}%):</span>
                                            <span className="font-medium">{formatCurrency(quotation.vat_amount || 0)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="font-bold text-lg">Tổng cộng:</span>
                                            <span className="font-bold text-2xl text-primary">{formatCurrency(quotation.total_amount || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms & Bank Card */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ghi chú & Điều khoản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Ghi chú</p>
                                    <div className="text-sm whitespace-pre-line bg-muted/30 p-3 rounded-lg border border-dashed">
                                        {quotation.notes || 'Không có ghi chú'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Điều khoản thanh toán</p>
                                    <div className="text-sm whitespace-pre-line bg-muted/30 p-3 rounded-lg border border-dashed">
                                        {quotation.terms || 'Theo quy định công ty'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Thông tin thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Ngân hàng</span>
                                        <span className="font-semibold">{quotation.bank_name || "Techcombank"}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Số tài khoản</span>
                                        <span className="font-mono text-base font-bold text-primary">{quotation.bank_account_no || "190368686868"}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Chủ tài khoản</span>
                                        <span className="font-medium ">{quotation.bank_account_name || "Công ty TNHH Tulie"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Timeline / Status Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Trạng thái & Lượt xem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-xl text-center flex flex-col items-center justify-between min-h-[90px] border border-slate-100">
                                    <p className="text-3xl font-bold text-slate-900 leading-none mt-1">{quotation.view_count || 0}</p>
                                    <p className="text-[11px] text-muted-foreground font-bold border-t border-slate-200 w-full pt-2">Lượt xem</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl text-center flex flex-col items-center justify-between min-h-[90px] border border-slate-100">
                                    <p className="text-[15px] font-bold text-slate-900 leading-none mt-2 truncate max-w-full">
                                        {quotation.valid_until ? formatDate(quotation.valid_until) : 'N/A'}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-bold border-t border-slate-200 w-full pt-2">Hết hạn</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                {quotation.status === 'converted' && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-purple-500" />
                                        <div>
                                            <p className="text-sm font-medium">Đã chuyển hợp đồng</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(quotation.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {quotation.status === 'expired' && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium text-orange-600">Đã hết hạn</p>
                                            <p className="text-xs text-muted-foreground">Qua hạn {quotation.valid_until && formatDate(quotation.valid_until)}</p>
                                        </div>
                                    </div>
                                )}
                                {quotation.rejected_at && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-red-500" />
                                        <div>
                                            <p className="text-sm font-medium text-red-600">Đã từ chối</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(quotation.rejected_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {quotation.accepted_at && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Đã chấp nhận</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(quotation.accepted_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {quotation.viewed_at && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">Khách hàng đã xem</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(quotation.viewed_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {quotation.status === 'sent' && !quotation.viewed_at && (
                                    <div className="flex gap-3">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-cyan-500" />
                                        <div>
                                            <p className="text-sm font-medium">Đã gửi hệ thống</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(quotation.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-slate-300" />
                                    <div>
                                        <p className="text-sm font-medium">Khởi tạo báo giá</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(quotation.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Người phụ trách</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {quotation.creator?.full_name?.charAt(0) || 'T'}
                                </div>
                                <div>
                                    <p className="font-medium">{quotation.creator?.full_name || 'Hệ thống'}</p>
                                    <p className="text-xs text-muted-foreground text-blue-600 font-medium">Admin</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
