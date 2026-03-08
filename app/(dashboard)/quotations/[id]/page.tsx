'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS } from '@/lib/constants/status'
import {
    ArrowLeft,
    Edit,
    ExternalLink,
    FileSignature,
    Eye,
    Clock,
    Share2,
    Copy,
    Loader2,
    Printer,
    Target,
    ClipboardList,
    Lightbulb,
    Package,
    Users,
    Shield,
    Award,
    Layout,
} from 'lucide-react'
import { QuotationPaper } from '@/components/quotations/quotation-paper'
import { QuotationStatus, QuotationItem, Quotation } from '@/types'
import { QuotationEmailButton } from '@/components/quotations/quotation-email-button'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
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
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { useParams } from 'next/navigation'

export default function QuotationDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [brandConfig, setBrandConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')

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
                                <SetPasswordDialog
                                    entityId={quotation.id}
                                    tableName="quotations"
                                    hasPassword={!!quotation.password_hash}
                                    triggerType="menuitem"
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

                        <Button variant="outline" onClick={() => window.print()} className="h-10 px-4 font-semibold gap-2">
                            <Printer className="h-4 w-4" />
                            In nhanh
                        </Button>

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
                    <div className="lg:col-span-2">
                        {/* Unified Liveview - Exact same component as Portal & Print */}
                        <div className="bg-white shadow-xl rounded-[2rem] overflow-hidden border border-slate-200">
                            <QuotationPaper quotation={quotation} brandConfig={brandConfig} />
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
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-900 dark:bg-white" />
                                            <div>
                                                <p className="text-sm font-medium">Đã chuyển hợp đồng</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(quotation.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {quotation.status === 'expired' && (
                                        <div className="flex gap-3">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-300" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500">Đã hết hạn</p>
                                                <p className="text-xs text-muted-foreground">Qua hạn {quotation.valid_until && formatDate(quotation.valid_until)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {quotation.rejected_at && (
                                        <div className="flex gap-3">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-400 border border-zinc-500" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-600">Đã từ chối</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(quotation.rejected_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {quotation.accepted_at && (
                                        <div className="flex gap-3">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Đã chấp nhận</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(quotation.accepted_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {quotation.viewed_at && (
                                        <div className="flex gap-3">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-600" />
                                            <div>
                                                <p className="text-sm font-medium">Khách hàng đã xem</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(quotation.viewed_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {quotation.status === 'sent' && !quotation.viewed_at && (
                                        <div className="flex gap-3">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-zinc-500" />
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

            {/* Hidden content for printing - EXACTLY matches portal aesthetics */}
            <div className="hidden print:block">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .quotation-inner { padding: 40px !important; }
                    }
                ` }} />
                <QuotationPaper quotation={quotation} brandConfig={brandConfig} />
            </div>
        </div>
    )
}
