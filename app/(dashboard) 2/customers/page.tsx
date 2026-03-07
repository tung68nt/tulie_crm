import { DataTable } from '@/components/shared/data-table'
import { customerColumns } from '@/components/customers/customer-columns'
import { Button } from '@/components/ui/button'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { Plus, Upload, Download } from 'lucide-react'
import Link from 'next/link'
import { CustomerTableClient } from '@/components/customers/customer-table-client'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
 const [customers, users] = await Promise.all([
 getCustomers(),
 getUsers(),
 ])

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-semibold">Khách hàng</h1>
 <p className="text-muted-foreground">
 Quản lý danh sách khách hàng và thông tin liên hệ
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm">
 <Upload className="mr-2 h-4 w-4" />
 Import
 </Button>
 <Button variant="outline" size="sm">
 <Download className="mr-2 h-4 w-4" />
 Export
 </Button>
 <Button asChild>
 <Link href="/customers/new">
 <Plus className="mr-2 h-4 w-4" />
 Thêm khách hàng
 </Link>
 </Button>
 </div>
 </div>

 <CustomerTableClient data={customers} users={users} />
 </div>
 )
}
