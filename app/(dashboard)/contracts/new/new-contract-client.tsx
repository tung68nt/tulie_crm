'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { createContract } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'

interface Milestone {
 id: string
 name: string
 amount: number
 due_date: Date | undefined
}

interface NewContractClientProps {
 initialCustomers: any[]
 initialQuotations: any[]
}

function NewContractForm({ initialCustomers, initialQuotations }: NewContractClientProps) {
 const router = useRouter()
 const searchParams = useSearchParams()
 const fromQuoteId = searchParams.get('from_quote')

 const [isLoading, setIsLoading] = useState(false)
 const [customerId, setCustomerId] = useState('')
 const [quotationId, setQuotationId] = useState(fromQuoteId || '')
 const [title, setTitle] = useState('')
 const [totalValue, setTotalValue] = useState(0)
 const [startDate, setStartDate] = useState<Date>()
 const [endDate, setEndDate] = useState<Date>()
 const [terms, setTerms] = useState('')

 const [milestones, setMilestones] = useState<Milestone[]>([
 { id: '1', name: 'Đặt cọc 50%', amount: 0, due_date: undefined },
 ])

 const addMilestone = () => {
 setMilestones([
 ...milestones,
 { id: Date.now().toString(), name: '', amount: 0, due_date: undefined },
 ])
 }

 const removeMilestone = (id: string) => {
 if (milestones.length > 1) {
 setMilestones(milestones.filter((m) => m.id !== id))
 }
 }

 const updateMilestone = (id: string, field: keyof Milestone, value: string | number | Date | undefined) => {
 setMilestones(
 milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
 )
 }

 const handleQuotationChange = (qId: string) => {
 setQuotationId(qId)
 const quote = initialQuotations.find(q => q.id === qId)
 if (quote) {
 setCustomerId(quote.customer_id)
 setTotalValue(quote.total_amount)
 setTitle(`Hợp đồng triển khai - ${quote.quotation_number}`)
 }
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!customerId || !title) {
 toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
 return
 }

 setIsLoading(true)
 try {
 const contractData = {
 contract_number: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
 customer_id: customerId,
 quotation_id: quotationId || undefined,
 title,
 total_amount: totalValue,
 start_date: startDate?.toISOString(),
 end_date: endDate?.toISOString(),
 status: 'active',
 terms,
 created_by: '00000000-0000-0000-0000-000000000000'
 }

 const milestoneData = milestones.map(m => ({
 name: m.name,
 amount: m.amount,
 due_date: m.due_date?.toISOString() || "",
 status: 'pending' as any
 }))

 await createContract(contractData as any, milestoneData)

 toast.success('Tạo hợp đồng thành công')
 router.push('/contracts')
 router.refresh()
 } catch (error) {
 console.error('Failed to create contract:', error)
 toast.error('Có lỗi xảy ra khi tạo hợp đồng')
 } finally {
 setIsLoading(false)
 }
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" asChild>
 <Link href="/contracts">
 <ArrowLeft className="h-5 w-5" />
 </Link>
 </Button>
 <div>
 <h1 className="text-3xl font-semibold">Tạo hợp đồng mới</h1>
 <p className="text-muted-foreground">
 {fromQuoteId ? 'Tạo hợp đồng từ báo giá' : 'Nhập thông tin hợp đồng'}
 </p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid gap-6 lg:grid-cols-2">
 {/* Basic Info */}
 <Card>
 <CardHeader>
 <CardTitle>Thông tin hợp đồng</CardTitle>
 <CardDescription>Thông tin cơ bản của hợp đồng</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label>Báo giá liên quan</Label>
 <Select value={quotationId} onValueChange={handleQuotationChange}>
 <SelectTrigger>
 <SelectValue placeholder="Chọn báo giá (tùy chọn)" />
 </SelectTrigger>
 <SelectContent>
 {initialQuotations.map((q) => (
 <SelectItem key={q.id} value={q.id}>
 {q.quotation_number} - {formatCurrency(q.total_amount)}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label>Khách hàng <span className="text-destructive">*</span></Label>
 <Select value={customerId} onValueChange={setCustomerId}>
 <SelectTrigger>
 <SelectValue placeholder="Chọn khách hàng" />
 </SelectTrigger>
 <SelectContent>
 {initialCustomers.map((c) => (
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
 placeholder="VD: Hợp đồng phát triển website"
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
 placeholder="Các điều khoản của hợp đồng..."
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
 <div className="space-y-2">
 <Label>Mô tả</Label>
 <Input
 value={milestone.name}
 onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
 placeholder="VD: Đặt cọc 50%"
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
 {totalValue > 0 && (
 <p className="text-sm text-muted-foreground mt-1">
 Giá trị hợp đồng: {formatCurrency(totalValue)}
 </p>
 )}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-4">
 <Button type="button" variant="outline" asChild>
 <Link href="/contracts">Hủy</Link>
 </Button>
 <Button type="submit" disabled={isLoading}>
 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 <Save className="mr-2 h-4 w-4" />
 Tạo hợp đồng
 </Button>
 </div>
 </form>
 </div>
 )
}

export default function NewContractClient(props: NewContractClientProps) {
 return (
 <Suspense fallback={<div className="p-6">Đang tải...</div>}>
 <NewContractForm {...props} />
 </Suspense>
 )
}
