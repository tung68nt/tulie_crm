'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, Clock, User, MessageSquare, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

interface ProjectActivityHistoryProps {
    projectId: string
    activities?: any[]
}

export function ProjectActivityHistory({ projectId, activities: initialActivities }: ProjectActivityHistoryProps) {
    const [activities, setActivities] = useState<any[]>(initialActivities || [])
    const [isLoading, setIsLoading] = useState(!initialActivities)

    useEffect(() => {
        if (initialActivities) return
        const fetchActivities = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('activity_log')
                .select('*, user:users(*)')
                .eq('entity_id', projectId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) setActivities(data)
            setIsLoading(false)
        }

        fetchActivities()
    }, [projectId])

    const getIcon = (action: string) => {
        if (action.includes('create')) return <Plus className="w-3.5 h-3.5 text-blue-500" />
        if (action.includes('update')) return <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
        if (action.includes('delete')) return <Trash2 className="w-3.5 h-3.5 text-red-500" />
        if (action.includes('status')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        return <Activity className="w-3.5 h-3.5 text-zinc-400" />
    }

    if (isLoading) return null

    return (
        <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="py-6 px-6 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-zinc-900" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Lịch sử hoạt động</CardTitle>
                        <CardDescription className="text-xs font-normal">Các thay đổi và cập nhật gần đây trong dự án.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                    <div className="p-6 space-y-6">
                        {activities.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-zinc-400">Chưa có hoạt động nào được ghi nhận.</p>
                            </div>
                        ) : (
                            activities.map((activity, idx) => (
                                <div key={activity.id} className="relative flex gap-4">
                                    {/* Timeline line */}
                                    {idx !== activities.length - 1 && (
                                        <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-zinc-100" />
                                    )}

                                    <div className="relative z-10 w-8 h-8 shrink-0 rounded-full bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[13px] font-semibold text-zinc-900 leading-tight">
                                                {activity.user?.full_name || 'Hệ thống'}
                                                <span className="font-normal text-zinc-500 ml-1">{activity.description}</span>
                                            </p>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                        {activity.metadata && (
                                            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100/50">
                                                <p className="text-[11px] text-zinc-500 line-clamp-2">{JSON.stringify(activity.metadata)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

import { Plus, RefreshCw, Trash2 } from 'lucide-react'
