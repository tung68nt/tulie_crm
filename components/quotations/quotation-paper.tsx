
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
        <div className="quotation-inner bg-white">
            {/* Premium Header Section - Bilingual & Full Info */}
            <div className="p-8 pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0 opacity-50" />

                {/* Tulie Company Info (Left) */}
                <div className="relative z-10 space-y-3 max-w-xl">
                    <div className="space-y-1">
                        <h1 className="text-[15px] font-bold text-slate-900 uppercase">
                            {brandConfig?.company_full_name || 'Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie'}
                        </h1>
                    </div>

                    <div className="space-y-1.5 text-[12px] text-slate-600 font-medium">
                        <p className="flex items-start gap-3">
                            <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>{brandConfig?.company_address || 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam'}</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{brandConfig?.company_phone || '098.898.4554'}</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Info className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{brandConfig?.company_email || 'info@tulie.vn'}</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Receipt className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>MST/ Tax Code: {brandConfig?.tax_code || '0110163102'}</span>
                        </p>
                    </div>
                </div>

                {/* Quotation Summary (Right) - Bilingual */}
                <div className="relative z-10 text-right space-y-1 min-w-[220px]">
                    <div className="flex flex-col items-end gap-1 mb-3">
                        {brandConfig?.logo_url ? (
                            <img src={brandConfig.logo_url} alt="Logo" className="h-10 w-auto" />
                        ) : (
                            <span className="text-2xl font-black tracking-tighter text-slate-900 italic">TULIE</span>
                        )}
                    </div>
                    <p className="text-[12px] font-medium text-slate-500">
                        Số/ No: <span className="text-slate-900 font-bold ml-1">#{quotation.quotation_number}</span>
                    </p>
                    <p className="text-[12px] font-medium text-slate-500">
                        Ngày/ Date: <span className="text-slate-900 font-bold ml-1">{formatDate(quotation.created_at)}</span>
                    </p>
                    <p className="text-[12px] font-medium text-slate-500">
                        Hết hạn/ Valid until: <span className="text-slate-900 font-bold ml-1">{quotation.valid_until ? formatDate(quotation.valid_until) : '21/03/2026'}</span>
                    </p>
                </div>
            </div>

            <div className="px-8 py-8 space-y-8">
                {/* Customer Info Card - Bilingual */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-tight border-l-4 border-slate-900 pl-3">
                        Thông tin khách hàng<span className="text-slate-400 font-medium ml-1 text-[12px] normal-case">/ Customer</span>
                    </h3>

                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 grid gap-4 grid-cols-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-slate-500 text-[12px] font-medium min-w-[120px]">Đơn vị/ <span className="text-slate-400">Company:</span></span>
                            <span className="text-slate-900 text-[14px] font-bold">{quotation.customer?.company_name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-slate-500 text-[12px] font-medium min-w-[120px]">Địa chỉ/ <span className="text-slate-400">Address:</span></span>
                            <span className="text-slate-900 text-[13px] font-medium">{quotation.customer?.address || 'Hanoi, Vietnam'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-slate-500 text-[12px] font-medium min-w-[120px]">Người liên hệ/ <span className="text-slate-400">Attn:</span></span>
                            <span className="text-slate-900 text-[13px] font-medium">{quotation.customer?.contact_person || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Proposal Content */}
                {hasProposal && proposalSections.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-tight border-l-4 border-slate-900 pl-3">
                            Đề xuất giải pháp<span className="text-slate-400 font-medium ml-1 text-[12px] normal-case">/ Proposal</span>
                        </h3>
                        <div className="relative pl-8 before:absolute before:left-[11px] before:top-4 before:bottom-0 before:w-[2px] before:bg-slate-100">
                            {proposalSections.map((section, idx) => {
                                const icon = sectionIcons[section.key] || <Info className="w-4 h-4" />;
                                return (
                                    <div key={idx} className="relative mb-6 last:mb-0">
                                        <div className="absolute -left-8 top-1 translate-y-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-900 text-white z-10 border-4 border-white shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                                {icon}
                                                {section.label}
                                            </h4>
                                            <div className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-line pl-6">
                                                {pc[section.key]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Items Card - Bilingual Table */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-tight border-l-4 border-slate-900 pl-3">
                        Chi tiết hạng mục<span className="text-slate-400 font-medium ml-1 text-[12px] normal-case">/ Quotation Items</span>
                    </h3>

                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        <Table className="table-fixed w-full">
                            <TableHeader className="bg-slate-900">
                                <TableRow className="hover:bg-slate-900 border-none">
                                    <TableHead className="w-[40px] text-center text-white text-[10px] font-bold tracking-wider uppercase">#</TableHead>
                                    <TableHead className="text-white text-[10px] font-bold tracking-wider uppercase">Hạng mục & Mô tả/ <span className="text-slate-400">Items & Description</span></TableHead>
                                    <TableHead className="w-[80px] text-center text-white text-[10px] font-bold tracking-wider uppercase">ĐVT/ <span className="text-slate-400">Unit</span></TableHead>
                                    <TableHead className="w-[60px] text-center text-white text-[10px] font-bold tracking-wider uppercase">SL/ <span className="text-slate-400">Qty</span></TableHead>
                                    <TableHead className="w-[120px] text-right text-white text-[10px] font-bold tracking-wider uppercase">Đơn giá/ <span className="text-slate-400">Unit Price</span></TableHead>
                                    <TableHead className="w-[140px] text-right pr-6 text-white text-[10px] font-bold tracking-wider uppercase">Thành tiền/ <span className="text-slate-400">Amount</span></TableHead>
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
                                                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                                                    <TableCell colSpan={6} className="px-5 py-2">
                                                        <span className="text-[11px] font-bold text-slate-800 uppercase">
                                                            {sectionName || `Nhóm dịch vụ ${sIdx + 1}`}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {sectionItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((item, iIdx) => {
                                                const currentGlobalIdx = ++globalItemIndex;
                                                return (
                                                    <TableRow key={item.id} className="hover:bg-slate-50/30 border-b border-slate-100 last:border-0 group">
                                                        <TableCell className="text-center py-4 text-[10px] font-bold text-slate-400 group-hover:text-slate-900 border-r border-slate-50">
                                                            {currentGlobalIdx}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-4 align-top">
                                                            <p className="font-bold text-slate-900 text-[13px] leading-tight mb-1">{item.product_name}</p>
                                                            {item.description && (
                                                                <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line font-medium pl-3 border-l-2 border-slate-100">
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
                                                        <TableCell className="text-right py-4 font-bold text-slate-900 text-[12px] border-l border-slate-50/50 tabular-nums">
                                                            {formatCurrency(item.unit_price || 0)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-black pr-6 py-4 bg-slate-50/30 text-[13px] text-slate-900 border-l border-slate-50/50 tabular-nums">
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

                        <div className="bg-slate-50/50 p-8 border-t border-slate-100 flex justify-end">
                            <div className="w-full max-w-xs space-y-4">
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">Tạm tính/ <span className="text-slate-400">Subtotal:</span></span>
                                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(quotation.subtotal || 0)}</span>
                                </div>
                                {(quotation.discount_amount || 0) > 0 && (
                                    <div className="flex justify-between items-center text-[12px] text-destructive">
                                        <span className="font-medium uppercase tracking-wider">Chiết khấu ({quotation.discount_percent || 0}%):</span>
                                        <span className="font-bold tabular-nums">-{formatCurrency(quotation.discount_amount || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">VAT ({quotation.vat_percent || 0}%):</span>
                                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(quotation.vat_amount || 0)}</span>
                                </div>
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-[14px] text-slate-900 uppercase">Tổng cộng/ <span className="text-slate-400 font-bold">Total:</span></span>
                                    <span className="font-black text-2xl text-slate-900 tabular-nums">{formatCurrency(quotation.total_amount || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms & Bank Info - Bilingual */}
                <div className="grid gap-8 sm:grid-cols-2 pt-4">
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-tight border-l-4 border-slate-900 pl-3">
                            Ghi chú & Điều khoản<span className="text-slate-400 font-medium ml-1 text-[12px] normal-case">/ Notes & Terms</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Ghi chú/ Notes</p>
                                <ul className="list-none space-y-1.5 pl-3">
                                    {String(quotation.notes || brandConfig?.default_notes || 'N/A')
                                        .split('\n')
                                        .filter(Boolean)
                                        .map((line, i) => (
                                            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-600 font-medium">
                                                <span className="text-slate-300">•</span>
                                                <span className="whitespace-pre-line text-slate-800">{line.replace(/^[-•]\s*/, '')}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Điều khoản/ Terms</p>
                                <ul className="list-none space-y-1.5 pl-3">
                                    {String(quotation.terms || brandConfig?.default_payment_terms || 'N/A')
                                        .split('\n')
                                        .filter(Boolean)
                                        .map((line, i) => (
                                            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-slate-600 font-medium">
                                                <span className="text-slate-300">•</span>
                                                <span className="whitespace-pre-line text-slate-800">{line.replace(/^[-•]\s*/, '')}</span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-tight border-l-4 border-slate-900 pl-3">
                            Thông tin thanh toán<span className="text-slate-400 font-medium ml-1 text-[12px] normal-case">/ Payment Info</span>
                        </h3>
                        <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngân hàng/ Bank</span>
                                <p className="text-[13px] font-bold text-white">{quotation.bank_name || brandConfig?.bank_name || "Chưa cấu hình"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Số tài khoản/ Account No</span>
                                <p className="text-lg font-black tracking-wider text-white font-mono">{quotation.bank_account_no || brandConfig?.bank_account_no || "Chưa cấu hình"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Chủ tài khoản/ Account Name</span>
                                <p className="text-[13px] font-black text-white uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name || "Chưa cấu hình"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Chi nhánh/ Branch</span>
                                <p className="text-[12px] font-bold text-slate-300">{quotation.bank_branch || brandConfig?.bank_branch || "Chưa cấu hình"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
