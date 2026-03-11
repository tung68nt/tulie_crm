'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
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
import { formatCurrency, formatNumber } from '@/lib/utils/format'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Send, ArrowUp, ArrowDown, X, FolderPlus, FileJson, Copy, Upload, Wallet, Check, AlertCircle, RotateCcw } from 'lucide-react'
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
import { ProductCombobox } from '@/components/quotations/product-combobox'

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
    brandConfig?: any
}

export function QuotationForm({ quotation, customers, products, units, projects, initialCustomerId, onChange, onSave, isLoading: externalIsLoading, hideHeader = false, brandConfig }: QuotationFormProps) {
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
    const [vatPercent, setVatPercent] = useState(quotation?.vat_percent ?? 10)
    const [type, setType] = useState<Quotation['type']>(quotation?.type || 'standard')
    const [proposalContent, setProposalContent] = useState<any>(quotation?.proposal_content || {})
    const [isImportProposalOpen, setIsImportProposalOpen] = useState(false)
    const [importText, setImportText] = useState('')
    const [isImportJsonOpen, setIsImportJsonOpen] = useState(false)
    const [importJsonText, setImportJsonText] = useState('')
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [jsonPath, setJsonPath] = useState<string>('')

    // Bank info state
    const [bankName, setBankName] = useState(quotation?.bank_name || '')
    const [bankAccountNo, setBankAccountNo] = useState(quotation?.bank_account_no || '')
    const [bankAccountName, setBankAccountName] = useState(quotation?.bank_account_name || '')
    const [bankBranch, setBankBranch] = useState(quotation?.bank_branch || '')

    // Use default values from brandConfig if it's a new quotation and form is still clean
    useEffect(() => {
        if (!quotation && brandConfig) {
            setNotes(prev => {
                if (!prev || prev.trim() === '') return brandConfig.default_notes || ''
                return prev
            })
            setTerms(prev => {
                if (!prev || prev.trim() === '') return brandConfig.default_payment_terms || ''
                return prev
            })
            setBankName(prev => prev === '' ? brandConfig.bank_name || '' : prev)
            setBankAccountNo(prev => prev === '' ? brandConfig.bank_account_no || '' : prev)
            setBankAccountName(prev => prev === '' ? brandConfig.bank_account_name || '' : prev)
            setBankBranch(prev => prev === '' ? brandConfig.bank_branch || '' : prev)
        }
    }, [brandConfig, quotation])

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

    const [items, setItems] = useState<(Partial<QuotationItem> & { section_id?: string })[]>(() => {
        let rawItems: any[] = []
        if (quotation?.items && Array.isArray(quotation.items) && quotation.items.length > 0) {
            rawItems = quotation.items.map(item => ({ ...item }))
        } else {
            rawItems = [
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
        }

        // Assign section_id based on section_name transitions to keep initial sections separate
        let currentSecId = 0
        let lastSectionName: string | null = null
        return rawItems.map((item, idx) => {
            if (idx === 0 || item.section_name !== lastSectionName) {
                currentSecId++
                lastSectionName = item.section_name || ''
            }
            return { ...item, section_id: `sec-${currentSecId}` }
        })
    })

    const addItem = () => {
        const lastItem = items[items.length - 1]
        const newItem: any = {
            id: `temp-${Date.now()}`,
            product_id: '',
            product_name: '',
            description: '',
            section_name: lastItem?.section_name || '',
            section_id: lastItem?.section_id || 'sec-1',
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

    const moveSection = (sectionId: string, direction: 'up' | 'down') => {
        const groupIndex = sectionGroups.findIndex(g => g.id === sectionId)
        if (groupIndex === -1) return

        const newGroupIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1
        if (newGroupIndex < 0 || newGroupIndex >= sectionGroups.length) return

        // Create new sequence of section groups
        const newSectionGroupsOrder = [...sectionGroups]
        const [movedGroup] = newSectionGroupsOrder.splice(groupIndex, 1)
        newSectionGroupsOrder.splice(newGroupIndex, 0, movedGroup)

        // Flatten back to items array
        const newItems: any[] = []
        newSectionGroupsOrder.forEach(group => {
            group.items.forEach(item => {
                // Find original item by id to maintain references/state
                const originalItem = items[item.actualIndex]
                newItems.push({ ...originalItem })
            })
        })

        // Re-calculate sort_orders
        newItems.forEach((item, idx) => {
            item.sort_order = idx
        })

        setItems(newItems)
    }

    const addItemToSection = (sectionName: string, sectionId?: string) => {
        const sId = sectionId || `sec-${Date.now()}`
        const newItem: any = {
            id: `temp-${Date.now()}`,
            product_id: '',
            product_name: '',
            description: '',
            section_name: sectionName,
            section_id: sId,
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

    const updateSectionName = (sectionId: string, newName: string) => {
        setItems(prev => prev.map(item =>
            item.section_id === sectionId ? { ...item, section_name: newName } : item
        ))
    }

    const removeSection = (sectionId: string) => {
        const group = sectionGroups.find(g => g.id === sectionId)
        if (confirm(`Bạn có chắc muốn xóa toàn bộ phần "${group?.name || 'này'}" không?`)) {
            setItems(prev => prev.filter(item => item.section_id !== sectionId))
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

    // Group items for display using section_id
    const sectionGroups: { id: string; name: string; items: any[] }[] = []
    items.forEach((item, index) => {
        const sId = item.section_id || 'sec-default'
        let group = sectionGroups.find(g => g.id === sId)
        if (!group) {
            group = { id: sId, name: item.section_name || '', items: [] }
            sectionGroups.push(group)
        }
        group.items.push({ ...item, actualIndex: index })
    })

    // Calculate default subtotal (excludes optional items, and only sums the first item of any alternative group)
    const seenGroups = new Set<string>();
    const subtotal = items.reduce((sum, item) => {
        if (item.is_optional) return sum;
        if (item.alternative_group && item.alternative_group.trim() !== '') {
            const groupKey = item.alternative_group.trim().toLowerCase();
            if (seenGroups.has(groupKey)) return sum;
            seenGroups.add(groupKey);
        }
        return sum + (Number(item.total_price) || 0)
    }, 0)
    const vatAmount = subtotal * (vatPercent / 100)
    const totalAmount = subtotal + vatAmount

    // JSON Export: build quotation object
    const handleExportJson = () => {
        const exportData = {
            title,
            quotation_number: quotationNumber,
            type,
            vat_percent: vatPercent,
            validity_days: validityDays,
            terms,
            notes,
            bank_name: bankName,
            bank_account_no: bankAccountNo,
            bank_account_name: bankAccountName,
            bank_branch: bankBranch,
            ...(type === 'proposal' ? { proposal_content: proposalContent } : {}),
            items: items.map((item, idx) => ({
                section_name: item.section_name || '',
                product_name: item.product_name || '',
                description: item.description || '',
                quantity: item.quantity || 1,
                unit: item.unit || '',
                unit_price: item.unit_price || 0,
                discount: item.discount || 0,
                sort_order: idx
            }))
        }
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        toast.success('Đã copy JSON vào clipboard')
    }

    // JSON Import: populate all fields from JSON
    const handleImportJson = () => {
        if (!importJsonText.trim()) return
        try {
            const data = JSON.parse(importJsonText)
            let count = 0

            if (data.title) { setTitle(data.title); count++ }
            if (data.quotation_number) { setQuotationNumber(data.quotation_number); count++ }
            if (data.type) { setType(data.type); count++ }
            if (data.vat_percent !== undefined) { setVatPercent(data.vat_percent); count++ }
            if (data.validity_days) { setValidityDays(data.validity_days); count++ }
            if (data.terms) { setTerms(data.terms); count++ }
            if (data.notes) { setNotes(data.notes); count++ }
            if (data.bank_name) { setBankName(data.bank_name); count++ }
            if (data.bank_account_no) { setBankAccountNo(data.bank_account_no); count++ }
            if (data.bank_account_name) { setBankAccountName(data.bank_account_name); count++ }
            if (data.bank_branch) { setBankBranch(data.bank_branch); count++ }
            if (data.proposal_content) { setProposalContent(data.proposal_content); count++ }

            if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                const newItems = data.items.map((item: any, idx: number) => {
                    // Try to match product by name
                    const matchedProduct = products.find(p =>
                        p.name.toLowerCase().trim() === (item.product_name || '').toLowerCase().trim()
                    )
                    return {
                        id: `temp-${Date.now()}-${idx}`,
                        product_id: matchedProduct?.id || item.product_id || '',
                        product_name: item.product_name || matchedProduct?.name || '',
                        description: item.description || '',
                        section_name: item.section_name || '',
                        quantity: Number(item.quantity) || 1,
                        unit: item.unit || matchedProduct?.unit || 'cái',
                        unit_price: Number(item.unit_price) || matchedProduct?.price || 0,
                        discount: Number(item.discount) || 0,
                        total_price: 0,
                        sort_order: Number(item.sort_order) || idx
                    }
                }).map((item: any) => ({
                    ...item,
                    total_price: item.quantity * item.unit_price * (1 - item.discount / 100)
                }))
                setItems(newItems)
                count += newItems.length
            }

            setIsImportJsonOpen(false)
            setImportJsonText('')
            toast.success(`Đã nhập ${count} trường từ JSON`)
        } catch (err) {
            toast.error('JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.')
        }
    }

    const handleImportProposal = () => {
        if (!importText.trim()) return
        try {
            const data = JSON.parse(importText)
            const newProposalContent = { ...proposalContent }
            const fields = ['introduction', 'scope_of_work', 'methodology', 'deliverables', 'team', 'timeline', 'warranty', 'why_us']

            let count = 0
            fields.forEach(f => {
                if (data[f]) {
                    newProposalContent[f] = data[f]
                    count++
                }
            })

            if (data.attachments) {
                newProposalContent.attachments = data.attachments
                count++
            }

            if (data.custom_sections && Array.isArray(data.custom_sections)) {
                newProposalContent.custom_sections = data.custom_sections
                count++
            }

            if (count === 0) {
                toast.error('Không tìm thấy trường dữ liệu hợp lệ nào để nhập')
                return
            }

            setProposalContent(newProposalContent)
            setIsImportProposalOpen(false)
            setImportText('')
            toast.success(`Đã cập nhật ${count} phần nội dung proposal`)
        } catch (e) {
            toast.error('Mã không hợp lệ. Vui lòng dán đúng định dạng JSON.')
        }
    }

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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
                                {quotation ? `Chỉnh sửa ${quotation.quotation_number}` : "Tạo báo giá mới"}
                            </h1>
                            <p className="text-[14px] text-muted-foreground mt-1">
                                {quotation ? "Cập nhật dữ liệu & Proposal" : "Khởi tạo hồ sơ báo giá mới"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8 pb-12">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <Card className="overflow-hidden">
                        <CardHeader className="py-6 px-6">
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
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-6">
                                <div>
                                    <CardTitle>Nội dung Proposal</CardTitle>
                                    <CardDescription className="mt-1">Mô tả chi tiết giải pháp, phạm vi, đội ngũ cho khách hàng</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Proposal Contents: 8 items in a 2x4 grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10 pb-8 border-b border-slate-100 items-stretch">
                                    {/* 1. Introduction */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Mục tiêu & Giới thiệu</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Nêu bật vấn đề, nhu cầu của khách hàng và tổng quan giải pháp đề xuất.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Với mong muốn nâng cao hình ảnh thương hiệu và gia tăng chuyển đổi qua kênh digital, chúng tôi xin đề xuất giải pháp toàn diện bao gồm..."
                                            value={proposalContent?.introduction || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, introduction: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 2. Scope of Work */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Phạm vi công việc (Scope of Work)</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Mô tả chi tiết từng hạng mục, số lượng, tần suất và chất lượng đầu ra mong muốn.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder={"VD:\n• Thiết kế bộ nhận diện: Logo, name card, banner, profile công ty\n• Website: Thiết kế UI/UX, phát triển frontend + backend, tích hợp CRM\n• Marketing: 12 bài content/tháng, 4 video reels, quản lý fanpage\n• Sự kiện: Thiết kế backdrop, standee, giấy mời, tờ rơi"}
                                            value={proposalContent?.scope_of_work || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, scope_of_work: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 3. Methodology */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Phương pháp & Cách tiếp cận</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Mô tả cách thức triển khai, công nghệ, quy trình và tiêu chuẩn áp dụng.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder={"VD: Áp dụng quy trình Agile with sprint 2 tuần, review định kỳ cùng khách hàng.\nThiết kế: Design Thinking → Wireframe → UI → Review → Hoàn thiện\nDev: Git-based, CI/CD, testing trước bàn giao"}
                                            value={proposalContent?.methodology || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, methodology: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 4. Deliverables */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Sản phẩm bàn giao (Deliverables)</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Liệt kê cụ thể sản phẩm đầu ra bàn giao cho khách hàng.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder={"VD:\n• File thiết kế gốc (AI, PSD, Figma)\n• Source code + tài liệu hướng dẫn sử dụng\n• Báo cáo hiệu quả chiến dịch hàng tháng\n• Video gốc full HD + phụ đề"}
                                            value={proposalContent?.deliverables || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, deliverables: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 5. Team */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Đội ngũ & Nhân sự</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Cấu trúc team triển khai và vai trò chính.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Senior Designer (4 năm exp), Project Manager, 2 Content Creator..."
                                            value={proposalContent?.team || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, team: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 6. Timeline */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Tiến độ & Timeline</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Cột mốc quan trọng và thời gian hoàn thành từng giai đoạn.</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Tuần 1: Research, Tuần 2: Design, Tuần 3-4: Development..."
                                            value={proposalContent?.timeline || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, timeline: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 7. Warranty */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Chính sách bảo hành & Hỗ trợ</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Cam kết hỗ trợ sau bàn giao và bảo trì dịch vụ</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder="VD: Bảo hành code 12 tháng, hỗ trợ vận hành 2h/ngày trong tuần đầu..."
                                            value={proposalContent?.warranty || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, warranty: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
                                        />
                                    </div>

                                    {/* 8. Why Us */}
                                    <div className="flex flex-col space-y-4 h-full">
                                        <div>
                                            <Label className="text-[14px] font-bold text-slate-900 block mb-1.5">Vì sao chọn chúng tôi?</Label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Lợi thế cạnh tranh, điểm mạnh riêng</p>
                                        </div>
                                        <Textarea
                                            rows={4}
                                            placeholder={"VD:\n• 5+ năm kinh nghiệm ngành F&B, Bất động sản\n• Đội ngũ in-house, không outsource\n• Quy trình chuyên nghiệp, minh bạch\n• Đã phục vụ 200+ khách hàng"}
                                            value={proposalContent?.why_us || ''}
                                            onChange={(e) => setProposalContent({ ...proposalContent, why_us: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-black focus:ring-1 focus:ring-black transition-all flex-1 min-h-[140px]"
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
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                        <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
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
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 gap-4 py-6">
                            <div>
                                <CardTitle>Sản phẩm / Dịch vụ</CardTitle>
                                <CardDescription className="mt-1">Danh sách hạng mục báo giá được phân loại</CardDescription>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                    const exportData = {
                                        title,
                                        quotation_number: quotationNumber,
                                        type,
                                        vat_percent: vatPercent,
                                        validity_days: validityDays,
                                        terms,
                                        notes,
                                        bank_name: bankName,
                                        bank_account_no: bankAccountNo,
                                        bank_account_name: bankAccountName,
                                        bank_branch: bankBranch,
                                        ...(type === 'proposal' ? { proposal_content: proposalContent } : {}),
                                        items: items.map((item, idx) => ({
                                            section_name: item.section_name || '',
                                            product_name: item.product_name || '',
                                            description: item.description || '',
                                            quantity: item.quantity || 1,
                                            unit: item.unit || '',
                                            unit_price: item.unit_price || 0,
                                            discount: item.discount || 0,
                                            sort_order: idx,
                                            is_optional: item.is_optional || false,
                                            alternative_group: item.alternative_group || ''
                                        }))
                                    }
                                    setImportJsonText(JSON.stringify(exportData, null, 2))
                                    setIsImportJsonOpen(true)
                                }}>
                                    <FileJson className="mr-2 h-4 w-4" />
                                    <span>Báo giá JSON</span>
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Thêm phần mới</span>
                                    <span className="sm:hidden">Thêm mục</span>
                                </Button>
                                <Button type="button" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm nhanh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto p-4 space-y-8 bg-white">
                            {sectionGroups.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white">
                                    <p className="text-muted-foreground mb-4">Chưa có hạng mục nào cho báo giá này</p>
                                    <Button onClick={addItem}>Bắt đầu bằng cách thêm hạng mục</Button>
                                </div>
                            ) : (
                                sectionGroups.map((group, groupIdx) => (
                                    <div key={groupIdx} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                        {/* Section Header */}
                                        <div className="bg-zinc-950 px-5 py-3 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1 w-full">
                                                <div className="flex flex-col gap-0.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 text-white/40 hover:text-white hover:bg-white/10"
                                                        onClick={() => moveSection(group.id, 'up')}
                                                        disabled={groupIdx === 0}
                                                        title="Di chuyển phần lên"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 text-white/40 hover:text-white hover:bg-white/10"
                                                        onClick={() => moveSection(group.id, 'down')}
                                                        disabled={groupIdx === sectionGroups.length - 1}
                                                        title="Di chuyển phần xuống"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-[12px] font-bold text-white/90">
                                                    {groupIdx + 1}
                                                </div>
                                                <div className="relative flex-1 group/input">
                                                    <Input
                                                        value={group.name}
                                                        onChange={(e) => updateSectionName(group.id, e.target.value)}
                                                        placeholder="Nhập tên phần (vd: Thiết kế, Media...)"
                                                        className="bg-transparent border-none text-white font-bold text-sm h-8 focus-visible:ring-0 px-0 placeholder:text-white/30 truncate"
                                                    />
                                                    <div className="absolute bottom-0 left-0 w-full h-px bg-white/10 group-focus-within/input:bg-white/40 transition-colors" />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSection(group.id)}
                                                className="text-white/40 hover:text-red-400 hover:bg-white/5 h-8 px-3 rounded-md transition-all font-semibold text-[11px] border-none shadow-none"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                Xoá phần
                                            </Button>
                                        </div>

                                        <div className="w-full overflow-x-auto pb-4">
                                            <Table className="min-w-[900px]">
                                                <TableHeader className="bg-white">
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
                                                    {(() => {
                                                        // Linear numbering calculation
                                                        let globalStartIndex = 0;
                                                        for (let i = 0; i < groupIdx; i++) {
                                                            globalStartIndex += (sectionGroups[i]?.items?.length || 0);
                                                        }

                                                        return group.items.map((item, itemIdx) => (
                                                            <TableRow key={item.id} className="group/row">
                                                                <TableCell className="pl-4 py-4 align-top">
                                                                    <div className="flex flex-col gap-1 items-center">
                                                                        <span className="text-[10px] font-bold text-slate-400 mb-1">{globalStartIndex + itemIdx + 1}</span>
                                                                        <div className="flex flex-col gap-1 opacity-20 group-hover/row:opacity-100 transition-opacity">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6"
                                                                                onClick={() => moveItem(item.actualIndex!, 'up')}
                                                                                disabled={item.actualIndex === 0}
                                                                            >
                                                                                <ArrowUp className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6"
                                                                                onClick={() => moveItem(item.actualIndex!, 'down')}
                                                                                disabled={item.actualIndex === items.length - 1}
                                                                            >
                                                                                <ArrowDown className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="align-top py-4">
                                                                    <div className="space-y-2">
                                                                        <div className="flex gap-1">
                                                                            <ProductCombobox
                                                                                products={products || []}
                                                                                value={item.product_id || ''}
                                                                                onSelect={(v) => updateItem(item.id!, { product_id: v })}
                                                                            />
                                                                            {item.product_id && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        updateItem(item.id!, { product_id: '', product_name: '' })
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
                                                                            onChange={(e) => updateItem(item.id!, { product_name: e.target.value })}
                                                                            className="h-9 font-medium"
                                                                        />

                                                                        <Textarea
                                                                            placeholder="Quy cách / Mô tả kỹ thuật (vd: A5 2 mặt, C150...)"
                                                                            value={item.description || ""}
                                                                            onChange={(e) => updateItem(item.id!, { description: e.target.value })}
                                                                            className="h-16 text-[12px] min-h-[40px] resize-y"
                                                                            rows={1}
                                                                        />

                                                                        <div className="flex flex-wrap items-center gap-4 mt-2 mb-1 p-2 rounded-md bg-stone-50 border border-stone-100">
                                                                            <div className="flex items-center space-x-2">
                                                                                <Checkbox
                                                                                    id={`optional-${item.id}`}
                                                                                    checked={!!item.is_optional}
                                                                                    onCheckedChange={(c) => updateItem(item.id!, { is_optional: c === true })}
                                                                                />
                                                                                <Label htmlFor={`optional-${item.id}`} className="text-[11px] font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">Tùy chọn (Option / Không bắt buộc)</Label>
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] font-bold text-muted-foreground mr-1">Thuộc phương án:</span>
                                                                                <Input
                                                                                    value={item.alternative_group || ''}
                                                                                    onChange={(e) => updateItem(item.id!, { alternative_group: e.target.value })}
                                                                                    placeholder="VD: PA 1 / Gói Cao Cấp"
                                                                                    className="h-6 w-32 text-[11px] focus-visible:ring-1 focus-visible:ring-offset-0 px-2"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="align-top py-4">
                                                                    <Input
                                                                        placeholder="ĐVT"
                                                                        value={item.unit}
                                                                        onChange={(e) => updateItem(item.id!, { unit: e.target.value })}
                                                                        className="h-9"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="align-top py-4">
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItem(item.id!, { quantity: parseInt(e.target.value) || 1 })}
                                                                        className="h-9"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="align-top py-4">
                                                                    <PriceInput
                                                                        value={item.unit_price || 0}
                                                                        onChange={(val) => updateItem(item.id!, { unit_price: val })}
                                                                        className="h-9"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="align-top py-4">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        value={item.discount}
                                                                        onChange={(e) => updateItem(item.id!, { discount: parseInt(e.target.value) || 0 })}
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
                                                                        onClick={() => removeItem(item.id!)}
                                                                        className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ));
                                                    })()}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="bg-white p-4 border-t border-slate-200">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addItemToSection(group.name, group.id)}
                                                className="w-full h-9 border border-dashed rounded-md text-muted-foreground transition-all font-medium"
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Thêm sản phẩm vào phần "{group.name || 'này'}"
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
                    <Card className="overflow-hidden">
                        <CardHeader className="py-6 px-6">
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
                    <Card className="overflow-hidden">
                        <CardHeader className="py-6 px-6">
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
                <Card className="sticky bottom-6 z-10 mt-12 shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden">
                    <CardHeader className="py-6 px-6">
                        <CardTitle>Tổng kết & Hoàn tất</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 flex flex-col sm:flex-row gap-12 w-full md:w-auto">
                                <div className="space-y-1">
                                    <p className="text-[11px] text-zinc-400">Tạm tính</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-zinc-950">{formatNumber(subtotal)}</span>
                                        <span className="text-xs font-bold text-zinc-950">đ</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[11px] text-zinc-400">Thuế VAT</p>
                                    <div className="flex items-center gap-3">
                                        <Select value={vatPercent.toString()} onValueChange={(v) => setVatPercent(parseInt(v))}>
                                            <SelectTrigger className="w-24 h-9 text-xs font-bold border-zinc-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0%</SelectItem>
                                                <SelectItem value="8">8%</SelectItem>
                                                <SelectItem value="10">10%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-zinc-950">{formatNumber(vatAmount)}</span>
                                            <span className="text-[10px] font-bold text-zinc-950">đ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[11px] text-zinc-400">Tổng cộng</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-zinc-950">{formatNumber(totalAmount)}</span>
                                        <span className="text-sm font-bold text-zinc-950 underline decoration-2">đ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="text-zinc-500 hover:text-zinc-900"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleSave(true)}
                                    disabled={isLoading}
                                    className="font-semibold"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                    Lưu & Gửi
                                </Button>
                                <Button
                                    onClick={() => handleSave(false)}
                                    disabled={isLoading}
                                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddSectionOpen(false)}>Hủy</Button>
                        <Button onClick={handleConfirmAddSection}>Thêm mới</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Nhập Proposal JSON */}
            <Dialog open={isImportProposalOpen} onOpenChange={setIsImportProposalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nhập nội dung Proposal</DialogTitle>
                        <DialogDescription>
                            Dán nội dung JSON đã copy để nhập nhanh các phần thông tin proposal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Dán mã JSON tại đây..."
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            className="min-h-[300px] font-mono text-xs"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportProposalOpen(false)}>Hủy</Button>
                        <Button onClick={handleImportProposal}>Nhập nội dung</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Nhập toàn bộ Quotation JSON */}
            <Dialog open={isImportJsonOpen} onOpenChange={setIsImportJsonOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-zinc-900" />
                            Nhập toàn bộ Báo giá từ JSON
                        </DialogTitle>
                        <DialogDescription>
                            Đồng bộ nhanh khách hàng, hạng mục, các điều khoản và thông tin ngân hàng.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto py-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold">Dữ liệu JSON</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] tracking-tight font-bold"
                                    onClick={() => {
                                        navigator.clipboard.writeText(importJsonText)
                                        toast.success('Đã copy JSON')
                                    }}
                                >
                                    <Copy className="h-3 w-3 mr-1" /> Copy JSON
                                </Button>
                            </div>
                            <div className="relative group">
                                <Textarea
                                    placeholder='{ "title": "...", "items": [...], ... }'
                                    value={importJsonText}
                                    onChange={(e) => {
                                        setImportJsonText(e.target.value)
                                        try {
                                            if (e.target.value.trim()) {
                                                JSON.parse(e.target.value)
                                                setJsonError(null)
                                            } else {
                                                setJsonError(null)
                                            }
                                        } catch (err: any) {
                                            setJsonError(err.message)
                                        }
                                    }}
                                    onKeyUp={(e: any) => {
                                        const pos = e.target.selectionStart
                                        const text = e.target.value.substring(0, pos)
                                        // Simple heuristic to show scope
                                        let stack: string[] = []
                                        let currentKey = ""
                                        const matches = text.matchAll(/("[\w_]+"\s*:(?:\s*[\{\[])|[\{\}\[\]])/g)
                                        for (const match of matches) {
                                            const token = match[0]
                                            if (token.includes('{') || token.includes('[')) {
                                                const keyMatch = token.match(/"([\w_]+)"/)
                                                stack.push(keyMatch ? keyMatch[1] : (token.includes('{') ? '{}' : '[]'))
                                            } else if (token === '}' || token === ']') {
                                                stack.pop()
                                            }
                                        }
                                        setJsonPath(stack.length > 0 ? stack.join(' > ') : 'Root')
                                    }}
                                    className={cn(
                                        "min-h-[350px] font-mono text-xs p-4 border-slate-200 focus:bg-white transition-colors",
                                        jsonError && "border-red-300 ring-1 ring-red-100"
                                    )}
                                />
                                {jsonPath && (
                                    <div className="absolute bottom-2 right-4 text-[10px] font-mono text-zinc-400 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-zinc-100 pointer-events-none">
                                        Scope: {jsonPath}
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                {jsonError ? (
                                    <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span>Lỗi JSON: {jsonError}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Cấu trúc JSON hợp lệ</span>
                                    </div>
                                )}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-[11px] font-bold"
                                    onClick={() => {
                                        try {
                                            const obj = JSON.parse(importJsonText)
                                            setImportJsonText(JSON.stringify(obj, null, 2))
                                            toast.success('Đã định dạng JSON')
                                        } catch (e) {
                                            toast.error('Không thể định dạng: JSON lỗi')
                                        }
                                    }}
                                >
                                    <RotateCcw className="h-3 w-3 mr-1.5" /> Định dạng JSON
                                </Button>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-lg text-xs text-slate-600">
                            <p className="font-bold mb-1">Các trường hỗ trợ:</p>
                            <code className="block whitespace-pre opacity-80">
                                {'{\n  "title": "Tên báo giá",\n  "quotation_number": "Q-001",\n  "type": "standard | proposal",\n  "vat_percent": 10,\n  "validity_days": 30,\n  "terms": "Điều khoản...",\n  "notes": "Ghi chú...",\n  "bank_name": "TECHCOMBANK",\n  "bank_account_no": "123456789",\n  "bank_account_name": "CONG TY...",\n  "bank_branch": "Hà Nội",\n  "items": [\n    {\n      "section_name": "Thiết kế",\n      "product_name": "Logo",\n      "description": "Mô tả...",\n      "quantity": 1,\n      "unit": "bộ",\n      "unit_price": 5000000,\n      "discount": 0\n    }\n  ],\n  "proposal_content": { ... }\n}'}
                            </code>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportJsonOpen(false)}>Hủy</Button>
                        <Button onClick={handleImportJson} disabled={!importJsonText.trim()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Nhập và đồng bộ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
