'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createDocumentTemplate } from '@/lib/supabase/services/document-template-service'

export default function NewTemplatePage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [type, setType] = useState<'contract' | 'invoice' | 'payment_request' | 'quotation' | 'order'>('contract')
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (!name || !content) {
            toast.error('Vui lòng nhập tên và nội dung mẫu')
            return
        }

        setIsSaving(true)
        try {
            // Extract variables from content if needed, for now just basic extraction
            const variables = Array.from(content.matchAll(/{{(.*?)}}/g)).map(match => match[1])
            const uniqueVariables = Array.from(new Set(variables))

            await createDocumentTemplate({
                name,
                type,
                content,
                variables: uniqueVariables
            })

            toast.success('Tạo mẫu mới thành công')
            router.push('/templates')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating template:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi tạo mẫu')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Tạo mẫu mới</h1>
                        <p className="text-muted-foreground text-sm">Thiết kế nội dung và định dạng cho mẫu giấy tờ mới</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Lưu mẫu
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung mẫu (HTML)</CardTitle>
                            <CardDescription>
                                Sử dụng HTML và các biến dạng {'{{variable_name}}'} để tạo mẫu linh hoạt.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[600px] font-mono text-sm leading-relaxed"
                                placeholder="Nhập nội dung HTML của bạn tại đây... VD: <div>Chào {{customer_name}}</div>"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên mẫu</Label>
                                <Input
                                    id="name"
                                    placeholder="VD: Hợp đồng đại lý 2024"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Loại văn bản</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contract">Hợp đồng</SelectItem>
                                        <SelectItem value="quotation">Báo giá</SelectItem>
                                        <SelectItem value="invoice">Hóa đơn</SelectItem>
                                        <SelectItem value="payment_request">Đề nghị thanh toán</SelectItem>
                                        <SelectItem value="order">Đơn hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500" />
                                Hướng dẫn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <p>Sử dụng các biến nằm trong dấu ngoặc nhọn đôi để hệ thống tự động điền thông tin khi xuất văn bản.</p>
                            <div className="space-y-2">
                                <p className="font-medium">Các biến phổ biến:</p>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    <li><code>{'{{customer_company}}'}</code></li>
                                    <li><code>{'{{total_amount}}'}</code></li>
                                    <li><code>{'{{contract_date}}'}</code></li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
