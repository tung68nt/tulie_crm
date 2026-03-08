import { RetailOrderForm } from '@/components/studio/order-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function NewRetailOrderPage() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/studio">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Tạo đơn hàng Studio
                    </h1>
                    <p className="text-muted-foreground text-sm">Xử lý đơn hàng chụp ảnh, in ấn & dịch vụ cá nhân.</p>
                </div>
            </div>

            <RetailOrderForm />
        </div>
    )
}
