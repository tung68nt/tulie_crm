import { Suspense } from 'react'
import { getRetailOrders } from '@/lib/supabase/services/retail-order-service'
import { RetailOrderList } from '@/components/studio/order-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { Camera, Plus, Clock, CheckCircle, ShoppingCart } from 'lucide-react'

export default async function StudioPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                        <Camera className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Đơn hàng Studio</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Quản lý đơn hàng chụp ảnh cá nhân & Studio.</p>
                    </div>
                </div>
                <Button asChild className="rounded-xl font-bold shadow-md shadow-zinc-200">
                    <Link href="/studio/new">
                        <Plus className="mr-2 h-4 w-4" /> Tạo đơn mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<OrderListSkeleton />}>
                <OrderListWrapper />
            </Suspense>
        </div>
    )
}

async function OrderListWrapper() {
    const orders = await getRetailOrders()
    const activeOrders = orders.filter((c) => c.order_status === 'pending' || c.order_status === 'shooting' || c.order_status === 'editing').length
    const completedOrders = orders.filter((c) => c.order_status === 'completed').length
    const totalValue = orders.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                            Đang thực hiện
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{activeOrders}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                            Đã hoàn thành
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{completedOrders}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                            Tổng giá trị
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{formatCurrency(totalValue)}</div>
                    </CardContent>
                </Card>
            </div>

            <RetailOrderList initialData={orders} />
        </div>
    )
}

function OrderListSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-10 w-48" />
            </div>
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}
