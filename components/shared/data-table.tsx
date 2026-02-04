'use client'

import * as React from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface DataTableFilterOption {
    label: string
    value: string
}

export interface DataTableFilter {
    columnId: string
    title: string
    options: DataTableFilterOption[]
}

export interface DataTableBulkAction<TData> {
    label: string
    icon?: React.ReactNode
    onAction: (rows: TData[]) => Promise<void>
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    filters?: DataTableFilter[]
    onDelete?: (rows: TData[]) => Promise<void>
    bulkActions?: DataTableBulkAction<TData>[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Tìm kiếm...',
    filters,
    onDelete,
    bulkActions = [],
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [open, setOpen] = React.useState(false)

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const hasSelection = selectedRows.length > 0

    const onBulkDelete = async () => {
        if (!onDelete) return
        try {
            setLoading(true)
            await onDelete(selectedRows.map((row) => row.original))
            table.resetRowSelection()
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const handleBulkAction = async (action: DataTableBulkAction<TData>) => {
        try {
            setLoading(true)
            await action.onAction(selectedRows.map((row) => row.original))
            table.resetRowSelection()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa {selectedRows.length} mục?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Các mục đã chọn sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={onBulkDelete} disabled={loading}>
                            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    {searchKey && (
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="pl-9 w-[250px] lg:w-[350px] bg-muted/30 border-transparent focus-visible:bg-background focus-visible:border-border transition-all"
                            />
                        </div>
                    )}

                    {filters?.map((filter) => {
                        const column = table.getColumn(filter.columnId)
                        if (!column) return null

                        const filterValue = column.getFilterValue() as string[] || []

                        return (
                            <div key={filter.columnId} className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 border-dashed bg-background hover:bg-muted/50 transition-colors">
                                            <Plus className="mr-2 h-3.5 w-3.5" />
                                            <span className="text-xs font-semibold">{filter.title}</span>
                                            {filterValue.length > 0 && (
                                                <>
                                                    <Separator orientation="vertical" className="mx-2 h-4" />
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-sm px-1 font-normal lg:hidden"
                                                    >
                                                        {filterValue.length}
                                                    </Badge>
                                                    <div className="hidden space-x-1 lg:flex">
                                                        {filterValue.length > 2 ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="rounded-sm px-1 font-normal"
                                                            >
                                                                {filterValue.length} đã chọn
                                                            </Badge>
                                                        ) : (
                                                            filter.options
                                                                .filter((option) => filterValue.includes(option.value))
                                                                .map((option) => (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        key={option.value}
                                                                        className="rounded-sm px-1 font-normal"
                                                                    >
                                                                        {option.label}
                                                                    </Badge>
                                                                ))
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[200px]">
                                        <DropdownMenuLabel>{filter.title}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {filter.options.map((option) => {
                                            const isSelected = filterValue.includes(option.value)
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={option.value}
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => {
                                                        const newValue = checked
                                                            ? [...filterValue, option.value]
                                                            : filterValue.filter((v) => v !== option.value)
                                                        column.setFilterValue(newValue.length ? newValue : undefined)
                                                    }}
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                        {filterValue.length > 0 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => column.setFilterValue(undefined)}
                                                    className="justify-center text-center font-medium"
                                                >
                                                    Xóa bộ lọc
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {hasSelection && (
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setOpen(true)}
                                    className="h-10"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa ({selectedRows.length})
                                </Button>
                            )}

                            {bulkActions.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-10">
                                            Thao tác hàng loạt
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Hàng loạt ({selectedRows.length})</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {bulkActions.map((action, idx) => (
                                            <DropdownMenuItem
                                                key={idx}
                                                onSelect={() => handleBulkAction(action)}
                                                disabled={loading}
                                                className={cn(
                                                    action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                                                )}
                                            >
                                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                                {action.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 font-medium">
                                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                                Hiển thị
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Cột hiển thị</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="first:pl-6 last:pr-6 whitespace-nowrap h-11 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="group hover:bg-muted/30 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="first:pl-6 last:pr-6 py-3.5 text-sm font-medium">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Không có dữ liệu.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} /{' '}
                    {table.getFilteredRowModel().rows.length} hàng được chọn
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-2">
                        Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-md bg-background hover:bg-muted/50 transition-colors"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-md bg-background hover:bg-muted/50 transition-colors"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-md bg-background hover:bg-muted/50 transition-colors"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-md bg-background hover:bg-muted/50 transition-colors"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
