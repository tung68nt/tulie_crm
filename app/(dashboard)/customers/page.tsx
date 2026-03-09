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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-950 tracking-tighter">Khách hàng Agency</h1>
                        <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest opacity-60">
                            Quản lý danh sách khách hàng và thông tin liên hệ cho Agency
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-zinc-200">
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-zinc-200">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild className="rounded-xl bg-zinc-950 hover:bg-zinc-800 transition-all font-black uppercase text-[11px] tracking-widest px-6 h-10">
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
