import { RetailOrderForm } from '@/components/studio/order-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function NewRetailOrderPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4 group">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 group-hover:scale-110 transition-transform">
                    <Link href="/studio">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold flex items-center gap-3">
                        Tạo đơn hàng Studio <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </h1>
                    <p className="text-muted-foreground text-sm">Xử lý nhanh đơn hàng chụp ảnh cá nhân & Retail.</p>
                </div>
            </div>

            <RetailOrderForm />
        </div>
    )
}
