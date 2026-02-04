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
import { ArrowLeft, CalendarIcon, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Contract, ContractMilestone, Customer, Quotation } from '@/types'
import { updateContract } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'

interface MilestoneItem {
    id: string
    name: string
    amount: number
    due_date: Date | undefined
    status: string
}

interface ContractFormProps {
    contract: Contract
    customers: Customer[]
    quotations: Quotation[]
}

export function ContractForm({ contract, customers, quotations }: ContractFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [customerId, setCustomerId] = useState(contract.customer_id)
    const [quotationId, setQuotationId] = useState(contract.quotation_id || '')
    const [title, setTitle] = useState(contract.title || '')
    const [totalValue, setTotalValue] = useState(contract.total_amount || 0)
    const [startDate, setStartDate] = useState<Date | undefined>(
        contract.start_date ? new Date(contract.start_date) : undefined
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        contract.end_date ? new Date(contract.end_date) : undefined
    )
    const [status, setStatus] = useState(contract.status)
    const [terms, setTerms] = useState(contract.terms || '')

    const [milestones, setMilestones] = useState<MilestoneItem[]>(
        contract.milestones?.map(m => ({
            id: m.id,
            name: m.name,
            amount: m.amount,
            due_date: m.due_date ? new Date(m.due_date) : undefined,
            status: m.status
        })) || []
    )

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: `temp-${Date.now()}`, name: '', amount: 0, due_date: undefined, status: 'pending' },
        ])
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((m) => m.id !== id))
        }
    }

    const updateMilestone = (id: string, field: keyof MilestoneItem, value: any) => {
        setMilestones(
            milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId || !title) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        setIsLoading(true)
        try {
            const updateData: Partial<Contract> = {
                customer_id: customerId,
                quotation_id: quotationId || null,
                title,
                total_amount: totalValue,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
                status: status,
                terms,
            }

            const milestoneData = milestones.map(m => ({
                name: m.name,
                amount: m.amount,
                due_date: m.due_date?.toISOString(),
                status: m.status
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
                        <h1 className="text-3xl font-bold">Chỉnh sửa {contract.contract_number}</h1>
                        <p className="text-muted-foreground">Cập nhật thông tin hợp đồng</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                <Label>Tiêu đề hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Giá trị hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    value={totalValue}
                                    onChange={(e) => setTotalValue(parseInt(e.target.value) || 0)}
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
                                <Label>Điều khoản</Label>
                                <Textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={4}
                                />
                            </div>
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
                            {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Đợt {index + 1}</span>
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
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMilestone(milestone.id)}
                                                disabled={milestones.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={milestone.name}
                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Số tiền</Label>
                                            <Input
                                                type="number"
                                                value={milestone.amount}
                                                onChange={(e) => updateMilestone(milestone.id, 'amount', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hạn thanh toán</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                                </div>
                            ))}

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
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    )
}
