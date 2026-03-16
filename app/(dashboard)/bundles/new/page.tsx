'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    FileStack,
    Link as LinkIcon,
    Copy,
    ExternalLink,
    CheckCircle,
    Briefcase,
    FileText
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { toast } from 'sonner'

// Types
interface Customer {
    id: string
    company_name: string
}

interface Contract {
    id: string
    contract_number: string
    customer_id: string
}

interface Template {
    id: string
    name: string
    type: string
}

export default function NewBundlePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [customers, setCustomers] = useState<Customer[]>([])
    const [contracts, setContracts] = useState<Contract[]>([])
    const [templates, setTemplates] = useState<Template[]>([])

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [selectedContractId, setSelectedContractId] = useState<string>('')
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
    const [bundleName, setBundleName] = useState('')

    const [shareUrl, setShareUrl] = useState<string | null>(null)

    useEffect(() => {
        // Mock data fetching
        const fetchData = async () => {
            // Simplified for demo
            setCustomers([
                { id: '1', company_name: 'Công ty ABC' },
                { id: '2', company_name: 'Công ty XYZ' }
            ])
            setContracts([
                { id: 'c1', contract_number: 'HD-2026-0001', customer_id: '1' },
                { id: 'c2', contract_number: 'HD-2026-0002', customer_id: '2' }
            ])
            setTemplates([
                { id: 'default-0', name: 'Hợp đồng dịch vụ', type: 'contract' },
                { id: 'default-1', name: 'Đề nghị thanh toán', type: 'payment_request' },
                { id: 't3', name: 'Báo giá chi tiết', type: 'quotation' }
            ])
            setIsLoading(false)
        }
        fetchData()
    }, [])

    const filteredContracts = contracts.filter(c => c.customer_id === selectedCustomerId)

    const toggleTemplate = (id: string) => {
        setSelectedTemplateIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        )
    }

    const handleCreateBundle = async () => {
        if (!selectedCustomerId || selectedTemplateIds.length === 0) {
            toast.error('Vui lòng chọn khách hàng và ít nhất một mẫu')
            return
        }

        setIsSaving(true)
        // Simulate API call
        setTimeout(() => {
            const token = Math.random().toString(36).substring(7)
            setShareUrl(`${window.location.origin}/portal/${token}`)
            setIsSaving(false)
            toast.success('Đã tạo bộ tài liệu và link chia sẻ!')
        }, 1500)
    }

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            toast.success('Đã sao chép link!')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/templates">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold flex items-center gap-2">
                        <FileStack className="h-8 w-8" />
                        Đóng gói bộ tài liệu
                    </h1>
                    <p className="text-muted-foreground">
                        Tạo bộ hồ sơ nhiều giấy tờ cho khách hàng và chia sẻ qua portal
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    {/* Customer & Contract Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin khách hàng & Dự án</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Chọn khách hàng</Label>
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
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

                            <div className="space-y-2">
                                <Label>Chọn hợp đồng / Dự án (Tùy chọn)</Label>
                                <Select
                                    value={selectedContractId}
                                    onValueChange={setSelectedContractId}
                                    disabled={!selectedCustomerId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn hợp đồng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredContracts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tên bộ hồ sơ</Label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="VD: Hồ sơ triển khai CRM"
                                    value={bundleName}
                                    onChange={(e) => setBundleName(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn mẫu giấy tờ</CardTitle>
                            <CardDescription>Chọn các mẫu để đưa vào bộ hồ sơ này</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                {templates.map(t => (
                                    <div
                                        key={t.id}
                                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplateIds.includes(t.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => toggleTemplate(t.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={selectedTemplateIds.includes(t.id)}
                                                onCheckedChange={() => toggleTemplate(t.id)}
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{t.name}</p>
                                                <Badge variant="secondary" className="text-[11px] h-4">
                                                    {t.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Summary & Actions */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Tổng quan bộ hồ sơ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Khách hàng:</span>
                                    <span className="text-sm">
                                        {customers.find(c => c.id === selectedCustomerId)?.company_name || 'Chưa chọn'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Hợp đồng:</span>
                                    <span className="text-sm">
                                        {contracts.find(c => c.id === selectedContractId)?.contract_number || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2">Tài liệu bao gồm ({selectedTemplateIds.length}):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplateIds.length === 0 && (
                                            <span className="text-sm text-muted-foreground italic">Chưa chọn tài liệu nào</span>
                                        )}
                                        {selectedTemplateIds.map(id => (
                                            <Badge key={id} variant="outline">
                                                {templates.find(t => t.id === id)?.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {!shareUrl ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCreateBundle}
                                    disabled={isSaving || !selectedCustomerId || selectedTemplateIds.length === 0}
                                >
                                    {isSaving && <LoadingSpinner size="sm" className="mr-2" />}
                                    <LinkIcon className="mr-2 h-4 w-4" />
                                    Tạo bộ hồ sơ & Lấy link chia sẻ
                                </Button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-4 bg-emerald-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <p className="text-sm font-medium text-emerald-800 dark:text-green-300">
                                            Bộ hồ sơ đã sẵn sàng chia sẻ!
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Link chia sẻ cho khách hàng</Label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={shareUrl} className="font-mono text-xs" />
                                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button className="flex-1" variant="outline" asChild>
                                            <Link href={shareUrl} target="_blank">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Trải nghiệm Portal
                                            </Link>
                                        </Button>
                                        <Button className="flex-1" onClick={() => setShareUrl(null)}>
                                            Tạo bộ hồ sơ mới
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
