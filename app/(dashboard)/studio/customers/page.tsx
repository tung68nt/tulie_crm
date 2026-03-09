import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { Plus, Upload, Download, Users, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CustomerTableClient } from '@/components/customers/customer-table-client'

export const dynamic = 'force-dynamic'

export default async function StudioCustomersPage() {
    const [customers, users] = await Promise.all([
        getCustomers(),
        getUsers(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Khách hàng Studio</h1>
                        <p className="text-muted-foreground font-normal">
                            Quản lý danh sách khách hàng cá nhân cho khối Studio
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất file
                    </Button>
                    <Button asChild className="rounded-xl bg-zinc-900">
                        <Link href="/studio/new?step=customer">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm khách hàng
                        </Link>
                    </Button>
                </div>
            </div>

            <CustomerTableClient data={customers} users={users} defaultTab="individual" />
        </div>
    )
}
