'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Loader2, Save, FileUp, Search } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createInvoice } from '@/lib/supabase/services/invoice-service'
import { toast } from 'sonner'

interface NewInvoiceClientProps {
    initialCustomers: any[]
    initialContracts: any[]
    initialQuotations: any[]
    initialProjects?: any[]
    brandConfig?: any
}

function NewInvoiceForm({ initialCustomers, initialContracts, initialProjects = [], brandConfig }: NewInvoiceClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const fromContractId = searchParams.get('contract')
    const fromProjectId = searchParams.get('project')

    const [isLoading, setIsLoading] = useState(false)
    const [invoiceType, setInvoiceType] = useState<'output' | 'input'>('output')
    const [customerId, setCustomerId] = useState('')
    const [contractId, setContractId] = useState(fromContractId || '')
    const [projectId, setProjectId] = useState(fromProjectId || '')
    const [issueDate, setIssueDate] = useState<Date>(new Date())
    const [dueDate, setDueDate] = useState<Date>()
    const [totalAmount, setTotalAmount] = useState(0)
    const [vatAmount, setVatAmount] = useState(0)
    const [pdfUrl, setPdfUrl] = useState('')
    const [lookupInfo, setLookupInfo] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }

        setIsLoading(true)
        try {
            const invoiceData = {
                type: invoiceType,
                customer_id: invoiceType === 'output' ? customerId : null,
                vendor_id: invoiceType === 'input' ? customerId : null,
                contract_id: contractId || null,
                project_id: projectId || null,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                issue_date: issueDate.toISOString(),
                due_date: dueDate?.toISOString() || null,
                status: 'sent',
                subtotal: totalAmount - vatAmount,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                paid_amount: 0,
                pdf_url: pdfUrl || null,
                lookup_info: lookupInfo || null,
                created_by: '00000000-0000-0000-0000-000000000000'
            }

            await createInvoice(invoiceData as any, [])

            toast.success('Tạo hóa đơn thành công')
            router.push('/invoices')
            router.refresh()
        } catch (error) {
            console.error('Failed to create invoice:', error)
            toast.error('Có lỗi xảy ra khi tạo hóa đơn')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/invoices">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold">Thêm hoá đơn</h1>
                    <p className="text-muted-foreground">Theo dõi hoá đơn bán hàng hoặc mua vào</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin hoá đơn</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Loại hoá đơn</Label>
                                        <Select value={invoiceType} onValueChange={(v) => setInvoiceType(v as 'output' | 'input')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="output">Bán ra (Xuất)</SelectItem>
                                                <SelectItem value="input">Mua vào (Nhập)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{invoiceType === 'output' ? 'Khách hàng' : 'Nhà cung cấp'} <span className="text-destructive">*</span></Label>
                                        <Select value={customerId} onValueChange={setCustomerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Chọn ${invoiceType === 'output' ? 'khách hàng' : 'nhà cung cấp'}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialCustomers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.company_name || c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Dự án</Label>
                                        <Select value={projectId} onValueChange={setProjectId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn dự án..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Không chọn</SelectItem>
                                                {initialProjects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hợp đồng</Label>
                                        <Select value={contractId} onValueChange={setContractId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn hợp đồng..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Không chọn</SelectItem>
                                                {initialContracts.filter(c => !customerId || c.customer_id === customerId).map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.contract_number} ({formatCurrency(c.total_amount)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Ngày phát hành</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {issueDate ? format(issueDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={issueDate} onSelect={(d) => d && setIssueDate(d)} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hạn thanh toán</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dueDate ? format(dueDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amount */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tài chính</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Tổng tiền hoá đơn</Label>
                                        <Input
                                            type="number"
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Thuế VAT</Label>
                                        <Input
                                            type="number"
                                            value={vatAmount}
                                            onChange={(e) => setVatAmount(parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* File */}
                        <Card>
                            <CardHeader>
                                <CardTitle>File hoá đơn</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileUp className="w-4 h-4" />
                                        Link file PDF hoá đơn VAT
                                    </Label>
                                    <Input
                                        value={pdfUrl}
                                        onChange={(e) => setPdfUrl(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Search className="w-4 h-4" />
                                        Mã tra cứu HĐ điện tử
                                    </Label>
                                    <Input
                                        value={lookupInfo}
                                        onChange={(e) => setLookupInfo(e.target.value)}
                                        placeholder="Mã tra cứu hoặc link portal hóa đơn điện tử"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tổng kết</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Trước thuế</span>
                                    <span className="font-medium">{formatCurrency(totalAmount - vatAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Thuế VAT</span>
                                    <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-2">
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Tạo hoá đơn
                            </Button>
                            <Button type="button" variant="outline" asChild className="w-full">
                                <Link href="/invoices">Hủy</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default function NewInvoiceClient(props: NewInvoiceClientProps) {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <NewInvoiceForm {...props} />
        </Suspense>
    )
}
