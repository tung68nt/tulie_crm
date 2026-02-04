'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Download,
    Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import { Invoice } from '@/types'
import { deleteInvoice } from '@/lib/supabase/services/invoice-service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface InvoiceCellActionProps {
    data: Invoice
}

export function InvoiceCellAction({ data }: InvoiceCellActionProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onDelete = async () => {
        try {
            setLoading(true)
            await deleteInvoice(data.id)
            router.refresh()
            toast.success('Xóa hóa đơn thành công')
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa hóa đơn')
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Hóa đơn <strong>{data.invoice_number}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            disabled={loading}
                        >
                            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                        <Link href={`/invoices/${data.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/invoices/${data.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Tải PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/finance/payments/new?invoice=${data.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Ghi nhận thanh toán
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive font-medium"
                        onClick={() => setOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
