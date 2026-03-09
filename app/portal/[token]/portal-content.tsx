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
    data: {
        quotation: any
        quotations: any[]
        contracts: any[]
        invoices: any[]
        tasks: any[]
        timeline: any[]
        customer: any
        project: any
        projectMetadata: any
        brandConfig: any
    }
    token: string
}

const getStatusBadge = (status: string) => {
    const baseClass = "text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full"
    switch (status) {
        case 'accepted':
        case 'active':
        case 'completed':
        case 'signed':
            return <Badge className={cn(baseClass, "bg-zinc-900 text-white border-zinc-900")}>Hoàn thành</Badge>
        case 'paid':
            return <Badge className={cn(baseClass, "bg-green-50 text-green-700 border-green-200")}>Đã thanh toán</Badge>
        case 'sent':
        case 'viewed':
        case 'in_progress':
        case 'partial_paid':
            return <Badge className={cn(baseClass, "bg-white text-zinc-900 border-zinc-900")}>Đang xử lý</Badge>
        case 'pending':
        case 'draft':
            return <Badge variant="outline" className={cn(baseClass, "border-zinc-200 text-zinc-400")}>Chờ duyệt</Badge>
        default:
            return <Badge variant="outline" className={cn(baseClass, "border-zinc-200 text-zinc-400")}>{status}</Badge>
    }
}

export default function PortalContent({ data, token }: PortalContentProps) {
    const { quotation, quotations = [], contracts = [], invoices = [], timeline = [], customer, project, brandConfig } = data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    // Aggregate Calculations
    const totalInvestment = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0)
    const totalPaid = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
    const balanceDue = totalInvestment - totalPaid
    const projectProgress = timeline.length > 0
        ? Math.round((timeline.filter(t => t.status === 'completed').length / timeline.length) * 100)
        : 0

    // Group items by Quotation/Contract
    const projectItems = [
        ...quotations.map(q => ({
            id: q.id,
            number: q.quotation_number,
            type: 'quotation',
            title: q.title || `Báo giá #${q.quotation_number}`,
            status: q.status,
            amount: q.total_amount,
            date: q.created_at,
            timeline: timeline.filter(t => t.quotation_id === q.id)
        })),
        ...contracts.map(c => ({
            id: c.id,
            number: c.contract_number,
            type: 'contract',
            title: c.title || `Hợp đồng #${c.contract_number}`,
            status: c.status,
            amount: c.total_amount,
            date: c.created_at,
            timeline: timeline.filter(t => t.contract_id === c.id)
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
            {/* Header / Hero */}
            <div className="bg-white border-b border-zinc-200 pt-16 pb-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <img
                            src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                            alt="Logo"
                            className="h-14 w-auto object-contain grayscale"
                        />
                        <div className="w-px h-10 bg-zinc-200" />
                        <div>
                            <h1 className="text-xl font-black tracking-tight uppercase">Customer Portal</h1>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Dự án & Tài liệu</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                                <span className="text-[9px] font-bold text-zinc-600 uppercase">Dự án đang triển khai</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10">
                <Tabs defaultValue="overview" className="space-y-10">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-zinc-200/50 p-1 rounded-xl">
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
                        <div className="bg-zinc-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-lg font-bold tracking-tight">Cần cập nhật thông tin?</h3>
                                <p className="text-sm text-zinc-400 max-w-md">Vui lòng kiểm tra và cập nhật thông tin xuất hóa đơn hoặc yêu cầu thay đổi trực tiếp tại đây.</p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="relative z-10 bg-white text-zinc-900 hover:bg-zinc-200 font-bold rounded-xl px-8 h-12 shadow-xl shadow-white/5">
                                        Cập nhật hồ sơ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="bg-zinc-900 text-white p-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold tracking-tight">Cập nhật hồ sơ khách hàng</DialogTitle>
                                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Customer Information & Identity</p>
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
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-xs font-bold uppercase tracking-wider">Đề xuất giải pháp & Chiến lược</h3>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Target className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Mục tiêu dự án</span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-zinc-600 font-medium italic border-l-2 border-zinc-200 pl-4 py-1">
                                            {typeof quotation.proposal_content === 'string'
                                                ? JSON.parse(quotation.proposal_content || '{}').goals
                                                : quotation.proposal_content?.goals || "Dự án đang được khởi tạo chi tiết mục tiêu."}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Box className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Kết quả bàn giao</span>
                                        </div>
                                        <div className="text-sm leading-relaxed text-zinc-600 font-medium italic border-l-2 border-zinc-200 pl-4 py-1">
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
                                { label: 'TỔNG ĐẦU TƯ', value: formatCurrency(totalInvestment), sub: 'Project Investment', icon: <div className="w-1.5 h-1.5 rounded-full bg-black" /> },
                                { label: 'ĐÃ THANH TOÁN', value: formatCurrency(totalPaid), sub: 'Total Paid', icon: <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> },
                                { label: 'CÒN LẠI', value: formatCurrency(balanceDue), sub: 'Balance Due', icon: <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> },
                                { label: 'TIẾN ĐỘ', value: `${projectProgress}%`, sub: 'Project Progress', icon: <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{stat.label}</span>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                                        <div className="text-[9px] font-semibold text-zinc-400 tracking-wider uppercase mt-0.5">{stat.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* project Grid: Grouped Items & Timelines */}
                        <div className="space-y-12">
                            <div className="flex flex-col gap-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Hạng mục & Lộ trình thực hiện</h3>
                                <div className="h-1 w-20 bg-black" />
                            </div>

                            <div className="grid gap-10">
                                {projectItems.map((item, idx) => (
                                    <div key={item.id} className="relative bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:border-black transition-all">
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Item Info Side */}
                                            <div className="lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-zinc-100 bg-zinc-50/30">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-white border-zinc-300">
                                                                {item.type === 'quotation' ? 'Báo giá' : 'Hợp đồng'}
                                                            </Badge>
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                        <h4 className="text-lg font-bold tracking-tight uppercase">{item.title}</h4>
                                                        <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">#{item.number} • {formatDate(item.date)}</p>
                                                    </div>

                                                    <div className="pt-4 border-t border-zinc-100">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Giá trị hạng mục</p>
                                                        <p className="text-2xl font-black tracking-tighter">{formatCurrency(item.amount)}</p>
                                                    </div>

                                                    <Button variant="outline" className="w-full h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider border-zinc-200 hover:bg-black hover:text-white transition-all" asChild>
                                                        <a href={item.type === 'quotation' ? `/quote/${token}` : '#'} target="_blank">Xem chi tiết tài liệu</a>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Timeline Side */}
                                            <div className="lg:w-2/3 p-8">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    Bước thực hiện / Procedure steps
                                                </h5>

                                                <div className="relative space-y-8 pl-6 border-l-2 border-zinc-100 ml-2">
                                                    {item.timeline.length > 0 ? (
                                                        item.timeline.map((event: any, eIdx: number) => (
                                                            <div key={event.id} className="relative">
                                                                {/* Dot */}
                                                                <div className={cn(
                                                                    "absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white",
                                                                    event.status === 'completed' ? "border-black" : "border-zinc-200"
                                                                )}>
                                                                    {event.status === 'completed' && <div className="absolute inset-0.5 rounded-full bg-black" />}
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <h6 className={cn("text-xs font-bold uppercase tracking-tight", event.status === 'completed' ? "text-black" : "text-zinc-400")}>
                                                                            {event.title}
                                                                        </h6>
                                                                        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">{formatDate(event.date)}</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-zinc-500 leading-relaxed max-w-lg italic">{event.description}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-4 text-[10px] italic text-zinc-400 uppercase tracking-widest font-bold">Lộ trình đang được cập nhật</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="pt-4 outline-none">
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <h3 className="text-xs font-bold uppercase tracking-wider">Hệ thống hồ sơ & Chứng từ</h3>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                            <th className="py-4 px-8 font-bold text-zinc-400 uppercase tracking-widest">Loại hồ sơ</th>
                                            <th className="py-4 px-6 font-bold text-zinc-400 uppercase tracking-widest text-center">Trạng thái</th>
                                            <th className="py-4 px-8 font-bold text-zinc-400 uppercase tracking-widest text-right">Review</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        <tr className="hover:bg-zinc-50/30 transition-colors group">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-black/10">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold uppercase tracking-tight">Báo giá dịch vụ & Đề xuất</div>
                                                        <div className="text-[9px] text-zinc-400 font-bold mt-0.5 tracking-wider">#{quotation.quotation_number} • {formatDate(quotation.created_at)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 text-center">
                                                {getStatusBadge(quotation.status)}
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <Button size="sm" variant="outline" className="h-9 rounded-xl border-zinc-200 px-4 font-bold text-[10px] uppercase group-hover:bg-black group-hover:text-white group-hover:border-black transition-all" asChild>
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
                                            <tr key={i} className="hover:bg-zinc-50/30 transition-colors opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center border border-zinc-200">
                                                            {doc.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold uppercase tracking-tight text-zinc-500">{doc.title}</div>
                                                            <div className="text-[9px] text-zinc-400 font-bold mt-0.5 tracking-wider">{doc.id} • Đợi hoàn tất dự án</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                    {getStatusBadge(doc.status)}
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <Button size="sm" variant="ghost" className="h-9 rounded-xl px-4 font-bold text-[10px] uppercase text-zinc-300 pointer-events-none" disabled>
                                                        Chưa sẵn sàng
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
