'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Send, User as UserIcon, Headphones } from 'lucide-react'
import { SupportTicket, User } from '@/types'
import {
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    TICKET_PRIORITY_LABELS,
    TICKET_PRIORITY_COLORS,
    TICKET_CATEGORY_LABELS
} from '@/lib/constants/status'
import { updateTicket, addTicketMessage } from '@/lib/supabase/services/ticket-service'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface TicketDetailClientProps {
    ticket: SupportTicket
    users: User[]
}

export function TicketDetailClient({ ticket, users }: TicketDetailClientProps) {
    const router = useRouter()
    const [messageContent, setMessageContent] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [status, setStatus] = useState(ticket.status)
    const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '')

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTicket(ticket.id, { status: newStatus as any })
            setStatus(newStatus as any)
            toast.success('Cập nhật trạng thái')
            router.refresh()
        } catch {
            toast.error('Lỗi cập nhật')
        }
    }

    const handleAssign = async (userId: string) => {
        try {
            await updateTicket(ticket.id, { assigned_to: userId || null } as any)
            setAssignedTo(userId)
            toast.success('Đã gán người phụ trách')
            router.refresh()
        } catch {
            toast.error('Lỗi cập nhật')
        }
    }

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return
        setIsSending(true)
        try {
            const currentUser = users.find(u => u.id === ticket.assigned_to) || users[0]
            await addTicketMessage(ticket.id, {
                sender_type: 'staff',
                sender_name: currentUser?.full_name || 'Staff',
                content: messageContent,
            })
            setMessageContent('')
            toast.success('Đã gửi phản hồi')
            router.refresh()
        } catch {
            toast.error('Lỗi gửi tin nhắn')
        } finally {
            setIsSending(false)
        }
    }

    const messages = ticket.messages || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/helpdesk">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-mono">{ticket.ticket_number}</span>
                            <Badge className={TICKET_STATUS_COLORS[status] || ''}>
                                {TICKET_STATUS_LABELS[status] || status}
                            </Badge>
                            <Badge variant="outline" className={TICKET_PRIORITY_COLORS[ticket.priority] || ''}>
                                {TICKET_PRIORITY_LABELS[ticket.priority]}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold mt-1">{ticket.title}</h1>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main: Messages */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Description */}
                    {ticket.description && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground mb-1 font-medium">Mô tả</p>
                                <p className="text-sm whitespace-pre-line">{ticket.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages Thread */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Trao đổi ({messages.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Chưa có tin nhắn nào</p>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'staff' ? '' : 'flex-row-reverse'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender_type === 'staff' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600'}`}>
                                            {msg.sender_type === 'staff' ? <Headphones className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                        </div>
                                        <div className={`flex-1 max-w-[80%] ${msg.sender_type === 'staff' ? '' : 'text-right'}`}>
                                            <div className={`rounded-lg p-3 text-sm ${msg.sender_type === 'staff' ? 'bg-zinc-50 dark:bg-zinc-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                                <p className="whitespace-pre-line">{msg.content}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {msg.sender_name} · {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}

                            <Separator />

                            {/* Reply Box */}
                            <div className="flex gap-2">
                                <Textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Nhập phản hồi..."
                                    rows={2}
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            handleSendMessage()
                                        }
                                    }}
                                />
                                <Button size="icon" onClick={handleSendMessage} disabled={isSending || !messageContent.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">Trạng thái</p>
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Mới</SelectItem>
                                        <SelectItem value="in_progress">Đang xử lý</SelectItem>
                                        <SelectItem value="waiting">Chờ phản hồi</SelectItem>
                                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                        <SelectItem value="closed">Đóng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">Phụ trách</p>
                                <Select value={assignedTo} onValueChange={handleAssign}>
                                    <SelectTrigger><SelectValue placeholder="Chọn người phụ trách..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Chưa gán</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Khách hàng</span>
                                    <Link href={`/customers/${ticket.customer_id}`} className="font-medium hover:underline">
                                        {(ticket.customer as any)?.company_name}
                                    </Link>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Loại</span>
                                    <span className="font-medium">{TICKET_CATEGORY_LABELS[ticket.category]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tạo lúc</span>
                                    <span className="font-medium">{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}</span>
                                </div>
                                {ticket.project && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dự án</span>
                                        <Link href={`/projects/${ticket.project_id}`} className="font-medium hover:underline truncate max-w-[150px]">
                                            {(ticket.project as any)?.title}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
