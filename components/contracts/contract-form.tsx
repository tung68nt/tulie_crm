'use client'

import { useState } from 'react'
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Save, Plus, Trash2, Percent } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Contract, ContractMilestone, Customer, Quotation } from '@/types'
import { updateContract } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Helper: parse '27,000,000' → 27000000
const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0
}
const formatNumber = (value: number): string => {
    return value ? new Intl.NumberFormat('vi-VN').format(value) : ''
}

interface MilestoneItem {
    id: string
    name: string
    amount: number
    percentage: number
    amount_mode: 'fixed' | 'percent'
    due_date: Date | undefined
    status: string
    completed_at: Date | undefined
    delay_reason: string
    type: 'payment' | 'work' | 'delivery'
}

interface ContractFormProps {
    contract: Contract
    customers: Customer[]
    quotations: Quotation[]
    projects: any[]
}

export function ContractForm({ contract, customers, quotations, projects }: ContractFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [customerId, setCustomerId] = useState(contract.customer_id)
    const [quotationId, setQuotationId] = useState(contract.quotation_id || '')
    const [projectId, setProjectId] = useState(contract.project_id || '')
    const [title, setTitle] = useState(contract.title || '')
    const [totalValue, setTotalValue] = useState(contract.total_amount || 0)
    const [startDate, setStartDate] = useState<Date | undefined>(
        contract.start_date ? new Date(contract.start_date) : undefined
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        contract.end_date ? new Date(contract.end_date) : undefined
    )
    const [signedDate, setSignedDate] = useState<Date | undefined>(
        contract.signed_date ? new Date(contract.signed_date) : undefined
    )
    const [status, setStatus] = useState(contract.status)
    const [terms, setTerms] = useState(contract.terms || '')
    const [contractType, setContractType] = useState(contract.type || 'contract')

    // Lock form when contract is signed/active/completed
    const isLocked = ['signed', 'active', 'completed'].includes(contract.status)

    // Customer abbreviation for document number generation
    const selectedCustomer = customers.find(c => c.id === customerId)
    const [customerAbbreviation, setCustomerAbbreviation] = useState(
        selectedCustomer?.abbreviation || ''
    )

    // Editable contract number
    const [contractNumber, setContractNumber] = useState(contract.contract_number || '')

    // Auto-generate contract number from signed_date + abbreviation
    const generateContractNumber = () => {
        if (!signedDate || !customerAbbreviation) {
            toast.error('Cần điền Ngày ký và Tên viết tắt KH trước')
            return
        }
        const dateStr = format(signedDate, 'yyyyMMdd')
        setContractNumber(`${dateStr}/HDKT-TL-${customerAbbreviation.toUpperCase()}`)
    }
    const [orderNumber, setOrderNumber] = useState(contract.order_number || '')

    const [milestones, setMilestones] = useState<MilestoneItem[]>(
        contract.milestones?.map(m => ({
            id: m.id,
            name: m.name,
            amount: m.amount,
            percentage: m.percentage || 0,
            amount_mode: (m.percentage && m.percentage > 0) ? 'percent' as const : 'fixed' as const,
            due_date: m.due_date ? new Date(m.due_date) : undefined,
            status: m.status as any,
            completed_at: m.completed_at ? new Date(m.completed_at) : undefined,
            delay_reason: m.delay_reason || '',
            type: m.type || 'payment'
        })) || []
    )

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: `temp-${Date.now()}`, name: '', amount: 0, percentage: 0, amount_mode: 'fixed', due_date: undefined, status: 'pending', completed_at: undefined, delay_reason: '', type: 'payment' },
        ])
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((m) => m.id !== id))
        }
    }

    const updateMilestone = (id: string, field: keyof MilestoneItem, value: any) => {
        setMilestones(
            milestones.map((m) => {
                if (m.id !== id) return m
                const updated = { ...m, [field]: value }
                // Auto-calc amount when percentage changes
                if (field === 'percentage' && updated.amount_mode === 'percent' && totalValue > 0) {
                    updated.amount = Math.round(totalValue * (updated.percentage / 100))
                }
                // When switching to percent mode, calc percentage from current amount
                if (field === 'amount_mode' && value === 'percent' && totalValue > 0 && updated.amount > 0) {
                    updated.percentage = Math.round((updated.amount / totalValue) * 10000) / 100
                }
                // When switching to fixed mode, keep amount as-is
                return updated
            })
        )
    }

    // Recalculate percent-mode milestone amounts when totalValue changes
    const handleTotalValueChange = (newValue: number) => {
        setTotalValue(newValue)
        if (newValue > 0) {
            setMilestones(prev => prev.map(m =>
                m.amount_mode === 'percent' && m.percentage > 0
                    ? { ...m, amount: Math.round(newValue * (m.percentage / 100)) }
                    : m
            ))
        }
    }

    // Validation warnings
    const missingFields: string[] = []
    if (!signedDate) missingFields.push('Ngày ký hợp đồng')
    if (!customerAbbreviation) missingFields.push('Tên viết tắt khách hàng')
    if (!totalValue) missingFields.push('Giá trị hợp đồng')
    if (milestones.filter(m => m.type === 'payment').length === 0) missingFields.push('Mốc thanh toán (ít nhất 1 đợt)')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId || !title) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Warn but don't block if missing non-critical fields
        if (missingFields.length > 0) {
            toast.warning(`Thiếu thông tin: ${missingFields.join(', ')}. Bộ giấy tờ có thể chưa đầy đủ.`)
        }

        setIsLoading(true)
        try {
            const updateData: Record<string, any> = {
                customer_id: customerId,
                title,
                total_amount: totalValue,
                start_date: startDate?.toISOString() || null,
                end_date: endDate?.toISOString() || null,
                signed_date: signedDate?.toISOString() || null,
                status: status,
                terms,
                type: contractType,
                order_number: orderNumber || null,
                project_id: projectId || null,
                contract_number: contractNumber || null,
            }
            // Add quotation_id only if set
            if (quotationId) updateData.quotation_id = quotationId

            // Update customer abbreviation if changed
            if (customerAbbreviation && customerId) {
                try {
                    const { createClient } = await import('@/lib/supabase/client')
                    const supabase = createClient()
                    await supabase
                        .from('customers')
                        .update({ abbreviation: customerAbbreviation })
                        .eq('id', customerId)
                } catch (e) {
                    console.warn('Failed to update customer abbreviation:', e)
                }
            }

            const milestoneData = milestones.map(m => ({
                name: m.name,
                amount: m.amount,
                percentage: m.amount_mode === 'percent' ? m.percentage : undefined,
                due_date: m.due_date?.toISOString(),
                status: m.status,
                completed_at: m.completed_at?.toISOString(),
                delay_reason: m.delay_reason,
                type: m.type
            }))

            await updateContract(contract.id, updateData, milestoneData as any)

            toast.success('Cập nhật hợp đồng thành công')
            router.push(`/contracts/${contract.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Failed to update contract:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hợp đồng')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/contracts/${contract.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold">Chỉnh sửa {contract.contract_number}</h1>
                        <p className="text-muted-foreground">Cập nhật thông tin hợp đồng</p>
                    </div>
                </div>
            </div>

            {isLocked && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300 font-medium">
                        Hợp đồng đã ký — không thể chỉnh sửa thông tin. Liên hệ admin nếu cần thay đổi.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isLocked} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Loại hồ sơ</Label>
                                <Select value={contractType} onValueChange={(v: any) => setContractType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contract">Hợp đồng</SelectItem>
                                        <SelectItem value="order">Đơn hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Bản nháp</SelectItem>
                                        <SelectItem value="active">Đang thực hiện</SelectItem>
                                        <SelectItem value="completed">Hoàn thành</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Khách hàng <span className="text-destructive">*</span></Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Dự án (Portal Group)</Label>
                                <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dự án..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không thuộc dự án --</SelectItem>
                                        {projects.filter(p => !customerId || p.customer_id === customerId).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tiêu đề hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Giá trị hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatNumber(totalValue)}
                                    onChange={(e) => handleTotalValueChange(parseFormattedNumber(e.target.value))}
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ngày bắt đầu</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kết thúc</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày ký hợp đồng <span className="text-destructive">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {signedDate ? format(signedDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày ký'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={signedDate} onSelect={setSignedDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Tên viết tắt KH <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={customerAbbreviation}
                                        onChange={(e) => setCustomerAbbreviation(e.target.value.toUpperCase())}
                                        placeholder="VD: VSTEM"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Dùng để tạo mã giấy tờ: HDKT-TL-{customerAbbreviation || 'XXX'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mã hợp đồng</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={contractNumber}
                                            onChange={(e) => setContractNumber(e.target.value)}
                                            placeholder="Nhập hoặc bấm Tạo mã"
                                            className="font-mono text-xs flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={generateContractNumber}
                                            className="shrink-0 text-xs"
                                        >
                                            Tạo mã
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Format: yyyymmdd/HDKT-TL-{customerAbbreviation || 'XXX'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Điều khoản</Label>
                                <Textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Mã đơn hàng</Label>
                                <Input
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="VD: PO-2023-001"
                                />
                            </div>

                            {missingFields.length > 0 && (
                                <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        <strong>Thông tin cần bổ sung:</strong> {missingFields.join(' • ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Milestone thanh toán</CardTitle>
                                <CardDescription>Phân chia các đợt thanh toán</CardDescription>
                            </div>
                            <Button type="button" size="sm" onClick={addMilestone}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones.map((milestone, index) => {
                                const isCompleted = milestone.status === 'completed'
                                return (
                                <div key={milestone.id} className={`p-4 border rounded-lg space-y-3 ${isCompleted ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">Đợt {index + 1}</span>
                                            {isCompleted && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium">
                                                    ✓ Đã ghi nhận
                                                </span>
                                            )}
                                            <Select
                                                value={milestone.type}
                                                onValueChange={(v) => updateMilestone(milestone.id, 'type', v)}
                                                disabled={isCompleted}
                                            >
                                                <SelectTrigger className="h-8 w-32 bg-muted/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="work">Đầu việc</SelectItem>
                                                    <SelectItem value="payment">Thanh toán</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={milestone.status}
                                                onValueChange={(v) => updateMilestone(milestone.id, 'status', v)}
                                            >
                                                <SelectTrigger className="h-8 w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Chờ</SelectItem>
                                                    <SelectItem value="completed">Đã xong</SelectItem>
                                                    <SelectItem value="overdue">Trễ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {!isCompleted && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMilestone(milestone.id)}
                                                disabled={milestones.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={milestone.name}
                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                            disabled={isCompleted}
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Số tiền</Label>
                                                {!isCompleted && (
                                                <Button
                                                    type="button"
                                                    variant={milestone.amount_mode === 'percent' ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="h-6 px-2 text-xs gap-1"
                                                    onClick={() => updateMilestone(milestone.id, 'amount_mode', milestone.amount_mode === 'fixed' ? 'percent' : 'fixed')}
                                                >
                                                    <Percent className="h-3 w-3" />
                                                    {milestone.amount_mode === 'percent' ? 'Theo %' : 'Cố định'}
                                                </Button>
                                                )}
                                            </div>
                                            {milestone.amount_mode === 'percent' ? (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step={0.01}
                                                            value={milestone.percentage || ''}
                                                            onChange={(e) => updateMilestone(milestone.id, 'percentage', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                            className="flex-1"
                                                            disabled={isCompleted}
                                                        />
                                                        <span className="text-sm text-muted-foreground shrink-0">%</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        = {formatCurrency(milestone.amount)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={formatNumber(milestone.amount)}
                                                    onChange={(e) => updateMilestone(milestone.id, 'amount', parseFormattedNumber(e.target.value))}
                                                    placeholder="0"
                                                    disabled={isCompleted}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hạn thanh toán (Dự kiến)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isCompleted}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {milestone.due_date ? format(milestone.due_date, 'dd/MM/yyyy') : 'Chọn'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={milestone.due_date}
                                                        onSelect={(date) => updateMilestone(milestone.id, 'due_date', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Ngày thực tế (Nếu có)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal border-dashed">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {milestone.completed_at ? format(milestone.completed_at, 'dd/MM/yyyy') : 'Chưa có'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={milestone.completed_at}
                                                        onSelect={(date) => updateMilestone(milestone.id, 'completed_at', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lý do trễ (Nếu trễ)</Label>
                                            <Input
                                                value={milestone.delay_reason}
                                                onChange={(e) => updateMilestone(milestone.id, 'delay_reason', e.target.value)}
                                                placeholder="VD: Chờ phản hồi khách hàng"
                                                disabled={isCompleted}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )
                            })}

                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between font-medium">
                                    <span>Tổng milestone</span>
                                    <span>{formatCurrency(milestones.reduce((sum, m) => sum + m.amount, 0))}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Giá trị hợp đồng: {formatCurrency(totalValue)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                {!isLocked && (
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
                )}
                </fieldset>
            </form>
        </div>
    )
}
