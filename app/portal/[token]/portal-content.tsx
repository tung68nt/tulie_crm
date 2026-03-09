'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    CheckCircle2,
    Clock,
    FileText,
    Box,
    Building2,
    FileSignature,
    PenTool,
    Target,
    Mail,
    Info,
    Globe,
    FilePenLine,
    UserCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CustomerInfoForm } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PortalContentProps {
    data: any
    token: string
}

const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full"
    switch (status) {
        case 'accepted':
        case 'active':
        case 'completed':
        case 'paid':
        case 'signed':
            return <Badge className={cn(baseClass, "bg-neutral-900 text-white border-neutral-900")}>Hoàn thành</Badge>
        case 'sent':
        case 'in_progress':
        case 'partial_paid':
            return <Badge className={cn(baseClass, "bg-white text-neutral-900 border-neutral-900")}>Đang xử lý</Badge>
        case 'pending':
        case 'draft':
            return <Badge variant="outline" className={cn(baseClass, "border-neutral-200 text-neutral-400")}>Chờ duyệt</Badge>
        default:
            return <Badge variant="outline" className={cn(baseClass, "border-neutral-200 text-neutral-400")}>{status}</Badge>
    }
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const { quotation, customer } = data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    return (
        <div className="min-h-screen bg-neutral-50/50 font-sans text-neutral-900 pb-20 selection:bg-black selection:text-white">
            {/* Header / Hero */}
            <div className="bg-white border-b border-neutral-200 pt-12 pb-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <img
                            src="/file/tulie-agency-logo.png"
                            alt="Logo"
                            className="h-12 w-auto object-contain"
                        />
                        <div className="w-px h-10 bg-neutral-200" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Portal portal</h1>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Trang quản trị khách hàng</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h2 className="text-xl font-bold text-neutral-900 uppercase">{customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[9px] font-bold text-neutral-600 uppercase">Đang triển khai</span>
                            </div>
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">#{quotation.quotation_number}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10">
                <Tabs defaultValue="overview" className="space-y-10">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-neutral-200/50 p-1 rounded-xl">
                            <TabsTrigger
                                value="overview"
                                className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                            >
                                Tổng quan dự án
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                            >
                                Chi tiết dữ liệu
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-10 outline-none">
                        {/* Summary Notice */}
                        <div className="bg-neutral-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-lg font-bold tracking-tight">Cần cập nhật thông tin?</h3>
                                <p className="text-sm text-neutral-400 max-w-md">Vui lòng kiểm tra và cập nhật thông tin xuất hóa đơn hoặc yêu cầu thay đổi trực tiếp tại đây.</p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="relative z-10 bg-white text-neutral-900 hover:bg-neutral-200 font-bold rounded-xl px-8 h-12 shadow-xl shadow-white/5">
                                        Cập nhật ngay
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="bg-neutral-900 text-white p-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold tracking-tight">Cập nhật hồ sơ khách hàng</DialogTitle>
                                            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">Customer Information & Identity</p>
                                        </DialogHeader>
                                    </div>
                                    <div className="p-8">
                                        <CustomerInfoForm
                                            customer={customer}
                                            token={token}
                                            onComplete={() => {
                                                setIsDialogOpen(false)
                                                router.refresh()
                                                toast.success('Đã cập nhật thông tin thành công!')
                                            }}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Abstract Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-32" />
                        </div>

                        {/* Project Brief Section */}
                        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
                                <h3 className="text-xs font-bold uppercase tracking-wider">Đề xuất giải pháp & Chiến lược</h3>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            <Target className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Mục tiêu dự án</span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-neutral-600 font-medium italic border-l-2 border-neutral-200 pl-4 py-1">
                                            {typeof quotation.proposal_content === 'string'
                                                ? JSON.parse(quotation.proposal_content || '{}').goals
                                                : quotation.proposal_content?.goals || "Dự án đang được khởi tạo chi tiết mục tiêu."}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            <Box className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Kết quả bàn giao</span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-neutral-600 font-medium italic border-l-2 border-neutral-200 pl-4 py-1">
                                            {typeof quotation.proposal_content === 'string'
                                                ? JSON.parse(quotation.proposal_content || '{}').deliverables
                                                : quotation.proposal_content?.deliverables || "Sản phẩm bàn giao đang được cập nhật."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'TỔNG ĐẦU TƯ', value: formatCurrency(quotation.total_amount), sub: 'Total Investment', icon: <div className="w-1.5 h-1.5 rounded-full bg-black" /> },
                                { label: 'ĐÃ THANH TOÁN', value: formatCurrency(0), sub: 'Already Paid', icon: <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> },
                                { label: 'CÒN LẠI', value: formatCurrency(quotation.total_amount), sub: 'Balance Due', icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> },
                                { label: 'TIẾN ĐỘ', value: '15%', sub: 'Execution Progress', icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">{stat.label}</span>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                                        <div className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase mt-0.5">{stat.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Grid: Timeline & Items */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                            {/* Left: Timeline */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Tiến trình triển khai</h3>
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">timeline</span>
                                </div>
                                <div className="relative space-y-4 pl-4 border-l-2 border-neutral-200 ml-2">
                                    {(quotation.proposal_sections || []).length > 0 ? (
                                        quotation.proposal_sections.map((item: any, idx: number) => (
                                            <div key={idx} className="relative pb-6 last:pb-0">
                                                <div className="absolute -left-[25px] top-0 h-4 w-4 rounded-full bg-white border-2 border-neutral-900" />
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Giai đoạn {idx + 1}</p>
                                                    <h4 className="text-xs font-bold uppercase tracking-tight">{item.label}</h4>
                                                    <p className="text-[11px] text-neutral-500 line-clamp-2 italic">{item.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                                            <p className="text-[10px] italic text-neutral-400 uppercase tracking-widest font-bold">Đang cập nhật lộ trình</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Items Summary */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Hạng mục dịch vụ đầu tư</h3>
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">services summary</span>
                                </div>
                                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr className="bg-neutral-50/50 border-b border-neutral-100">
                                                <th className="py-4 px-6 font-bold uppercase text-neutral-400 tracking-wider">Hạng mục</th>
                                                <th className="py-4 px-6 font-bold uppercase text-neutral-400 tracking-wider text-center">SL</th>
                                                <th className="py-4 px-6 font-bold uppercase text-neutral-400 tracking-wider text-right">Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {quotation.items?.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-neutral-50/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold uppercase tracking-tight">{item.name}</div>
                                                        {item.description && <div className="text-[9px] text-neutral-400 mt-0.5 line-clamp-1 italic">{item.description}</div>}
                                                    </td>
                                                    <td className="py-4 px-6 text-center font-bold">{item.quantity}</td>
                                                    <td className="py-4 px-6 text-right font-bold">{formatCurrency(item.unit_price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="pt-4 outline-none">
                        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                <h3 className="text-xs font-bold uppercase tracking-wider">Hệ thống hồ sơ & Chứng từ</h3>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase border-neutral-200">Bộ lọc</Button>
                                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase border-neutral-200">Tải xuống</Button>
                                </div>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                        <tr className="bg-neutral-50/50 border-b border-neutral-100">
                                            <th className="py-4 px-8 font-bold text-neutral-400 uppercase tracking-widest">Loại hồ sơ</th>
                                            <th className="py-4 px-6 font-bold text-neutral-400 uppercase tracking-widest text-center">Trạng thái</th>
                                            <th className="py-4 px-8 font-bold text-neutral-400 uppercase tracking-widest text-right">Review</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        <tr className="hover:bg-neutral-50/30 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-lg shadow-black/10">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold uppercase tracking-tight">Báo giá dịch vụ & Đề xuất</div>
                                                        <div className="text-[9px] text-neutral-400 font-bold mt-0.5 tracking-wider">#{quotation.quotation_number} • {formatDate(quotation.created_at)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 text-center">
                                                {getStatusBadge(quotation.status)}
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <Button size="sm" variant="outline" className="h-9 rounded-xl border-neutral-200 px-4 font-bold text-[10px] uppercase group-hover:bg-black group-hover:text-white group-hover:border-black transition-all" asChild>
                                                    <a href={`/quote/${quotation.token}`} target="_blank" rel="noopener noreferrer">
                                                        Xem chi tiết
                                                    </a>
                                                </Button>
                                            </td>
                                        </tr>
                                        {/* Placeholder Docs */}
                                        {[
                                            { title: 'Hợp đồng kinh tế dự án', icon: <FilePenLine className="w-5 h-5" />, status: 'draft', id: 'CON-001' },
                                            { title: 'Biên bản nghiệm thu bàn giao', icon: <UserCheck className="w-5 h-5" />, status: 'pending', id: 'REP-001' },
                                        ].map((doc, i) => (
                                            <tr key={i} className="hover:bg-neutral-50/30 transition-colors opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center border border-neutral-200">
                                                            {doc.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold uppercase tracking-tight text-neutral-500">{doc.title}</div>
                                                            <div className="text-[9px] text-neutral-400 font-bold mt-0.5 tracking-wider">{doc.id} • Đợi hoàn tất dự án</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                    {getStatusBadge(doc.status)}
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <Button size="sm" variant="ghost" className="h-9 rounded-xl px-4 font-bold text-[10px] uppercase text-neutral-300 pointer-events-none" disabled>
                                                        Chưa sẵn sàng
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                    <Info className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-tight text-amber-900 border-b border-amber-200 pb-1">Quy trình pháp lý</h4>
                                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium italic">Sau khi khách hàng chấp nhận báo giá, một bản nháp hợp đồng sẽ được gửi tới email của quý khách để rà soát.</p>
                                </div>
                            </div>
                            <div className="bg-neutral-100 rounded-2xl p-6 border border-neutral-200 flex gap-4">
                                <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-tight text-neutral-900 border-b border-neutral-300 pb-1">Hỗ trợ trực tiếp</h4>
                                    <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">Mọi thắc mắc kỹ thuật vui lòng gửi về: <span className="font-bold text-black border-b border-black">tech@tulie.vn</span></p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
