import React from 'react';
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface QuotationDocumentPaperProps {
    quotation: any;
    brandConfig?: any;
}

export function QuotationDocumentPaper({ quotation, brandConfig }: QuotationDocumentPaperProps) {
    const items = quotation.items || [];

    // Group items by section
    const sections: Record<string, any[]> = items.reduce((acc: any, item: any) => {
        const sectionName = item.section_name || '';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionEntries = Object.entries(sections).sort((a, b) => {
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0);
    });

    const day = new Date(quotation.created_at).getDate();
    const month = new Date(quotation.created_at).getMonth() + 1;
    const year = new Date(quotation.created_at).getFullYear();

    return (
        <div className="bg-white p-[2cm] min-h-[297mm] text-black font-sans leading-normal overflow-hidden print:p-0">
            {/* Header following administrative style */}
            <div className="flex gap-4 items-start mb-8 text-left">
                {/* Logo */}
                <img src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"} alt="Tulie" className="h-14 w-auto object-contain grayscale" />

                {/* Company Contact Info */}
                <div>
                    <h3 className="text-[13px] font-bold uppercase mb-1">
                        {brandConfig?.brand_name?.toUpperCase() || "CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE"}
                    </h3>
                    <div className="text-[11px] space-y-0.5 font-normal">
                        <p><span className="font-semibold">Địa chỉ:</span> {brandConfig?.address || "Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Q. Hà Đông, Hà Nội"}</p>
                        <p><span className="font-semibold">MST:</span> {brandConfig?.tax_code || "0110163102"}</p>
                        <p><span className="font-semibold">Hotline:</span> {brandConfig?.phone || "098.898.4554"} - <span className="font-semibold">Email:</span> {brandConfig?.email || "hi@tulie.vn"}</p>
                        <p><span className="font-semibold">Website:</span> {brandConfig?.website || "tulie.vn"}</p>
                    </div>
                </div>
            </div>

            {/* Document Meta */}
            <div className="flex justify-between items-center mb-10 mt-6 italic text-[11px] font-medium">
                <div>
                    <span className="font-bold">Số:</span> #{quotation.quotation_number}
                </div>
                <div>
                    Hà Nội, ngày {day} tháng {month} năm {year}
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="text-[24px] font-bold uppercase">Báo giá dịch vụ</h1>
                <p className="text-[12px] mt-1 italic font-medium">(V/v: Cung cấp giải pháp {quotation.title || 'Marketing & Công nghệ'})</p>
            </div>

            {/* Receiver Section */}
            <div className="mb-8 space-y-3">
                <p className="font-bold text-[13px]">Kính gửi: <span className="uppercase">{quotation.customer?.company_name || quotation.customer?.full_name || quotation.customer?.name}</span></p>
                <div className="grid grid-cols-1 gap-2 text-[12px] ml-4 font-medium">
                    <p><span className="inline-block w-32 font-bold">Người đại diện:</span> {quotation.customer?.representative || quotation.customer?.full_name || '................................'}</p>
                    <p><span className="inline-block w-32 font-bold">Địa chỉ:</span> {quotation.customer?.address || '................................'}</p>
                    <p><span className="inline-block w-32 font-bold">Số điện thoại:</span> {quotation.customer?.phone || '................................'}</p>
                    <p><span className="inline-block w-32 font-bold">Email:</span> {quotation.customer?.email || '................................'}</p>
                </div>
            </div>

            <p className="text-[12px] mb-6 indent-8 font-medium">
                Lời đầu tiên, <span className="font-bold">{brandConfig?.brand_name || "Công ty Công nghệ Tulie"}</span> xin gửi tới Quý đối tác lời chào trân trọng và lời chúc sức khỏe. Căn cứ vào nhu cầu của Quý khách, chúng tôi xin gửi tới Quý khách bảng báo giá chi tiết như sau:
            </p>

            {/* Main Items Table */}
            <table className="w-full border-collapse border border-black text-[12px] mb-8">
                <thead>
                    <tr className="bg-zinc-50 grayscale">
                        <th className="border border-black py-2 px-1 text-center w-10 font-bold">#</th>
                        <th className="border border-black py-2 px-3 text-left font-bold uppercase">
                            Dịch vụ & Hạng mục chi tiết <br />
                            <span className="text-[10px] font-normal opacity-60 normal-case">/ Service & Description</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center w-16 font-bold uppercase text-[10px]">
                            ĐVT <br />
                            <span className="text-[8px] font-normal opacity-60 normal-case">/ Unit</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center w-12 font-bold uppercase text-[10px]">
                            SL <br />
                            <span className="text-[8px] font-normal opacity-60 normal-case">/ Qty</span>
                        </th>
                        <th className="border border-black py-2 px-3 text-right w-30 font-bold uppercase text-[10px]">
                            Đơn giá <br />
                            <span className="text-[8px] font-normal opacity-60 normal-case">/ Unit Price</span>
                        </th>
                        <th className="border border-black py-2 px-3 text-right w-32 font-bold uppercase text-[10px]">
                            Thành tiền <br />
                            <span className="text-[8px] font-normal opacity-60 normal-case">/ Amount</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                        <React.Fragment key={sectionName || sIdx}>
                            {sectionName && (
                                <tr className="bg-zinc-100">
                                    <td colSpan={6} className="border border-black py-1.5 px-3 font-bold uppercase text-[10px]">
                                        {sectionName}
                                    </td>
                                </tr>
                            )}
                            {sectionItems.map((item: any, iIdx: number) => (
                                <tr key={item.id} className="font-medium">
                                    <td className="border border-black py-2 px-1 text-center align-top">{iIdx + 1}</td>
                                    <td className="border border-black py-2 px-3 align-top">
                                        <p className="font-bold mb-1 uppercase">{item.name || item.product_name}</p>
                                        {(item.description) && <p className="text-[10px] text-zinc-600 whitespace-pre-line italic leading-snug">{item.description}</p>}
                                    </td>
                                    <td className="border border-black py-2 px-1 text-center align-top">{item.unit || 'Bộ'}</td>
                                    <td className="border border-black py-2 px-1 text-center align-top font-bold">{item.quantity}</td>
                                    <td className="border border-black py-2 px-3 text-right align-top tabular-nums">{formatCurrency(item.unit_price || 0).replace('₫', '')}</td>
                                    <td className="border border-black py-2 px-3 text-right align-top font-bold tabular-nums">{formatCurrency(item.total_price || (item.quantity * item.unit_price)).replace('₫', '')}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    {/* Summary Rows */}
                    <tr className="font-bold">
                        <td colSpan={5} className="border border-black py-2 px-3 text-right uppercase text-[10px]">Tổng tiền dịch vụ (Sub-total):</td>
                        <td className="border border-black py-2 px-3 text-right tabular-nums">{formatCurrency(quotation.subtotal || 0).replace('₫', '')}</td>
                    </tr>
                    {(quotation.discount_amount > 0) && (
                        <tr className="font-bold text-zinc-600">
                            <td colSpan={5} className="border border-black py-2 px-3 text-right uppercase text-[10px]">Chiết khấu / Discount:</td>
                            <td className="border border-black py-2 px-3 text-right tabular-nums">-{formatCurrency(quotation.discount_amount).replace('₫', '')}</td>
                        </tr>
                    )}
                    {quotation.vat_amount > 0 && (
                        <tr className="font-medium">
                            <td colSpan={5} className="border border-black py-2 px-3 text-right uppercase text-[10px]">Thuế VAT ({quotation.vat_percent || 8}%):</td>
                            <td className="border border-black py-2 px-3 text-right tabular-nums">{formatCurrency(quotation.vat_amount).replace('₫', '')}</td>
                        </tr>
                    )}
                    <tr className="bg-zinc-50">
                        <td colSpan={5} className="border border-black py-3 px-3 text-right font-bold uppercase text-[12px]">Tổng cộng thanh toán (Total Payment):</td>
                        <td className="border border-black py-3 px-3 text-right font-bold text-[14px] tabular-nums underline decoration-2 underline-offset-4">{formatCurrency(quotation.total_amount || 0).replace('₫', '')} VNĐ</td>
                    </tr>
                </tbody>
            </table>

            {/* Amount in words */}
            <div className="mb-10 text-[12px] italic font-medium">
                <span className="font-bold underline uppercase">Bằng chữ:</span> {readNumberToWords(quotation.total_amount || 0)}
            </div>

            {/* Terms & Conditions / Notes */}
            <div className="mb-8 space-y-4">
                <h4 className="text-[13px] font-bold uppercase underline">Điều khoản & Ghi chú (Terms & Conditions):</h4>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] ml-4 font-medium leading-relaxed">
                    <p>1. <span className="font-bold">Phương thức thanh toán:</span> Chuyển khoản hoặc Tiền mặt.</p>
                    <p>2. <span className="font-bold">Thời gian thực hiện:</span> Theo thỏa thuận chi tiết trong phụ lục hợp đồng.</p>
                    <p>3. <span className="font-bold">Hiệu lực báo giá:</span> Trong vòng 30 ngày kể từ ngày ban hành văn bản này.</p>
                    {quotation.notes && (
                        <div className="mt-2 text-zinc-700 whitespace-pre-line italic">
                            {quotation.notes}
                        </div>
                    )}
                    {brandConfig?.default_payment_terms && (
                        <div className="mt-2 text-zinc-700 whitespace-pre-line italic">
                            {brandConfig.default_payment_terms}
                        </div>
                    )}
                </div>
            </div>

            {/* Banking Info Section */}
            <div className="mb-12 p-5 border border-black bg-zinc-50 grayscale">
                <h4 className="text-[13px] font-bold uppercase underline mb-4">Thông tin chuyển khoản (Payment Information):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[12px] ml-4 font-medium">
                    <div className="space-y-2">
                        <p><span className="font-bold">Chủ tài khoản:</span> <span className="uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name || 'CÔNG TY TNHH TULIE'}</span></p>
                        <p><span className="font-bold">Số tài khoản:</span> <span className="text-[14px] font-bold">{quotation.bank_account_no || brandConfig?.bank_account_no || '0110163102'}</span></p>
                    </div>
                    <div className="space-y-2">
                        <p><span className="font-bold">Ngân hàng:</span> {quotation.bank_name || brandConfig?.bank_name || 'MB BANK'}</p>
                        <p><span className="font-bold">Chi nhánh:</span> {quotation.bank_branch || brandConfig?.bank_branch || 'SỞ GIAO DỊCH'}</p>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-10 mt-12 text-center text-[12px]">
                <div className="space-y-1">
                    <p className="font-bold uppercase text-zinc-950">Đại diện khách hàng</p>
                    <p className="italic text-[10px] text-zinc-400">(Ký & ghi rõ họ tên / Customer Signature)</p>
                    <div className="h-24"></div>
                    <div className="h-px w-32 bg-zinc-200 mx-auto" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold uppercase text-zinc-950">Đại diện {brandConfig?.brand_name || "Công ty Tulie"}</p>
                    <p className="font-bold uppercase text-zinc-950 mt-1">Giám đốc</p>
                    <p className="italic text-[10px] text-zinc-400">(Ký & đóng dấu / Authorized Signature)</p>
                    <div className="h-28 flex items-center justify-center opacity-10 grayscale">
                        <img src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"} alt="Seal" className="h-16 w-auto" />
                    </div>
                </div>
            </div>

            {/* Footer Contact */}
            <div className="mt-auto pt-8 border-t border-zinc-100 text-center text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                {brandConfig?.brand_name || "Tulie Agency"} - Creative Solution & Digital Strategy | Hotline: {brandConfig?.phone || "098.898.4554"} | Website: {brandConfig?.website || "tulie.vn"}
            </div>
        </div>
    );
}
