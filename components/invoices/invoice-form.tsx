'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Save, FileUp, Search } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { Invoice, Customer, Vendor, Contract, Project } from '@/types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface InvoiceFormProps {
    invoice: Invoice
    customers: Customer[]
    vendors: Vendor[]
    contracts: Contract[]
    projects?: Project[]
}

export function InvoiceForm({ invoice, customers, vendors, contracts, projects = [] }: InvoiceFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number)
    const [type, setType] = useState(invoice.type)
    const [customerId, setCustomerId] = useState(invoice.customer_id || '')
    const [vendorId, setVendorId] = useState(invoice.vendor_id || '')
    const [contractId, setContractId] = useState(invoice.contract_id || '')
    const [projectId, setProjectId] = useState((invoice as any).project_id || '')
    const [issueDate, setIssueDate] = useState<Date | undefined>(
        invoice.issue_date ? new Date(invoice.issue_date) : undefined
    )
    const [dueDate, setDueDate] = useState<Date | undefined>(
        invoice.due_date ? new Date(invoice.due_date) : undefined
    )
    const [status, setStatus] = useState(invoice.status)
    const [totalAmount, setTotalAmount] = useState(invoice.total_amount || 0)
    const [vatAmount, setVatAmount] = useState(invoice.vat_amount || 0)
    const [paidAmount, setPaidAmount] = useState(invoice.paid_amount || 0)
    const [pdfUrl, setPdfUrl] = useState(invoice.pdf_url || '')
    const [lookupInfo, setLookupInfo] = useState(invoice.lookup_info || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const supabase = createClient()

            const { error } = await supabase
                .from('invoices')
                .update({
                    invoice_number: invoiceNumber,
                    type,
                    customer_id: type === 'output' ? (customerId || null) : null,
                    vendor_id: type === 'input' ? (vendorId || null) : null,
                    contract_id: contractId || null,
                    project_id: projectId || null,
                    issue_date: issueDate?.toISOString(),
                    due_date: dueDate?.toISOString(),
                    status,
                    total_amount: totalAmount,
                    vat_amount: vatAmount,
                    subtotal: totalAmount - vatAmount,
                    vat_percent: totalAmount > 0 ? Math.round((vatAmount / (totalAmount - vatAmount)) * 100) : 0,
                    paid_amount: paidAmount,
                    pdf_url: pdfUrl || null,
                    lookup_info: lookupInfo || null,
                })
                .eq('id', invoice.id)

            if (error) throw error

            toast.success('Cập nhật hóa đơn thành công')
            router.push(`/invoices/${invoice.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Error updating invoice:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hóa đơn')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/invoices/${invoice.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold">Chỉnh sửa {invoice.invoice_number}</h1>
                        <p className="text-muted-foreground">Theo dõi hoá đơn</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Amount Tracking */}
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
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Đã thanh toán</Label>
                                    <Input
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Còn lại</Label>
                                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold">
                                        {formatCurrency(totalAmount - paidAmount)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File & Lookup */}
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
                                    placeholder="https://drive.google.com/... hoặc upload link"
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

                <div className="space-y-6">
                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Loại</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
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
                                <Label>Số hoá đơn</Label>
                                <Input
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Bản nháp</SelectItem>
                                        <SelectItem value="sent">Đã gửi</SelectItem>
                                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                                        <SelectItem value="partial">Thanh toán 1 phần</SelectItem>
                                        <SelectItem value="overdue">Quá hạn</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {type === 'output' ? (
                                <div className="space-y-2">
                                    <Label>Khách hàng</Label>
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn khách hàng..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Nhà cung cấp</Label>
                                    <Select value={vendorId} onValueChange={setVendorId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn nhà cung cấp..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vendors.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Dự án</Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn dự án..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Hợp đồng</Label>
                                <Select value={contractId} onValueChange={setContractId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn hợp đồng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        {contracts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ngày phát hành</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {issueDate ? format(issueDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={issueDate} onSelect={setIssueDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hạn thanh toán</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
