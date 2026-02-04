import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { productColumns } from '@/components/products/product-columns'
import { getProducts } from '@/lib/supabase/services/product-service'

export default async function ProductsPage() {
 const products = await getProducts()

 return (
 <div className="space-y-6">
 {/* Page Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-semibold">Sản phẩm & Dịch vụ</h1>
 <p className="text-muted-foreground">
 Quản lý danh mục sản phẩm và dịch vụ của công ty
 </p>
 </div>
 <Button asChild>
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
