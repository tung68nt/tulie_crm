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
        <div className="bg-white p-[2cm] min-h-[297mm] text-black font-serif leading-normal overflow-hidden print:p-0">
            {/* Header following administrative style */}
            <div className="flex justify-between items-start mb-8">
                {/* Left Side: Company Contact Info */}
                <div className="w-[45%] text-center">
                    <h3 className="text-[12px] font-bold uppercase mb-1">Công ty TNHH Dịch vụ và Giải pháp</h3>
                    <h2 className="text-[14px] font-extrabold uppercase mb-2 border-b-2 border-black inline-block pb-0.5">Công nghệ Tulie</h2>
                    <div className="mt-3 text-[10px] space-y-1 text-left">
                        <p><span className="font-bold">Địa chỉ:</span> Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Q. Hà Đông, Hà Nội</p>
                        <p><span className="font-bold">MST:</span> 0110163102</p>
                        <p><span className="font-bold">Hotline:</span> 098.898.4554 - 08.6683.9791</p>
                        <p><span className="font-bold">Email:</span> hi@tulie.vn - <span className="font-bold">Website:</span> tulie.vn</p>
                    </div>
                </div>

                {/* Right Side: Replaces National Motto with Logo & Big Name */}
                <div className="w-[50%] flex flex-col items-center">
                    <img src="/file/tulie-agency-logo.png" alt="Tulie" className="h-16 w-auto mb-2 object-contain" />
                    <h1 className="text-[20px] font-extrabold uppercase text-center tracking-tighter leading-tight">
                        Quotation Management
                    </h1>
                    <div className="w-32 h-0.5 bg-black mt-2" />
                </div>
            </div>

            {/* Document Meta */}
            <div className="flex justify-between items-center mb-10 mt-6 italic text-[11px]">
                <div>
                    <span className="font-bold">Số:</span> {quotation.quotation_number}
                </div>
                <div>
                    Hà Nội, ngày {day} tháng {month} năm {year}
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="text-[28px] font-extrabold uppercase tracking-widest">Báo giá dịch vụ</h1>
                <p className="text-[12px] mt-1 italic">(V/v: Cung cấp giải pháp {quotation.title || 'Marketing & Công nghệ'})</p>
            </div>

            {/* Receiver Section */}
            <div className="mb-8 space-y-3">
                <p className="font-bold text-[13px]">Kính gửi: <span className="uppercase">{quotation.customer?.company_name || quotation.customer?.name}</span></p>
                <div className="grid grid-cols-1 gap-2 text-[12px] ml-4">
                    <p><span className="inline-block w-32 font-medium">Người đại diện:</span> <span className="font-bold">{quotation.customer?.representative || '................................'}</span></p>
                    <p><span className="inline-block w-32 font-medium">Địa chỉ:</span> {quotation.customer?.address || '................................'}</p>
                    <p><span className="inline-block w-32 font-medium">Số điện thoại:</span> {quotation.customer?.phone || '................................'}</p>
                    <p><span className="inline-block w-32 font-medium">Email:</span> {quotation.customer?.email || '................................'}</p>
                </div>
            </div>

            <p className="text-[12px] mb-6 mb-4 indent-8">
                Lời đầu tiên, <span className="font-bold">Công ty Công nghệ Tulie</span> xin gửi tới Quý đối tác lời chào trân trọng và lời chúc sức khỏe. Căn cứ vào nhu cầu của Quý khách, chúng tôi xin gửi tới Quý khách bảng báo giá chi tiết như sau:
            </p>

            {/* Main Items Table */}
            <table className="w-full border-collapse border border-black text-[12px] mb-8">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-black py-2 px-1 text-center w-10">#</th>
                        <th className="border border-black py-2 px-3 text-left">Dịch vụ & Hạng mục chi tiết</th>
                        <th className="border border-black py-2 px-1 text-center w-16">ĐVT</th>
                        <th className="border border-black py-2 px-1 text-center w-12">SL</th>
                        <th className="border border-black py-2 px-3 text-right w-28">Đơn giá</th>
                        <th className="border border-black py-2 px-3 text-right w-32">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                        <React.Fragment key={sectionName || sIdx}>
                            {sectionName && (
                                <tr className="bg-gray-100">
                                    <td colSpan={6} className="border border-black py-1.5 px-3 font-bold uppercase text-[10px]">
                                        {sectionName}
                                    </td>
                                </tr>
                            )}
                            {sectionItems.map((item: any, iIdx: number) => (
                                <tr key={item.id}>
                                    <td className="border border-black py-2 px-1 text-center align-top">{iIdx + 1}</td>
                                    <td className="border border-black py-2 px-3 align-top">
                                        <p className="font-bold mb-1 uppercase">{item.name}</p>
                                        {item.description && <p className="text-[10px] text-gray-600 whitespace-pre-line italic leading-snug">{item.description}</p>}
                                    </td>
                                    <td className="border border-black py-2 px-1 text-center align-top">{item.unit || 'Bộ'}</td>
                                    <td className="border border-black py-2 px-1 text-center align-top">{item.quantity}</td>
                                    <td className="border border-black py-2 px-3 text-right align-top">{formatCurrency(item.unit_price).replace('₫', '')}</td>
                                    <td className="border border-black py-2 px-3 text-right align-top font-medium">{formatCurrency(item.total_price || (item.quantity * item.unit_price)).replace('₫', '')}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    {/* Summary Rows */}
                    <tr>
                        <td colSpan={5} className="border border-black py-2 px-3 text-right font-bold">Tổng tiền dịch vụ (Sub-total):</td>
                        <td className="border border-black py-2 px-3 text-right font-bold">{formatCurrency(quotation.subtotal || 0).replace('₫', '')}</td>
                    </tr>
                    {quotation.vat_amount > 0 && (
                        <tr>
                            <td colSpan={5} className="border border-black py-2 px-3 text-right font-medium">Thuế VAT (8% - 10%):</td>
                            <td className="border border-black py-2 px-3 text-right font-medium">{formatCurrency(quotation.vat_amount).replace('₫', '')}</td>
                        </tr>
                    )}
                    <tr className="bg-gray-50">
                        <td colSpan={5} className="border border-black py-3 px-3 text-right font-extrabold text-[14px]">Tổng cộng thanh toán (Total Payment):</td>
                        <td className="border border-black py-3 px-3 text-right font-extrabold text-[14px]">{formatCurrency(quotation.total_amount).replace('₫', '')} VNĐ</td>
                    </tr>
                </tbody>
            </table>

            {/* Amount in words */}
            <div className="mb-10 text-[12px] italic">
                <span className="font-bold underline">Bằng chữ:</span> {readNumberToWords(quotation.total_amount)}
            </div>

            {/* Terms & Conditions */}
            <div className="mb-12 space-y-4">
                <h4 className="text-[13px] font-bold uppercase underline">Điều khoản & Ghi chú (Terms & Conditions):</h4>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] ml-4">
                    <p>1. <span className="font-extrabold">Phương thức thanh toán:</span> Chuyển khoản hoặc Tiền mặt.</p>
                    <p>2. <span className="font-extrabold">Thời gian thực hiện:</span> Theo thỏa thuận chi tiết trong phụ lục hợp đồng.</p>
                    <p>3. <span className="font-extrabold">Hiệu lực báo giá:</span> Trong vòng 30 ngày kể từ ngày ban hành văn bản này.</p>
                    <p>4. Báo giá trên chưa bao gồm phí phát sinh ngoài phạm vi công việc nêu trên.</p>
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-10 mt-12 text-center text-[12px]">
                <div className="space-y-1">
                    <p className="font-extrabold uppercase">Đại diện khách hàng</p>
                    <p className="italic text-[10px]">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <div className="h-24"></div>
                    <p className="font-bold">........................................</p>
                </div>
                <div className="space-y-1">
                    <p className="font-extrabold uppercase">Đại diện Công ty Tulie</p>
                    <p className="italic text-[10px]">(Ký, ghi rõ họ tên và đóng dấu)</p>
                    <div className="h-24"></div>
                    <p className="font-extrabold text-[14px]">NGUYỄN THANH TÙNG</p>
                    <p className="font-medium">Giám đốc</p>
                </div>
            </div>

            {/* Footer Contact */}
            <div className="mt-20 pt-4 border-t border-gray-200 text-center text-[9px] text-gray-400 font-sans">
                Tulie Agency - Creative Solution & Digital Strategy | Hotline: 098.898.4554 | Website: tulie.vn
            </div>
        </div>
    );
}
