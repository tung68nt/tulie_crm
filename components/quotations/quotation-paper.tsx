
'use client'

import React from 'react'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Building2, Receipt, Layout, Info, CreditCard, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface QuotationPaperProps {
    quotation: any
    brandConfig?: any
}

export function QuotationPaper({ quotation, brandConfig }: QuotationPaperProps) {
    if (!quotation) return null

    const items = quotation.items || []

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

    return (
        <div className="quotation-inner">
            {/* Premium Header Section */}
            <div className="bg-zinc-950 text-white p-8 mb-8 rounded-b-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {/* Brand/Company Info */}
                    <div className="space-y-4 max-w-md">
                        {brandConfig?.logo_url ? (
                            <img src={brandConfig.logo_url} alt="Logo" className="h-10 w-auto invert brightness-0" />
                        ) : (
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic">{brandConfig?.brand_name || 'TULIE STUDIO'}</h1>
                        )}
                        <div className="space-y-1 text-xs text-zinc-400 font-medium">
                            <p className="flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                {brandConfig?.company_address || 'Hanoi, Vietnam'}
                            </p>
                            <p className="flex items-center gap-2">
                                <Info className="h-3 w-3" />
                                {brandConfig?.company_email || 'hello@tuliestudio.com'} — {brandConfig?.company_phone || '098.898.4554'}
                            </p>
                        </div>
                    </div>

                    {/* Quotation Summary Badge */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex flex-col md:items-end min-w-[200px]">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Quotation Document</div>
                        <h2 className="text-2xl font-black tabular-nums tracking-tight mb-2">#{quotation.quotation_number}</h2>
                        <div className="h-px w-full bg-white/10 mb-2" />
                        <div className="flex flex-col md:items-end gap-0.5">
                            <p className="text-xs text-zinc-400 font-medium">Ngày lập: <span className="text-white font-bold">{formatDate(quotation.created_at)}</span></p>
                            <p className="text-xs text-zinc-400 font-medium">Hết hạn: <span className="text-white font-bold">{quotation.valid_until ? formatDate(quotation.valid_until) : '30 ngày'}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-10 space-y-6">
                {/* Customer Info Card */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Building2 className="h-5 w-5" />
                            Thông tin khách hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Đơn vị</p>
                                <p className="font-bold text-lg text-slate-900">{quotation.customer?.company_name}</p>
                                <p className="text-sm text-muted-foreground mt-2">Địa chỉ</p>
                                <p className="text-sm">{quotation.customer?.address || 'N/A'}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Email:</span>
                                    <span className="font-semibold">{quotation.customer?.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Điện thoại:</span>
                                    <span className="font-semibold">{quotation.customer?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Proposal Content - Premium Timeline Style */}
                {hasProposal && proposalSections.length > 0 && (
                    <Card className="overflow-hidden border-slate-200 p-0 gap-0">
                        <CardHeader className="bg-zinc-950 py-4 px-5 text-white relative rounded-none border-b-0">
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
                            <div className="relative pl-8 before:absolute before:left-[11px] before:top-[23px] before:bottom-2 before:w-[2px] before:bg-slate-200 before:rounded-full">
                                {proposalSections.map((section, idx) => {
                                    const icon = sectionIcons[section.key] || <Info className="w-4 h-4" />;
                                    return (
                                        <div key={idx} className="proposal-section relative mb-5 last:mb-0">
                                            <div className="absolute -left-8 top-[23px] -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-white bg-zinc-900 text-[9px] font-bold z-10">
                                                {idx + 1}
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                                <div className="flex items-center gap-2.5 px-4 py-2.5 border-b bg-slate-50 border-slate-100 text-zinc-900">
                                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 text-white ">
                                                        {icon}
                                                    </span>
                                                    <h4 className="text-[13px] font-bold leading-tight">
                                                        {section.label}
                                                    </h4>
                                                </div>
                                                <div className="px-4 py-3 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
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
                <Card className="overflow-hidden border-slate-200 p-0 gap-0">
                    <CardHeader className="bg-zinc-950 py-4 px-5 text-white relative rounded-none border-b-0">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")" }}>
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base font-bold text-white">Chi tiết hạng mục</CardTitle>
                                    <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">Quotation Items</div>
                                </div>
                                <CardDescription className="text-[11px] text-zinc-400 mt-0.5">Chi tiết các hạng mục và chi phí dịch vụ</CardDescription>
                            </div>
                            <Receipt className="h-5 w-5 text-zinc-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table className="table-fixed w-full">
                            <TableHeader className="bg-zinc-950">
                                <TableRow className="border-b-zinc-800 hover:bg-zinc-950">
                                    <TableHead className="w-[40px] text-center py-3 font-bold text-white text-[10px] uppercase tracking-wider">#</TableHead>
                                    <TableHead className="py-3 font-bold text-white text-[10px] uppercase tracking-wider">Hạng mục & Mô tả</TableHead>
                                    <TableHead className="w-[80px] text-center py-3 font-bold text-white text-[10px] uppercase tracking-wider">ĐVT</TableHead>
                                    <TableHead className="w-[60px] text-center py-3 font-bold text-white text-[10px] uppercase tracking-wider">SL</TableHead>
                                    <TableHead className="w-[120px] text-right py-3 font-bold text-white text-[10px] uppercase tracking-wider">Đơn giá</TableHead>
                                    <TableHead className="w-[140px] text-right pr-6 py-3 font-bold text-white text-[10px] uppercase tracking-wider">Thành tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(() => {
                                    let globalItemIndex = 0;
                                    const sections: Record<string, any[]> = (quotation.items || []).reduce((acc: any, item: any) => {
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
                                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                    <TableCell colSpan={6} className="px-5 py-2.5 border-b border-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-white text-[10px] font-bold">
                                                                {sIdx + 1}
                                                            </div>
                                                            <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                                                                {sectionName || `Nhóm dịch vụ ${sIdx + 1}`}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {sectionItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((item, iIdx) => {
                                                const currentGlobalIdx = ++globalItemIndex;
                                                return (
                                                    <TableRow key={item.id} className="hover:bg-slate-50/50 group/row border-b border-slate-100 last:border-0 h-auto">
                                                        <TableCell className="text-center py-4 bg-slate-50/20 font-bold border-r border-slate-50 text-slate-400 group-hover/row:text-zinc-900">
                                                            <span className="text-[10px] tabular-nums">{currentGlobalIdx}</span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-4 align-top overflow-hidden">
                                                            <p className="font-bold text-slate-900 text-[13px] leading-tight mb-1">{item.product_name}</p>
                                                            {item.description && (
                                                                <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line font-medium border-l-2 border-slate-200 pl-3">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 text-slate-600 text-[12px] font-medium border-l border-slate-50/50">
                                                            {item.unit}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 font-bold text-slate-900 text-[12px] border-l border-slate-50/50">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell className="text-right py-4 tabular-nums font-bold text-slate-900 text-[12px] border-l border-slate-50/50">
                                                            {formatCurrency(item.unit_price || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold pr-6 py-4 tabular-nums bg-slate-50/30 text-[13px] border-l border-slate-50/50">
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

                        <div className="border-t p-6 bg-white">
                            <div className="flex justify-end">
                                <div className="w-full max-w-xs space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tạm tính:</span>
                                        <span className="font-semibold">{formatCurrency(quotation.subtotal || 0)}</span>
                                    </div>
                                    {(quotation.discount_amount || 0) > 0 && (
                                        <div className="flex justify-between text-sm text-destructive font-medium">
                                            <span>Chiết khấu ({quotation.discount_percent || 0}%):</span>
                                            <span>-{formatCurrency(quotation.discount_amount || 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">VAT ({quotation.vat_percent || 0}%):</span>
                                        <span className="font-semibold">{formatCurrency(quotation.vat_amount || 0)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-lg text-slate-900">Tổng cộng:</span>
                                        <span className="font-bold text-2xl text-primary">{formatCurrency(quotation.total_amount || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Terms & Bank Card */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Ghi chú & Điều khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ghi chú</p>
                                <div className="text-sm bg-muted/30 p-3 rounded-lg border border-dashed border-slate-300">
                                    <ul className="list-none space-y-1 text-slate-600 font-medium">
                                        {String(quotation.notes || brandConfig?.default_notes || 'Không có ghi chú')
                                            .split('\n')
                                            .filter(Boolean)
                                            .map((line, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-slate-400">•</span>
                                                    <span className="whitespace-pre-line text-slate-900">{line.replace(/^[-•]\s*/, '')}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điều khoản thanh toán</p>
                                <div className="text-sm bg-muted/30 p-3 rounded-lg border border-dashed border-slate-300">
                                    <ul className="list-none space-y-1 text-slate-600 font-medium">
                                        {String(quotation.terms || brandConfig?.default_payment_terms || 'Theo quy định công ty')
                                            .split('\n')
                                            .filter(Boolean)
                                            .map((line, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-slate-400">•</span>
                                                    <span className="whitespace-pre-line text-slate-900">{line.replace(/^[-•]\s*/, '')}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                                <CreditCard className="h-4 w-4" />
                                Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ngân hàng</span>
                                    <span className="font-bold text-slate-900">{quotation.bank_name || brandConfig?.bank_name || "Chưa cấu hình"}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Số tài khoản</span>
                                    <span className="font-mono text-base font-bold text-primary">{quotation.bank_account_no || brandConfig?.bank_account_no || "Chưa cấu hình"}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chủ tài khoản</span>
                                    <span className="font-bold text-slate-900 uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name || "Chưa cấu hình"}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chi nhánh</span>
                                    <span className="font-semibold text-slate-700">{quotation.bank_branch || brandConfig?.bank_branch || "Chưa cấu hình"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
