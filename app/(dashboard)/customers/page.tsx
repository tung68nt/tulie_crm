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
import { Plus, Upload, Download, Users } from 'lucide-react'
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                        <Users className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Khách hàng Agency</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý danh sách khách hàng và thông tin liên hệ cho Agency
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="default" className="rounded-xl font-bold shadow-sm border-border/50">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="default" className="rounded-xl font-bold shadow-sm border-border/50">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild size="default" className="rounded-xl font-bold shadow-md shadow-zinc-200">
                        <Link href="/customers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm khách hàng
                        </Link>
                    </Button>
                </div>
            </div>

            <CustomerTableClient data={customers} users={users} defaultTab="business" hideTabs={true} />
        </div>
    )
}
