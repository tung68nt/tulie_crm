'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getTemplateById, updateDocumentTemplate, DocumentTemplate } from '@/lib/supabase/services/document-template-service'

export default function EditTemplatePage() {
 const params = useParams()
 const router = useRouter()
 const templateId = params.id as string

 const [template, setTemplate] = useState<DocumentTemplate | null>(null)
 const [name, setName] = useState('')
 const [content, setContent] = useState('')
 const [isLoading, setIsLoading] = useState(true)
 const [isSaving, setIsSaving] = useState(false)

 useEffect(() => {
 const fetchTemplate = async () => {
 const data = await getTemplateById(templateId)
 if (data) {
 setTemplate(data)
 setName(data.name)
 setContent(data.content)
 }
 setIsLoading(false)
 }
 fetchTemplate()
 }, [templateId])

 const handleSave = async () => {
 if (!name || !content) {
 toast.error('Vui lòng nhập tên và nội dung mẫu')
 return
 }

 setIsSaving(true)
 try {
 const variables = Array.from(content.matchAll(/{{(.*?)}}/g)).map(match => match[1])
 const uniqueVariables = Array.from(new Set(variables))

 await updateDocumentTemplate(templateId, {
 name,
 content,
 variables: uniqueVariables
 })

 toast.success('Đã lưu thay đổi mẫu')
 router.push('/templates')
 router.refresh()
 } catch (error: any) {
 console.error('Error updating template:', error)
 toast.error(error.message || 'Có lỗi xảy ra khi cập nhật mẫu')
 } finally {
 setIsSaving(false)
 }
 }

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 )
 }

 if (!template) {
 return (
 <div className="p-8 text-center">
 <h2 className="text-xl font-semibold">Không tìm thấy mẫu</h2>
 <Button asChild className="mt-4">
 <Link href="/templates">Quay lại danh sách</Link>
 </Button>
 </div>
 )
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
 <h1 className="text-2xl font-semibold">Chỉnh sửa mẫu: {template.name}</h1>
 <p className="text-muted-foreground text-sm">Cập nhật nội dung và định dạng cho mẫu giấy tờ</p>
 </div>
 </div>
 <Button onClick={handleSave} disabled={isSaving}>
 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
 Lưu thay đổi
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
 placeholder="Nhập nội dung HTML của bạn tại đây..."
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
 value={name}
 onChange={(e) => setName(e.target.value)}
 />
 </div>
 <div className="space-y-2">
 <Label>Loại văn bản</Label>
 <Badge variant="secondary" className="block w-fit text-sm py-1">
 {template.type === 'contract' ? 'Hợp đồng' :
 template.type === 'invoice' ? 'Hóa đơn' :
 template.type === 'payment_request' ? 'Đề nghị thanh toán' : 'Báo giá'}
 </Badge>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Info className="h-5 w-5 text-blue-500" />
 Các biến khả dụng
 </CardTitle>
 <CardDescription>
 Copy các biến này dán vào nội dung bên trái
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-2">
 {template.variables.map(v => (
 <Badge
 key={v}
 variant="outline"
 className="cursor-pointer hover:bg-muted font-mono"
 onClick={() => {
 navigator.clipboard.writeText(`{{${v}}}`)
 toast.success(`Đã copy: {{${v}}}`)
 }}
 >
 {`{{${v}}}`}
 </Badge>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-4">
 * Bấm vào biến để copy nhanh.
 </p>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 )
}
