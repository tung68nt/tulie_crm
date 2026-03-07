'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Send, ArrowUp, ArrowDown, X, FolderPlus } from 'lucide-react'
import { PriceInput } from '@/components/ui/price-input'
import { Quotation, QuotationItem, Customer, Product } from '@/types'
import { updateQuotation } from '@/lib/supabase/services/quotation-service'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface QuotationFormProps {
    quotation?: Quotation
    customers: Customer[]
    products: Product[]
    units: string[]
    projects?: any[]
    initialCustomerId?: string
    onChange?: (data: any) => void
    onSave?: (send: boolean) => void
    isLoading?: boolean
    hideHeader?: boolean
}

export function QuotationForm({ quotation, customers, products, units, projects, initialCustomerId, onChange, onSave, isLoading: externalIsLoading, hideHeader = false }: QuotationFormProps) {
    const router = useRouter()
    const [internalIsLoading, setInternalIsLoading] = useState(false)
    const isLoading = externalIsLoading || internalIsLoading

    const [customerId, setCustomerId] = useState(quotation?.customer_id || initialCustomerId || '')
    const [projectId, setProjectId] = useState(quotation?.project_id || '')
    const [title, setTitle] = useState(quotation?.title || '')
    const [quotationNumber, setQuotationNumber] = useState(quotation?.quotation_number || `BG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`)
    const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
    const [newSectionName, setNewSectionName] = useState('')
    const [terms, setTerms] = useState(quotation?.terms || '')
    const [notes, setNotes] = useState(quotation?.notes || '')
    const [vatPercent, setVatPercent] = useState(quotation?.vat_percent || 10)
    const [type, setType] = useState<Quotation['type']>(quotation?.type || 'standard')
    const [proposalContent, setProposalContent] = useState<any>(quotation?.proposal_content || {})

    // Bank info state
    const [bankName, setBankName] = useState(quotation?.bank_name || '')
    const [bankAccountNo, setBankAccountNo] = useState(quotation?.bank_account_no || '')
    const [bankAccountName, setBankAccountName] = useState(quotation?.bank_account_name || '')
    const [bankBranch, setBankBranch] = useState(quotation?.bank_branch || '')

    // Calculate valid_until to days for the input
    const [validityDays, setValidityDays] = useState(() => {
        if (!quotation?.valid_until || !quotation?.created_at) return 30
        try {
            const createdDate = new Date(quotation.created_at)
            const validUntilDate = new Date(quotation.valid_until)
            if (isNaN(createdDate.getTime()) || isNaN(validUntilDate.getTime())) return 30
            const diffTime = validUntilDate.getTime() - createdDate.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays > 0 ? diffDays : 30
        } catch (e) {
            return 30
        }
    })

    const [items, setItems] = useState<Partial<QuotationItem>[]>(() => {
        if (quotation?.items && Array.isArray(quotation.items) && quotation.items.length > 0) {
            return quotation.items.map(item => ({ ...item }))
        }
        return [
            {
                id: `temp-${Date.now()}`,
                product_id: '',
                product_name: '',
                description: '',
                section_name: '',
                quantity: 1,
                unit: 'cái',
                unit_price: 0,
                discount: 0,
                total_price: 0,
                sort_order: 0
            }
        ]
    })

    const addItem = () => {
        const newItem: Partial<QuotationItem> = {
            id: `temp-${Date.now()}`,
            product_id: '',
            product_name: '',
            description: '',
            section_name: '',
            quantity: 1,
            unit: 'cái',
            unit_price: 0,
            discount: 0,
            total_price: 0,
            sort_order: items.length
        }
        setItems([...items, newItem])
    }

    const removeItem = (id: string | undefined) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id))
        }
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= items.length) return

        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[newIndex]
        newItems[newIndex] = temp

        // Update sort_order
        newItems.forEach((item, idx) => {
            item.sort_order = idx
        })

        setItems(newItems)
    }

    const addItemToSection = (sectionName: string) => {
        const newItem: Partial<QuotationItem> = {
            id: `temp-${Date.now()}`,
            product_id: '',
            product_name: '',
            description: '',
            section_name: sectionName,
            quantity: 1,
            unit: 'cái',
            unit_price: 0,
            discount: 0,
            total_price: 0,
            sort_order: items.length
        }
        setItems([...items, newItem])
    }

    const addSection = () => {
        setIsAddSectionOpen(true)
        setNewSectionName('')
    }

    const handleConfirmAddSection = () => {
        if (newSectionName.trim()) {
            addItemToSection(newSectionName.trim())
            setIsAddSectionOpen(false)
            setNewSectionName('')
        } else {
            toast.error('Vui lòng nhập tên phần')
        }
    }

    const updateSectionName = (oldName: string, newName: string) => {
        setItems(prev => prev.map(item =>
            (item.section_name || 'Khác') === oldName ? { ...item, section_name: newName } : item
        ))
    }

    const removeSection = (sectionName: string) => {
        if (confirm(`Bạn có chắc muốn xóa toàn bộ phần "${sectionName}" không?`)) {
            setItems(prev => prev.filter(item => (item.section_name || 'Khác') !== sectionName))
        }
    }

    const updateItem = (id: string | undefined, updates: Partial<QuotationItem>) => {
        setItems(prevItems =>
            prevItems.map((item) => {
                if (item.id !== id) return item
                const updated = { ...item, ...updates }

                // Auto-fill product info if product_id is changed
                if ('product_id' in updates) {
                    const productId = updates.product_id
                    const product = products.find((p) => p.id === productId)
                    if (product) {
                        updated.product_name = product.name
                        updated.unit_price = product.price
                        updated.unit = product.unit
                        updated.description = product.description || ''
                    } else if (productId === '') {
                        updated.product_name = ''
                        updated.unit_price = 0
                    }
                }

                // Recalculate total - trigger if relevant fields changed
                const calculationFields = ['quantity', 'unit_price', 'discount', 'product_id']
                if (calculationFields.some(field => field in updates)) {
                    const qty = Number(updated.quantity) || 0
                    const priceVal = Number(updated.unit_price) || 0
                    const baseTotal = qty * priceVal
                    const disc = Number(updated.discount) || 0
                    updated.total_price = baseTotal - (baseTotal * disc / 100)
                }

                return updated
            })
        )
    }

    const commonSections = ['Thiết kế', 'In ấn', 'Sản xuất', 'Media', 'Digital Marketing', 'Quà tặng', 'Sự kiện']
    const existingSections = Array.from(new Set(items.map(i => i.section_name).filter(Boolean))) as string[]
    const sectionOptions = Array.from(new Set([...commonSections, ...existingSections]))

    // Group items for display
    const sectionGroups: { name: string; items: any[] }[] = []
    items.forEach((item, index) => {
        const sName = item.section_name || ''
        let group = sectionGroups.find(g => g.name === sName)
        if (!group) {
            group = { name: sName, items: [] }
            sectionGroups.push(group)
        }
        group.items.push({ ...item, actualIndex: index })
    })

    const subtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const totalAmount = subtotal + vatAmount

    // Propagate changes to parent for preview
    useEffect(() => {
        if (onChange) {
            const currentCustomer = customers?.find(c => c.id === customerId)
            onChange({
                customer_id: customerId,
                customer: currentCustomer,
                title,
                terms,
                notes,
                vat_percent: vatPercent,
                vat_amount: vatAmount,
                subtotal: subtotal,
                grand_total: totalAmount,
                total_amount: totalAmount,
                items,
                valid_days: validityDays,
                bank_name: bankName,
                bank_account_no: bankAccountNo,
                bank_account_name: bankAccountName,
                bank_branch: bankBranch,
                type,
                proposal_content: proposalContent,
                project_id: projectId
            })
        }
    }, [quotationNumber, customerId, projectId, title, terms, notes, vatPercent, items, validityDays, subtotal, vatAmount, totalAmount, onChange, customers, bankName, bankAccountNo, bankAccountName, bankBranch, type, proposalContent])

    const handleSave = async (sendAfterSave = false) => {
        if (onSave) {
            onSave(sendAfterSave)
            return
        }

        if (!quotation) return

        setInternalIsLoading(true)
        try {
            // Calculate new validUntil
            const validUntil = new Date()
            validUntil.setDate(validUntil.getDate() + validityDays)

            const updateData: Partial<Quotation> = {
                quotation_number: quotationNumber,
                customer_id: customerId,
                title,
                terms,
                notes,
                vat_percent: vatPercent,
                vat_amount: vatAmount,
                subtotal,
                total_amount: totalAmount,
                valid_until: validUntil.toISOString(),
                status: sendAfterSave ? 'sent' : quotation.status,
                bank_name: bankName,
                bank_account_no: bankAccountNo,
                bank_account_name: bankAccountName,
                bank_branch: bankBranch,
                type,
                proposal_content: proposalContent,
                project_id: projectId || undefined
            }

            // Clean items to only include valid database columns
            const cleanedItems = items.map(item => ({
                product_id: item.product_id || null,
                product_name: item.product_name || '',
                description: item.description || '',
                section_name: item.section_name || null,
                quantity: Number(item.quantity) || 0,
                unit: item.unit || '',
                unit_price: Number(item.unit_price) || 0,
                discount: Number(item.discount) || 0,
                total_price: Number(item.total_price) || 0,
                sort_order: Number(item.sort_order) || 0
            }))

            await updateQuotation(quotation.id, updateData, cleanedItems)
            toast.success('Cập nhật báo giá thành công')
            router.push(`/quotations/${quotation.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Failed to update quotation:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật báo giá')
        } finally {
            setInternalIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-semibold">
                                {quotation ? `Chỉnh sửa ${quotation.quotation_number}` : "Tạo báo giá mới"}
                            </h1>
                            <p className="text-muted-foreground">
                                {quotation ? "Cập nhật thông tin báo giá" : "Nhập thông tin cho báo giá mới"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8 pb-12">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Khách hàng</Label>
                                    <Select value={customerId || ""} onValueChange={setCustomerId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn khách hàng..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers?.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hiệu lực (ngày)</Label>
                                    <Input
                                        type="number"
                                        value={validityDays}
                                        onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dự án (Portal Group)</Label>
                                    <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn dự án để gộp portal..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Không thuộc dự án --</SelectItem>
                                            {projects?.filter(p => !customerId || p.customer_id === customerId).map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Loại báo giá</Label>
                                <RadioGroup
                                    value={type}
                                    onValueChange={(val: any) => setType(val)}
                                    className="flex items-center space-x-6 h-10"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="standard" id="type-standard" />
                                        <Label htmlFor="type-standard" className="cursor-pointer">Tiêu chuẩn (Excel)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="proposal" id="type-proposal" />
                                        <Label htmlFor="type-proposal" className="cursor-pointer">Hồ sơ đề xuất (Mkt/Dev)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Tiêu đề</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Mã báo giá</Label>
                                <Input value={quotationNumber} onChange={(e) => setQuotationNumber(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Mã báo giá phải là duy nhất. Báo lỗi khi lưu nếu trùng lặp.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {type === 'proposal' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Nội dung Proposal</CardTitle>
                                <CardDescription>Mô tả chi tiết giải pháp, phạm vi, đội ngũ và các cam kết cho khách hàng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Row 1: Introduction */}
                                <div className="space-y-4 mb-12 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <Label className="text-[15px] font-bold text-slate-900 block mb-2">Mục tiêu & Giới thiệu</Label>
                                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Nêu bật vấn đề, nhu cầu của khách hàng và tổng quan giải pháp đề xuất.</p>
                                    </div>
                                    <Textarea
                                        rows={4}
                                        placeholder="VD: Với mong muốn nâng cao hình ảnh thương hiệu và gia tăng chuyển đổi qua kênh digital, chúng tôi xin đề xuất giải pháp toàn diện bao gồm..."
                                        value={proposalContent?.introduction || ''}
                                        onChange={(e) => setProposalContent({ ...proposalContent, introduction: e.target.value })}
                                        className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all p-4 rounded-xl shadow-sm min-h-[140px]"
                                    />
                                </div>

                                {/* Row 2: Scope of Work */}
                                <div className="space-y-4 mb-12 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <Label className="text-[15px] font-bold text-slate-900 block mb-2">Phạm vi công việc (Scope of Work)</Label>
                                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Mô tả chi tiết từng hạng mục, số lượng, tần suất và chất lượng đầu ra mong muốn.</p>
                                    </div>
                                    <Textarea
                                        rows={6}
                                        placeholder={"VD:\n• Thiết kế bộ nhận diện: Logo, name card, banner, profile công ty\n• Website: Thiết kế UI/UX, phát triển frontend + backend, tích hợp CRM\n• Marketing: 12 bài content/tháng, 4 video reels, quản lý fanpage\n• Sự kiện: Thiết kế backdrop, standee, giấy mời, tờ rơi"}
                                        value={proposalContent?.scope_of_work || ''}
                                        onChange={(e) => setProposalContent({ ...proposalContent, scope_of_work: e.target.value })}
                                        className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all p-4 rounded-xl shadow-sm min-h-[180px]"
                                    />
                                </div>

                                {/* Row 3: Methodology */}
                                <div className="space-y-4 mb-12 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <Label className="text-[15px] font-bold text-slate-900 block mb-2">Phương pháp & Cách tiếp cận</Label>
                                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Mô tả cách thức triển khai, công nghệ, quy trình và tiêu chuẩn áp dụng.</p>
                                    </div>
                                    <Textarea
                                        rows={4}
                                        placeholder={"VD: Áp dụng quy trình Agile with sprint 2 tuần, review định kỳ cùng khách hàng.\nThiết kế: Design Thinking → Wireframe → UI → Review → Hoàn thiện\nDev: Git-based, CI/CD, testing trước bàn giao"}
                                        value={proposalContent?.methodology || ''}
                                        onChange={(e) => setProposalContent({ ...proposalContent, methodology: e.target.value })}
                                        className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all p-4 rounded-xl shadow-sm min-h-[140px]"
                                    />
                                </div>

                                {/* Row 4: Deliverables */}
                                <div className="space-y-4 mb-12 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div>
                                        <Label className="text-[15px] font-bold text-slate-900 block mb-2">Sản phẩm bàn giao (Deliverables)</Label>
                                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Liệt kê cụ thể sản phẩm đầu ra bàn giao cho khách hàng.</p>
                                    </div>
                                    <Textarea
                                        rows={4}
                                        placeholder={"VD:\n• File thiết kế gốc (AI, PSD, Figma)\n• Source code + tài liệu hướng dẫn sử dụng\n• Báo cáo hiệu quả chiến dịch hàng tháng\n• Video gốc full HD + phụ đề"}
                                        value={proposalContent?.deliverables || ''}
                                        onChange={(e) => setProposalContent({ ...proposalContent, deliverables: e.target.value })}
                                        className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all p-4 rounded-xl shadow-sm min-h-[140px]"
                                    />
                                </div>

                                {/* Row 5: Team + Timeline side by side */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10 pb-6 border-b border-slate-100">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Đội ngũ & Nhân sự</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Cấu trúc team triển khai và vai trò chính.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Senior Designer (4 năm exp), Project Manager, 2 Content Creator..."
                                            value={proposalContent?.team || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, team: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Tiến độ & Timeline</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Cột mốc quan trọng và thời gian hoàn thành từng giai đoạn.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Tuần 1: Research, Tuần 2: Design, Tuần 3-4: Development..."
                                            value={proposalContent?.timeline || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, timeline: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Row 6: Warranty + Why Us side by side */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2.5 mb-6">
                                        <Label className="text-sm font-bold">Chính sách bảo hành & Hỗ trợ</Label>
                                        <p className="text-xs text-muted-foreground mt-1.5">Cam kết hỗ trợ sau bàn giao và bảo chì dịch vụ</p>
                                        <Textarea
                                            rows={3}
                                            placeholder="VD: Bảo hành code 12 tháng, hỗ trợ vận hành 2h/ngày trong tuần đầu..."
                                            value={proposalContent?.warranty || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, warranty: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5 mb-6">
                                        <Label className="text-sm font-bold">Vì sao chọn chúng tôi?</Label>
                                        <p className="text-xs text-muted-foreground mt-1.5">Lợi thế cạnh tranh, điểm mạnh riêng</p>
                                        <Textarea
                                            rows={4}
                                            placeholder={"VD:\n• 5+ năm kinh nghiệm ngành F&B, Bất động sản\n• Đội ngũ in-house, không outsource\n• Quy trình chuyên nghiệp, minh bạch\n• Đã phục vụ 200+ khách hàng"}
                                            value={proposalContent?.why_us || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, why_us: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Row 7: Case Studies */}
                                <div className="space-y-2.5 mb-6">
                                    <Label className="text-sm font-bold">Tài liệu đính kèm (Attachments)</Label>
                                    <p className="text-xs text-muted-foreground mt-1.5">Link driver, hồ sơ năng lực hoặc các file liên quan</p>
                                    <Textarea
                                        rows={3}
                                        placeholder="VD: Link hồ sơ năng lực agency: bit.ly/tulie-portfolio..."
                                        value={proposalContent?.attachments || ''}
                                        onChange={(e) => setProposalContent({ ...proposalContent, attachments: e.target.value })}
                                    />
                                </div>

                                {/* Row 8: Custom Sections */}
                                <div className="space-y-3 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-sm font-semibold">Nội dung bổ sung</Label>
                                            <p className="text-xs text-muted-foreground">Thêm các mục tùy chỉnh vào proposal (VD: Phụ lục, Tài liệu tham khảo...)</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const existing = proposalContent?.custom_sections || []
                                                setProposalContent({
                                                    ...proposalContent,
                                                    custom_sections: [...existing, { title: '', content: '' }]
                                                })
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Thêm mục
                                        </Button>
                                    </div>
                                    {(proposalContent?.custom_sections || []).map((section: any, idx: number) => (
                                        <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Tên mục (VD: Phụ lục A, Tài liệu tham khảo...)"
                                                    value={section.title}
                                                    onChange={(e) => {
                                                        const updated = [...(proposalContent?.custom_sections || [])]
                                                        updated[idx] = { ...updated[idx], title: e.target.value }
                                                        setProposalContent({ ...proposalContent, custom_sections: updated })
                                                    }}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = (proposalContent?.custom_sections || []).filter((_: any, i: number) => i !== idx)
                                                        setProposalContent({ ...proposalContent, custom_sections: updated })
                                                    }}
                                                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Textarea
                                                rows={3}
                                                placeholder="Nội dung chi tiết..."
                                                value={section.content}
                                                onChange={(e) => {
                                                    const updated = [...(proposalContent?.custom_sections || [])]
                                                    updated[idx] = { ...updated[idx], content: e.target.value }
                                                    setProposalContent({ ...proposalContent, custom_sections: updated })
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between px-6">
                            <div>
                                <CardTitle>Sản phẩm / Dịch vụ</CardTitle>
                                <CardDescription>Danh sách hạng mục báo giá được phân loại</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm phần mới
                                </Button>
                                <Button type="button" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm nhanh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto p-4 space-y-8 bg-slate-50/50">
                            {sectionGroups.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white">
                                    <p className="text-muted-foreground mb-4">Chưa có hạng mục nào cho báo giá này</p>
                                    <Button onClick={addItem}>Bắt đầu bằng cách thêm hạng mục</Button>
                                </div>
                            ) : (
                                sectionGroups.map((group, groupIdx) => (
                                    <div key={groupIdx} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                        {/* Section Header */}
                                        <div className="bg-zinc-900 px-4 py-2 text-white flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1 max-w-md">
                                                <span className="text-white/60 font-bold">{groupIdx + 1}.</span>
                                                <Input
                                                    value={group.name}
                                                    onChange={(e) => updateSectionName(group.name, e.target.value)}
                                                    placeholder="Tên phần (vd: Thiết kế, In ấn, Website...)"
                                                    className="bg-transparent border-none text-white font-bold h-8 focus-visible:ring-0 px-0 placeholder:text-white/40"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSection(group.name)}
                                                className="text-white/60 hover:text-red-400 h-8 px-2"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Xóa phần
                                            </Button>
                                        </div>

                                        <Table>
                                            <TableHeader className="bg-zinc-50">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead className="pl-0 min-w-[250px]">Sản phẩm / Dịch vụ</TableHead>
                                                    <TableHead className="min-w-[100px]">ĐVT</TableHead>
                                                    <TableHead className="min-w-[80px]">SL</TableHead>
                                                    <TableHead className="min-w-[140px]">Đơn giá</TableHead>
                                                    <TableHead className="min-w-[80px]">Chiết khấu %</TableHead>
                                                    <TableHead className="min-w-[130px] text-right">Thành tiền</TableHead>
                                                    <TableHead className="w-[40px] pr-4"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.items.map((item, itemIdx) => (
                                                    <TableRow key={item.id} className="group/row">
                                                        <TableCell className="pl-4 py-4 align-top">
                                                            <div className="flex flex-col gap-1 opacity-20 group-hover/row:opacity-100 transition-opacity">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => moveItem(item.actualIndex, 'up')}
                                                                    disabled={item.actualIndex === 0}
                                                                >
                                                                    <ArrowUp className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => moveItem(item.actualIndex, 'down')}
                                                                    disabled={item.actualIndex === items.length - 1}
                                                                >
                                                                    <ArrowDown className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <div className="space-y-2">
                                                                <div className="flex gap-1">
                                                                    <Select value={item.product_id || ""} onValueChange={(v) => updateItem(item.id, { product_id: v })}>
                                                                        <SelectTrigger className="h-9">
                                                                            <SelectValue placeholder="Chọn sản phẩm" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {products?.map((p) => (
                                                                                <SelectItem key={p.id} value={p.id}>
                                                                                    {p.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {item.product_id && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                updateItem(item.id, { product_id: '', product_name: '' })
                                                                            }}
                                                                            title="Xóa lựa chọn"
                                                                            className="h-9 w-9 shrink-0"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                <Input
                                                                    placeholder="Tên sản phẩm/dịch vụ"
                                                                    value={item.product_name}
                                                                    onChange={(e) => updateItem(item.id, { product_name: e.target.value })}
                                                                    className="h-9 font-medium"
                                                                />

                                                                <Textarea
                                                                    placeholder="Quy cách / Mô tả kỹ thuật (vd: A5 2 mặt, C150...)"
                                                                    value={item.description || ""}
                                                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                                    className="h-16 text-[12px] min-h-[40px] resize-y"
                                                                    rows={1}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <Input
                                                                placeholder="ĐVT"
                                                                value={item.unit}
                                                                onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                                                                className="h-9"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                                                className="h-9"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <PriceInput
                                                                value={item.unit_price}
                                                                onChange={(val) => updateItem(item.id, { unit_price: val })}
                                                                className="h-9"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top py-4">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={item.discount}
                                                                onChange={(e) => updateItem(item.id, { discount: parseInt(e.target.value) || 0 })}
                                                                className="h-9"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium align-top py-6">
                                                            {formatCurrency(Number(item.total_price) || 0)}
                                                        </TableCell>
                                                        <TableCell className="pr-4 align-top py-4 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(item.id)}
                                                                className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        <div className="bg-slate-50/50 p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addItemToSection(group.name)}
                                                className="w-full h-8 border border-dashed border-slate-200 hover:border-slate-400 hover:bg-white text-slate-500 font-medium"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Thêm sản phẩm vào phần "{group.name}"
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Terms & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Điều khoản & Ghi chú</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Điều khoản thanh toán</Label>
                                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ghi chú</Label>
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Transfer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chuyển khoản</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Ngân hàng</Label>
                                <Input
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="VD: TECHCOMBANK"
                                    id="bank_name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Số tài khoản</Label>
                                <Input
                                    value={bankAccountNo}
                                    onChange={(e) => setBankAccountNo(e.target.value)}
                                    placeholder="VD: 190368686868"
                                    id="bank_account_no"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Chủ tài khoản</Label>
                                <Input
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="VD: CONG TY TNHH TULIE"
                                    id="bank_account_name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Chi nhánh</Label>
                                <Input
                                    value={bankBranch}
                                    onChange={(e) => setBankBranch(e.target.value)}
                                    placeholder="VD: Thanh Xuân - Hà Nội"
                                    id="bank_branch"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary - Moved to bottom */}
                <Card className="sticky bottom-6 z-10 mt-8 shadow-lg border-primary/20 bg-background/95 backdrop-blur">
                    <CardHeader className="pb-2">
                        <CardTitle>Tổng kết & Hoàn tất</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1 flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                                <div className="space-y-1 min-w-[120px]">
                                    <p className="text-sm text-muted-foreground">Tạm tính</p>
                                    <p className="font-medium">{formatCurrency(subtotal)}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Thuế VAT</p>
                                    <div className="flex items-center gap-2">
                                        <Select value={vatPercent.toString()} onValueChange={(v) => setVatPercent(parseInt(v))}>
                                            <SelectTrigger className="w-20 h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0%</SelectItem>
                                                <SelectItem value="8">8%</SelectItem>
                                                <SelectItem value="10">10%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="font-medium min-w-[100px] text-right">{formatCurrency(vatAmount)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 min-w-[150px]">
                                    <p className="text-sm text-muted-foreground">Tổng cộng</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                                <Button variant="ghost" asChild disabled={isLoading}>
                                    <Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"}>Hủy</Link>
                                </Button>
                                <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Lưu & Gửi
                                </Button>
                                <Button onClick={() => handleSave(false)} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Section Suggestions Datalist */}
            <datalist id="section-suggestions">
                {sectionOptions.map((option, idx) => (
                    <option key={idx} value={option} />
                ))}
            </datalist>

            {/* Dialog Thêm phần mới */}
            <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Thêm phần phân loại mới
                        </DialogTitle>
                        <DialogDescription>
                            Nhập tên nhóm hạng mục để phân loại báo giá dễ dàng hơn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label htmlFor="section-name" className="text-xs font-semibold text-muted-foreground mb-2 block">
                            Tên phần (vd: Thiết kế, In ấn, Media...)
                        </Label>
                        <Input
                            id="section-name"
                            placeholder="Nhập tên phần..."
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleConfirmAddSection()
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="flex sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddSectionOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmAddSection}
                        >
                            Thêm ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
