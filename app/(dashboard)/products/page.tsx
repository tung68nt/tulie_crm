import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Box } from 'lucide-react'
import Link from 'next/link'
import { productColumns } from '@/components/products/product-columns'
import { getProducts } from '@/lib/supabase/services/product-service'

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                        <Box className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Sản phẩm & Dịch vụ</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý danh mục sản phẩm và dịch vụ của công ty
                        </p>
                    </div>
                </div>
                <Button asChild className="rounded-xl font-bold shadow-md shadow-zinc-200">
                    <Link href="/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm sản phẩm
                    </Link>
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                columns={productColumns}
                data={products}
                searchKey="name"
                searchPlaceholder="Tìm theo tên sản phẩm..."
            />
        </div>
    )
}
