'use client'

import { useState } from 'react'
import { Lead } from '@/lib/supabase/services/lead-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Contact, UserPlus, Phone, Mail, Building2, MessageSquare,
    MoreHorizontal, Trash2, Clock, CheckCircle2, XCircle, UserCheck, Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConfirm } from '@/components/ui/confirm-dialog'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    new: { label: 'Mới', color: 'bg-blue-50 text-blue-700', icon: UserPlus },
    contacted: { label: 'Đã liên hệ', color: 'bg-amber-50 text-amber-700', icon: Phone },
    qualified: { label: 'Tiềm năng', color: 'bg-emerald-50 text-emerald-700', icon: UserCheck },
    converted: { label: 'Đã chuyển đổi', color: 'bg-zinc-900 text-white', icon: CheckCircle2 },
    lost: { label: 'Mất', color: 'bg-red-50 text-red-700', icon: XCircle },
}

interface LeadsListProps {
    initialData: Lead[]
    stats: { total: number; new: number; contacted: number; qualified: number }
}

export function LeadsList({ initialData, stats }: LeadsListProps) {
    const router = useRouter()
    const { confirm } = useConfirm()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    const filtered = initialData.filter(lead => {
        const matchSearch = !search ||
            lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
            lead.phone.includes(search) ||
            lead.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.email?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || lead.status === statusFilter
        return matchSearch && matchStatus
    })

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch('/api/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, status: newStatus }),
            })
            if (!res.ok) {
                // Fallback: use server action directly
                const { updateLead } = await import('@/lib/supabase/services/lead-service')
                await updateLead(leadId, { status: newStatus as any })
            }
            toast.success('Đã cập nhật trạng thái')
            router.refresh()
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async (leadId: string) => {
        const confirmed = await confirm({
            title: 'Xóa lead',
            description: 'Bạn có chắc muốn xóa lead này?',
            variant: 'destructive',
            confirmText: 'Xóa',
        })
        if (!confirmed) return
        try {
            const { deleteLead } = await import('@/lib/supabase/services/lead-service')
            await deleteLead(leadId)
            toast.success('Đã xóa lead')
            router.refresh()
        } catch {
            toast.error('Có lỗi xảy ra')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                    { label: 'Tổng leads', value: stats.total, icon: Contact, color: 'text-zinc-600' },
                    { label: 'Mới', value: stats.new, icon: UserPlus, color: 'text-blue-600' },
                    { label: 'Đã liên hệ', value: stats.contacted, icon: Phone, color: 'text-amber-600' },
                    { label: 'Tiềm năng', value: stats.qualified, icon: UserCheck, color: 'text-emerald-600' },
                ].map((s, i) => (
                    <Card key={i} className="rounded-xl border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight">{s.label}</CardTitle>
                            <s.icon className={cn("h-4 w-4", s.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tên, SĐT, email, công ty..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Contact className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">Chưa có lead nào{statusFilter !== 'all' ? ' với trạng thái này' : ''}.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {/* Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-zinc-50/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-3">Khách hàng</div>
                            <div className="col-span-2">Liên hệ</div>
                            <div className="col-span-2">Công ty</div>
                            <div className="col-span-2">Trạng thái</div>
                            <div className="col-span-2">Ngày tạo</div>
                            <div className="col-span-1"></div>
                        </div>

                        {filtered.map((lead) => {
                            const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
                            return (
                                <div
                                    key={lead.id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-zinc-50/50 transition-colors cursor-pointer items-center"
                                    onClick={() => { setSelectedLead(lead); setIsDetailOpen(true) }}
                                >
                                    <div className="col-span-3">
                                        <p className="text-sm font-semibold text-zinc-950 tracking-tight">{lead.full_name}</p>
                                        {lead.business_type && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5">{lead.business_type}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 space-y-0.5">
                                        <p className="text-xs font-medium text-zinc-700">{lead.phone}</p>
                                        {lead.email && <p className="text-[11px] text-muted-foreground truncate">{lead.email}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-medium text-zinc-600 truncate">{lead.company_name || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge className={cn("text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg", statusCfg.color)}>
                                            {statusCfg.label}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[11px] text-muted-foreground">{formatDate(lead.created_at)}</p>
                                    </div>
                                    <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                    <DropdownMenuItem
                                                        key={key}
                                                        onClick={() => handleStatusChange(lead.id, key)}
                                                        disabled={lead.status === key}
                                                    >
                                                        <cfg.icon className="w-3.5 h-3.5 mr-2" />
                                                        {cfg.label}
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(lead.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-xl p-0 overflow-hidden border-none shadow-xl">
                    {selectedLead && (
                        <>
                            <div className="bg-zinc-950 text-white p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold tracking-tight">{selectedLead.full_name}</DialogTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={cn("text-[10px] font-semibold border-none px-2.5 py-1 rounded-lg", STATUS_CONFIG[selectedLead.status]?.color)}>
                                            {STATUS_CONFIG[selectedLead.status]?.label}
                                        </Badge>
                                        <span className="text-xs text-zinc-400">{formatDate(selectedLead.created_at)}</span>
                                    </div>
                                </DialogHeader>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Điện thoại</p>
                                        <p className="text-sm font-semibold text-zinc-950">{selectedLead.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-semibold text-zinc-950">{selectedLead.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Công ty</p>
                                        <p className="text-sm font-semibold text-zinc-950">{selectedLead.company_name || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lĩnh vực</p>
                                        <p className="text-sm font-semibold text-zinc-950">{selectedLead.business_type || '—'}</p>
                                    </div>
                                </div>

                                {selectedLead.message && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nhu cầu</p>
                                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{selectedLead.message}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cập nhật trạng thái</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <Button
                                                key={key}
                                                variant={selectedLead.status === key ? "default" : "outline"}
                                                size="sm"
                                                className="rounded-lg text-xs font-semibold gap-1.5 h-8"
                                                disabled={updating || selectedLead.status === key}
                                                onClick={() => {
                                                    handleStatusChange(selectedLead.id, key)
                                                    setSelectedLead({ ...selectedLead, status: key as any })
                                                }}
                                            >
                                                <cfg.icon className="w-3 h-3" />
                                                {cfg.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1 rounded-xl h-10 gap-2 font-semibold"
                                    >
                                        <a href={`tel:${selectedLead.phone}`}>
                                            <Phone className="w-4 h-4" />
                                            Gọi điện
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        className="flex-1 rounded-xl h-10 gap-2 font-semibold"
                                    >
                                        <a href={`https://zalo.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank">
                                            <MessageSquare className="w-4 h-4" />
                                            Chat Zalo
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
