"use client"

import { Button } from '@/components/ui/button'
import { Layout, RefreshCcw, Key, Database, Globe, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getSystemSetting, updateSystemSetting } from '@/lib/supabase/services/settings-service'

export default function LabPage() {
    const [apiKey, setApiKey] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        const key = await getSystemSetting('tulie_lab_api_key')
        if (key) setApiKey(key)
    }

    const handleSaveKey = async () => {
        setIsSaving(true)
        try {
            await updateSystemSetting('tulie_lab_api_key', apiKey)
            toast.success('Đã lưu API Key cho Tulie Lab')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSync = async () => {
        if (!apiKey) {
            toast.error('Vui lòng nhập API Key trước khi đồng bộ')
            return
        }
        setIsSyncing(true)
        try {
            // Mock sync trigger
            await new Promise(resolve => setTimeout(resolve, 2000))
            toast.success('Đồng bộ dữ liệu từ thelab.tulie.vn thành công')
        } catch (error) {
            toast.error('Lỗi khi đồng bộ dữ liệu')
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Layout className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Tulie Lab Control</h1>
                        <p className="text-muted-foreground font-normal">Đồng bộ dữ liệu tập trung từ thelab.tulie.vn.</p>
                    </div>
                </div>
                <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                    {isSyncing ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Đồng bộ ngay
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Key className="h-4 w-4 text-zinc-500" />
                            Cấu hình kết nôi
                        </CardTitle>
                        <CardDescription>Nhập API Key để kết nối với hệ thống Lab ngoại vi.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api_key">API Key (thelab.tulie.vn)</Label>
                            <Input
                                id="api_key"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="********************************"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleSaveKey} disabled={isSaving}>
                                {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Database className="h-4 w-4 text-zinc-500" />
                            Trạng thái Lab
                        </CardTitle>
                        <CardDescription>Kiểm tra tình trạng kết nối tới máy chủ trung tâm.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-zinc-500" />
                                    <span className="text-sm font-medium">thelab.tulie.vn</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Trực tuyến</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground uppercase font-bold tracking-tighter opacity-50">Lần đồng bộ cuối</span>
                                    <span className="font-mono">Chưa bao giờ</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground uppercase font-bold tracking-tighter opacity-50">Dung lượng dữ liệu</span>
                                    <span className="font-mono">-- MB</span>
                                </div>
                                <div className="pt-4">
                                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                        <TrendingUp className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Hiệu suất đồng bộ: 100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Users({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
