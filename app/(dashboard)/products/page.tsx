import { Product } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { productColumns } from '@/components/products/product-columns'

// Mock data
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Website Development',
        sku: 'WEB-DEV-001',
        category: 'Web Development',
        description: 'Custom website development',
        unit: 'dự án',
        unit_price: 50000000,
        cost_price: 30000000,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: '2',
        name: 'SEO Package - Basic',
        sku: 'SEO-BASIC-001',
        category: 'SEO',
        description: 'Basic SEO optimization package',
        unit: 'tháng',
        unit_price: 10000000,
        cost_price: 5000000,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: '3',
        name: 'Social Media Management',
        sku: 'SMM-001',
        category: 'Marketing',
        description: 'Monthly social media management',
        unit: 'tháng',
        unit_price: 15000000,
        cost_price: 8000000,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: '4',
        name: 'Logo Design',
        sku: 'DESIGN-LOGO-001',
        category: 'Design',
        description: 'Professional logo design',
        unit: 'thiết kế',
        unit_price: 8000000,
        cost_price: 3000000,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: '5',
        name: 'Brand Identity Package',
        sku: 'DESIGN-BRAND-001',
        category: 'Design',
        description: 'Complete brand identity design',
        unit: 'gói',
        unit_price: 35000000,
        cost_price: 15000000,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
]

export default function ProductsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sản phẩm & Dịch vụ</h1>
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
                data={mockProducts}
                searchKey="name"
                searchPlaceholder="Tìm theo tên sản phẩm..."
            />
        </div>
    )
}
