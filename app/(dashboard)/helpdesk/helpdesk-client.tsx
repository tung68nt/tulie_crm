'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Headphones, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { SupportTicket, Customer, User } from '@/types'
import {
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    TICKET_PRIORITY_LABELS,
    TICKET_PRIORITY_COLORS,
    TICKET_CATEGORY_LABELS
} from '@/lib/constants/status'
import { createTicket } from '@/lib/supabase/services/ticket-service'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface HelpdeskClientProps {
    initialTickets: SupportTicket[]
    users: User[]
    customers: Customer[]
}

export function HelpdeskClient({ initialTickets, users, customers }: HelpdeskClientProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // New ticket form
    const [newTitle, setNewTitle] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [newCustomerId, setNewCustomerId] = useState('')
    const [newPriority, setNewPriority] = useState('medium')
    const [newCategory, setNewCategory] = useState('support')

    const filtered = initialTickets.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
            (t.customer as any)?.company_name?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || t.status === statusFilter
        return matchSearch && matchStatus
    })

    const stats = {
        open: initialTickets.filter(t => t.status === 'open').length,
        inProgress: initialTickets.filter(t => t.status === 'in_progress').length,
        resolved: initialTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
        urgent: initialTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    }

    const handleCreateTicket = async () => {
        if (!newTitle || !newCustomerId) {
            toast.error('Vui lòng nhập tiêu đề và chọn khách hàng')
            return
        }
        setIsLoading(true)
        try {
            await createTicket({
                title: newTitle,
                description: newDescription,
                customer_id: newCustomerId,
                priority: newPriority as any,
                category: newCategory as any,
            })
            toast.success('Tạo ticket thành công')
            setIsCreateOpen(false)
            setNewTitle('')
            setNewDescription('')
            setNewCustomerId('')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi tạo ticket')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Helpdesk</h1>
                    <p className="text-muted-foreground">Quản lý yêu cầu hỗ trợ từ khách hàng</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo ticket mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tiêu đề <span className="text-destructive">*</span></Label>
                                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Mô tả ngắn vấn đề..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Khách hàng <span className="text-destructive">*</span></Label>
                                <Select value={newCustomerId} onValueChange={setNewCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khách hàng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mức độ</Label>
                                    <Select value={newPriority} onValueChange={setNewPriority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Thấp</SelectItem>
                                            <SelectItem value="medium">Bình thường</SelectItem>
                                            <SelectItem value="high">Cao</SelectItem>
                                            <SelectItem value="urgent">Khẩn cấp</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Loại</Label>
                                    <Select value={newCategory} onValueChange={setNewCategory}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="support">Hỗ trợ</SelectItem>
                                            <SelectItem value="bug">Lỗi</SelectItem>
                                            <SelectItem value="feature">Yêu cầu mới</SelectItem>
                                            <SelectItem value="warranty">Bảo hành</SelectItem>
                                            <SelectItem value="other">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mô tả chi tiết</Label>
                                <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Mô tả chi tiết vấn đề..." rows={4} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreateTicket} disabled={isLoading}>
                                {isLoading ? 'Đang tạo...' : 'Tạo ticket'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.open}</p>
                            <p className="text-xs text-muted-foreground">Mới</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.inProgress}</p>
                            <p className="text-xs text-muted-foreground">Đang xử lý</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.resolved}</p>
                            <p className="text-xs text-muted-foreground">Đã giải quyết</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.urgent}</p>
                            <p className="text-xs text-muted-foreground">Quan trọng</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm ticket..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="open">Mới</SelectItem>
                        <SelectItem value="in_progress">Đang xử lý</SelectItem>
                        <SelectItem value="waiting">Chờ phản hồi</SelectItem>
                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                        <SelectItem value="closed">Đóng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Ticket List */}
            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <Headphones className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Chưa có ticket nào</p>
                            <p className="text-sm">Tạo ticket mới để bắt đầu</p>
                        </CardContent>
                    </Card>
                ) : (
                    filtered.map(ticket => (
                        <Link key={ticket.id} href={`/helpdesk/${ticket.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted-foreground font-mono">{ticket.ticket_number}</span>
                                            <Badge className={TICKET_STATUS_COLORS[ticket.status] || ''}>
                                                {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
                                            </Badge>
                                            <Badge variant="outline" className={TICKET_PRIORITY_COLORS[ticket.priority] || ''}>
                                                {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {TICKET_CATEGORY_LABELS[ticket.category] || ticket.category}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-sm truncate">{ticket.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {(ticket.customer as any)?.company_name}
                                            {ticket.project && <> · {(ticket.project as any)?.title}</>}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: vi })}
                                        </p>
                                        {ticket.assigned_user && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                → {(ticket.assigned_user as any)?.full_name}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
