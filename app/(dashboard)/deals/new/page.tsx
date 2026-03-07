import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { DealForm } from '@/components/deals/deal-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewDealPage() {
    const customers = await getCustomers()
    const users = await getUsers()

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/deals">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Tạo cơ hội mới</h1>
                    <p className="text-muted-foreground">Nhập thông tin cho cơ hội tiềm năng mới.</p>
                </div>
            </div>

            <DealForm customers={customers} users={users} />
        </div>
    )
}
