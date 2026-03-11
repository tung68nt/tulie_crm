'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users, FileText, FileSignature, Camera, BarChart3, Globe,
    ArrowRight, CheckCircle2, Zap, Shield, Headphones, ChevronRight,
    MessageCircle, Sparkles, Layers, Monitor, Send, Phone, Mail, Building2, Loader2
} from "lucide-react"
import { toast } from "sonner"

const ZALO_PHONE = "098.898.4554"
const ZALO_LINK = "https://zalo.me/0988984554"

const SERVICES = [
    {
        icon: Users,
        title: "Quản lý Khách hàng (CRM)",
        desc: "Quản lý toàn bộ thông tin khách hàng, lịch sử tương tác, phân loại leads và pipeline bán hàng.",
    },
    {
        icon: FileText,
        title: "Hệ thống Báo giá",
        desc: "Tạo báo giá chuyên nghiệp, gửi qua portal, khách hàng duyệt online — tự động chuyển đổi thành hợp đồng.",
    },
    {
        icon: FileSignature,
        title: "Hợp đồng & Thanh toán",
        desc: "Quản lý hợp đồng, theo dõi công nợ, tích hợp thanh toán tự động qua mã QR ngân hàng.",
    },
    {
        icon: Camera,
        title: "Studio Management",
        desc: "Quản lý đơn hàng chụp ảnh, theo dõi tiến độ, bàn giao sản phẩm qua portal riêng cho khách.",
    },
    {
        icon: Globe,
        title: "Customer Portal",
        desc: "Portal riêng cho từng khách hàng — xem dự án, thanh toán, tải sản phẩm, cập nhật thông tin.",
    },
    {
        icon: BarChart3,
        title: "Báo cáo & Analytics",
        desc: "Dashboard trực quan, báo cáo doanh thu, hiệu suất nhân sự, phân tích khách hàng theo thời gian thực.",
    },
]

const STEPS = [
    {
        num: "01",
        title: "Tư vấn & Phân tích",
        desc: "Lắng nghe nhu cầu, phân tích quy trình vận hành hiện tại, đề xuất giải pháp CRM phù hợp.",
    },
    {
        num: "02",
        title: "Thiết kế UI/UX",
        desc: "Thiết kế giao diện hiện đại theo phong cách SaaS, tối ưu trải nghiệm cho cả desktop và mobile.",
    },
    {
        num: "03",
        title: "Phát triển & Tích hợp",
        desc: "Xây dựng hệ thống trên nền tảng Next.js & Supabase, tích hợp thanh toán, email, Zalo OA.",
    },
    {
        num: "04",
        title: "Bàn giao & Đồng hành",
        desc: "Triển khai, đào tạo sử dụng, hỗ trợ kỹ thuật dài hạn và nâng cấp tính năng liên tục.",
    },
]

const ADVANTAGES = [
    {
        icon: Sparkles,
        title: "UI hiện đại, chuẩn SaaS",
        desc: "Giao diện đẹp, chuyên nghiệp, dễ sử dụng — chuẩn design system shadcn/ui.",
    },
    {
        icon: Zap,
        title: "Tự động hóa quy trình",
        desc: "Tự động gửi báo giá, nhắc thanh toán, ghi nhận chuyển khoản, tạo hoá đơn.",
    },
    {
        icon: Shield,
        title: "Bảo mật & Tin cậy",
        desc: "Xác thực đa tầng, phân quyền chi tiết, dữ liệu mã hóa, backup tự động.",
    },
    {
        icon: Headphones,
        title: "Hỗ trợ dài hạn",
        desc: "Đội ngũ kỹ thuật đồng hành xuyên suốt, nâng cấp tính năng theo yêu cầu.",
    },
]

const BUSINESS_TYPES = [
    "Agency / Truyền thông",
    "Studio / Nhiếp ảnh",
    "Thương mại / Bán lẻ",
    "Bất động sản",
    "Giáo dục / Đào tạo",
    "Dịch vụ / Tư vấn",
    "Sản xuất / Công nghiệp",
    "Khác",
]

function ConsultationForm() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        company_name: '',
        phone: '',
        email: '',
        business_type: '',
        message: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.full_name || !formData.phone) {
            toast.error('Vui lòng điền họ tên và số điện thoại')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error('Failed')
            setSubmitted(true)
            toast.success('Đã gửi thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.')
        } catch {
            toast.error('Có lỗi xảy ra, vui lòng thử lại')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Cảm ơn bạn đã quan tâm!</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                    Đội ngũ Tulie Agency sẽ liên hệ bạn trong vòng 24 giờ để tư vấn chi tiết.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-xs font-semibold text-zinc-600">Họ tên *</Label>
                    <div className="relative">
                        <Input
                            id="full_name"
                            placeholder="Nguyễn Văn A"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="h-11 rounded-xl pl-10 border-zinc-200"
                            required
                        />
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-zinc-600">Số điện thoại *</Label>
                    <div className="relative">
                        <Input
                            id="phone"
                            placeholder="098 888 8888"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-11 rounded-xl pl-10 border-zinc-200"
                            required
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="company" className="text-xs font-semibold text-zinc-600">Tên công ty</Label>
                    <div className="relative">
                        <Input
                            id="company"
                            placeholder="Công ty ABC"
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            className="h-11 rounded-xl pl-10 border-zinc-200"
                        />
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-600">Email</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11 rounded-xl pl-10 border-zinc-200"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-600">Lĩnh vực kinh doanh</Label>
                <Select
                    value={formData.business_type}
                    onValueChange={(v) => setFormData({ ...formData, business_type: v })}
                >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200">
                        <SelectValue placeholder="Chọn lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                        {BUSINESS_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-semibold text-zinc-600">Mô tả nhu cầu</Label>
                <Textarea
                    id="message"
                    placeholder="Mô tả ngắn về doanh nghiệp và nhu cầu CRM của bạn..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[100px] rounded-xl border-zinc-200 resize-none"
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-base gap-2 shadow-lg shadow-zinc-200"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                ) : (
                    <><Send className="w-4 h-4" /> Gửi yêu cầu tư vấn</>
                )}
            </Button>

            <p className="text-[11px] text-zinc-400 text-center">
                Thông tin của bạn được bảo mật. Chúng tôi sẽ liên hệ trong vòng 24 giờ.
            </p>
        </form>
    )
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-950 selection:text-white">
            {/* ===== NAVBAR ===== */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Tulie" className="h-10 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        {["Dịch vụ", "Quy trình", "Tại sao chọn chúng tôi", "Liên hệ"].map((label, i) => (
                            <a
                                key={i}
                                href={`#${["services", "process", "why", "contact"][i]}`}
                                className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/system-login">
                            <Button variant="ghost" className="text-sm font-semibold rounded-xl hidden sm:inline-flex">
                                Đăng nhập
                            </Button>
                        </Link>
                        <a href={ZALO_LINK} target="_blank">
                            <Button className="rounded-xl font-semibold text-sm shadow-lg shadow-zinc-200 gap-2">
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Liên hệ tư vấn</span>
                                <span className="sm:hidden">Tư vấn</span>
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-950" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.5)'/%3E%3C/svg%3E")`,
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-zinc-800/40 via-zinc-600/20 to-zinc-800/40 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 md:py-44 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-zinc-400 text-xs font-semibold mb-8 backdrop-blur-sm">
                        <Layers className="w-3.5 h-3.5" />
                        Giải pháp CRM cho doanh nghiệp Việt
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                        Xây dựng hệ thống
                        <br />
                        <span className="bg-gradient-to-r from-zinc-300 via-white to-zinc-300 bg-clip-text text-transparent">
                            CRM riêng
                        </span>{" "}
                        cho doanh nghiệp
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Tulie Agency thiết kế và phát triển hệ thống quản trị khách hàng tùy chỉnh —
                        từ báo giá, hợp đồng, thanh toán đến portal khách hàng — tất cả trong một nền tảng.
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <a href="#contact">
                            <Button size="lg" className="rounded-2xl font-bold text-base h-14 px-8 shadow-2xl shadow-white/10 gap-2 bg-white text-zinc-950 hover:bg-zinc-100">
                                Nhận tư vấn miễn phí
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </a>
                        <Link href="/demo">
                            <Button size="lg" variant="outline" className="rounded-2xl font-bold text-base h-14 px-8 border-white/20 text-white hover:bg-white/10 bg-transparent">
                                <Monitor className="w-4 h-4 mr-2" />
                                Xem hệ thống Demo
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-8 text-zinc-500 text-xs font-semibold">
                        {[
                            "Next.js & React",
                            "Supabase Cloud",
                            "Shadcn/ui Design",
                            "SSL & Bảo mật",
                        ].map((t, i) => (
                            <div key={i} className="hidden sm:flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SERVICES ===== */}
            <section id="services" className="py-24 md:py-32 bg-zinc-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-4">
                            Dịch vụ
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
                            Hệ thống CRM toàn diện
                        </h2>
                        <p className="text-zinc-500 max-w-xl mx-auto text-base font-medium">
                            Mỗi module được thiết kế tỉ mỉ, tối ưu cho quy trình vận hành thực tế của doanh nghiệp Việt Nam.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {SERVICES.map((s, i) => (
                            <div
                                key={i}
                                className="group bg-white p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-950 mb-2 tracking-tight">{s.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed font-medium">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PROCESS ===== */}
            <section id="process" className="py-24 md:py-32 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-4">
                            Quy trình
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
                            Từ ý tưởng đến hệ thống hoàn chỉnh
                        </h2>
                        <p className="text-zinc-500 max-w-xl mx-auto text-base font-medium">
                            Quy trình 4 bước rõ ràng, minh bạch — bạn luôn kiểm soát từng giai đoạn.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, i) => (
                            <div key={i} className="relative group">
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-[calc(100%+0.5rem)] w-[calc(100%-2rem)] h-px bg-zinc-200" />
                                )}
                                <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:bg-white hover:border-zinc-200 hover:shadow-lg transition-all duration-300 h-full">
                                    <div className="text-5xl font-black text-zinc-200 group-hover:text-zinc-300 transition-colors mb-4 tabular-nums">
                                        {step.num}
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-950 mb-2 tracking-tight">{step.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="py-20 bg-zinc-950">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "50+", label: "Dự án hoàn thành" },
                            { value: "200+", label: "Modules phát triển" },
                            { value: "99.9%", label: "Uptime hệ thống" },
                            { value: "24/7", label: "Hỗ trợ kỹ thuật" },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHY US ===== */}
            <section id="why" className="py-24 md:py-32 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-4">
                                Tại sao chọn chúng tôi
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
                                Không chỉ là phần mềm,
                                <br />
                                <span className="text-zinc-400">mà là đối tác công nghệ</span>
                            </h2>
                            <p className="text-zinc-500 text-base mb-8 font-medium leading-relaxed">
                                Tulie Agency không bán sản phẩm đóng gói. Chúng tôi xây dựng hệ thống CRM được tùy chỉnh theo đúng quy trình vận hành của doanh nghiệp bạn — và đồng hành dài hạn để phát triển cùng bạn.
                            </p>
                            <a href="#contact">
                                <Button className="rounded-xl font-semibold gap-2 h-12 px-6 shadow-lg shadow-zinc-200">
                                    Để lại thông tin tư vấn
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </a>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {ADVANTAGES.map((a, i) => (
                                <div
                                    key={i}
                                    className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 hover:bg-white hover:border-zinc-200 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
                                        <a.icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-950 mb-1.5">{a.title}</h4>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CONSULTATION FORM ===== */}
            <section id="contact" className="py-24 md:py-32 bg-zinc-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-4">
                                    Liên hệ
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 tracking-tight mb-4">
                                    Nhận tư vấn miễn phí
                                </h2>
                                <p className="text-zinc-500 text-base font-medium leading-relaxed">
                                    Để lại thông tin, đội ngũ Tulie Agency sẽ liên hệ tư vấn giải pháp CRM phù hợp nhất cho doanh nghiệp của bạn.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <a href={ZALO_LINK} target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all group">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-400">Chat Zalo</p>
                                        <p className="text-sm font-bold text-zinc-950">{ZALO_PHONE}</p>
                                    </div>
                                </a>
                                <a href="mailto:hello@tulie.vn" className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all group">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-400">Email</p>
                                        <p className="text-sm font-bold text-zinc-950">hello@tulie.vn</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                            <ConsultationForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-zinc-950 border-t border-white/5 py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Tulie" className="h-7 w-auto invert opacity-70" />
                        </div>

                        <div className="flex items-center gap-6 text-xs text-zinc-500 font-medium">
                            <a href={ZALO_LINK} target="_blank" className="hover:text-zinc-300 transition-colors">
                                Zalo: {ZALO_PHONE}
                            </a>
                            <span className="w-px h-3 bg-zinc-800" />
                            <a href="mailto:hello@tulie.vn" className="hover:text-zinc-300 transition-colors">
                                hello@tulie.vn
                            </a>
                            <span className="w-px h-3 bg-zinc-800" />
                            <Link href="/system-login" className="hover:text-zinc-300 transition-colors">
                                Staff Login
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[11px] text-zinc-600 font-medium">
                            © {new Date().getFullYear()} Tulie Agency — Dịch vụ xây dựng hệ thống CRM cho doanh nghiệp
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
