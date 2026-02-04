import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/format'
import { Plus, Download, Receipt, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getInvoices, deleteInvoices } from '@/lib/supabase/services/invoice-service'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { invoiceColumns } from '@/components/invoices/invoice-columns'

export default async function InvoicesPage() {
 const invoices = await getInvoices()
 const outputInvoices = invoices.filter(i => i.type === 'output')
 const inputInvoices = invoices.filter(i => i.type === 'input')

 const totalReceivable = outputInvoices
 .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
 .reduce((sum, i) => sum + ((i.total_amount || 0) - (i.paid_amount || 0)), 0)

 const overdueCount = outputInvoices.filter((i) => i.status === 'overdue').length

 return (
 <div className="space-y-6">
 {/* Page Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-semibold">Hóa đơn</h1>
 <p className="text-muted-foreground">
 Quản lý hóa đơn bán hàng và mua vào
 </p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline">
 <Download className="mr-2 h-4 w-4" />
 Xuất Excel
 </Button>
 <Button asChild>
 <Link href="/invoices/new">
 <Plus className="mr-2 h-4 w-4" />
 Tạo hóa đơn
 </Link>
 </Button>
 </div>
 </div>

 {/* Stats */}
 <div className="grid gap-4 md:grid-cols-2">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Công nợ phải thu (Bán hàng)
 </CardTitle>
 <Receipt className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-semibold">{formatCurrency(totalReceivable)}</div>
 </CardContent>
 </Card>
 <Card className={overdueCount > 0 ? 'border-destructive' : ''}>
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-sm font-medium text-muted-foreground">
 Hóa đơn bán hàng quá hạn
 </CardTitle>
 <AlertCircle className={`h-4 w-4 ${overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
 </CardHeader>
 <CardContent>
 <div className={`text-2xl font-semibold ${overdueCount > 0 ? 'text-destructive' : ''}`}>
 {overdueCount}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="output" className="space-y-4">
 <TabsList>
 <TabsTrigger value="output">Hóa đơn bán hàng ({outputInvoices.length})</TabsTrigger>
 <TabsTrigger value="input">Hóa đơn mua vào ({inputInvoices.length})</TabsTrigger>
 </TabsList>

 <TabsContent value="output">
 <InvoiceTableInitialData data={outputInvoices} prefix="output" />
 </TabsContent>

 <TabsContent value="input">
 <InvoiceTableInitialData data={inputInvoices} prefix="input" />
 </TabsContent>
 </Tabs>
 </div>
 )
}

async function InvoiceTableInitialData({ data, prefix }: { data: any[], prefix: string }) {
 const handleDelete = async (rows: any[]) => {
 'use server'
 const ids = rows.map((r) => r.id)
 await deleteInvoices(ids)
 }

 return (
 <DataTable
 columns={invoiceColumns}
 data={data}
 searchKey="invoice_number"
 searchPlaceholder="Tìm theo số hóa đơn..."
 onDelete={handleDelete}
 />
 )
}
