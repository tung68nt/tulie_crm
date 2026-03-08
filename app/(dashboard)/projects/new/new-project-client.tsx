'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProject } from '@/lib/supabase/services/project-service'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, Rocket } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectClient({ customers }: { customers: any[] }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !customerId) {
            toast.error('Vui lòng nhập tên dự án và khách hàng')
            return
        }

        setIsLoading(true)
        try {
            const newProject = await createProject({
                title,
                customer_id: customerId,
                description,
                status: 'todo',
                brand: 'agency' // Defaulting to agency
            })
            toast.success('Tạo dự án thành công')
            router.push(`/projects/${newProject.id}`)
            router.refresh()
        } catch (error) {
            console.error('Error creating project:', error)
            toast.error('Có lỗi xảy ra khi tạo dự án')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/projects">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Tạo dự án mới</h1>
                        <p className="text-sm text-muted-foreground">Khởi tạo dự án & theo dõi tiến độ triển khai.</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin dự án</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tên dự án</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="VD: Triển khai Website & Marketing T3/2024"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Khách hàng</Label>
                            <Select value={customerId} onValueChange={setCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khách hàng..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Mô tả dự án</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href="/projects">Hủy</Link>
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Tạo dự án
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
