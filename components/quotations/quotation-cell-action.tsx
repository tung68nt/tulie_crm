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
    Copy,
    Send,
    ExternalLink,
    FileSignature
} from 'lucide-react'
import { toast } from 'sonner'
import { Quotation } from '@/types'
import { deleteQuotation } from '@/lib/supabase/services/quotation-service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface QuotationCellActionProps {
    data: Quotation
}

export function QuotationCellAction({ data }: QuotationCellActionProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const publicUrl = `/quote/${data.public_token}`

    const onDelete = async () => {
        try {
            setLoading(true)
            await deleteQuotation(data.id)
            router.refresh()
            toast.success('Xóa báo giá thành công')
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa báo giá')
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const copyLink = () => {
        const url = `${window.location.origin}${publicUrl}`
        navigator.clipboard.writeText(url)
        toast.success('Đã sao chép liên kết')
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Báo giá <strong>{data.quote_number}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
                        <Link href={`/quotations/${data.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/quotations/${data.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={publicUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Xem trang công khai
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        Gửi email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {data.status === 'accepted' && (
                        <DropdownMenuItem asChild>
                            <Link href={`/contracts/new?from_quote=${data.id}`}>
                                <FileSignature className="mr-2 h-4 w-4" />
                                Tạo hợp đồng
                            </Link>
                        </DropdownMenuItem>
                    )}
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
