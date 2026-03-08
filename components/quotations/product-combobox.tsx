'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface Product {
    id: string
    name: string
    sku?: string
    unit?: string
    price?: number
}

interface ProductComboboxProps {
    products: Product[]
    value: string
    onSelect: (productId: string) => void
    placeholder?: string
}

export function ProductCombobox({ products, value, onSelect, placeholder = "Chọn sản phẩm..." }: ProductComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedProduct = products.find(p => p.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 font-normal text-sm"
                >
                    <span className="truncate">
                        {selectedProduct ? selectedProduct.name : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm sản phẩm..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>
                            <div className="flex flex-col items-center py-4 text-muted-foreground">
                                <Package className="h-8 w-8 mb-2 opacity-50" />
                                <span className="text-sm">Không tìm thấy sản phẩm</span>
                            </div>
                        </CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={`${product.name} ${product.sku || ''}`}
                                    onSelect={() => {
                                        onSelect(product.id)
                                        setOpen(false)
                                    }}
                                    className="flex items-center gap-2 py-2"
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4 shrink-0",
                                            value === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        {(product.sku || product.unit) && (
                                            <p className="text-[10px] text-muted-foreground">
                                                {product.sku && <span>Mã: {product.sku}</span>}
                                                {product.sku && product.unit && <span> · </span>}
                                                {product.unit && <span>ĐVT: {product.unit}</span>}
                                            </p>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
