'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export const productColumns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    Tên sản phẩm
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original
            return (
                <div>
                    <Link
                        href={`/products/${product.id}`}
                        className="font-medium hover:underline"
                    >
                        {product.name}
                    </Link>
                    {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'category',
        header: 'Danh mục',
        cell: ({ row }) => {
            const category = row.getValue('category') as string | undefined
            return category ? (
                <Badge variant="secondary">{category}</Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Giá bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const price = row.getValue('price') as number
            const unit = row.original.unit
            return (
                <div>
                    <span className="font-medium">{formatCurrency(price)}</span>
                    <span className="text-muted-foreground text-sm">/{unit}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'cost_price',
        header: 'Giá vốn',
        cell: ({ row }) => {
            const cost = row.getValue('cost_price') as number | undefined
            if (!cost) return <span className="text-muted-foreground">-</span>

            const price = row.original.price
            const margin = ((price - cost) / price) * 100

            return (
                <div>
                    <span>{formatCurrency(cost)}</span>
                    <p className="text-xs text-muted-foreground">
                        Margin: {margin.toFixed(1)}%
                    </p>
                </div>
            )
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean
            return (
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Đang bán' : 'Ngừng bán'}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const product = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
