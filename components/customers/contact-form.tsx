'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Contact } from '@/types'
import { createContact, updateContact } from '@/lib/supabase/services/contact-service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ContactFormProps {
    customerId: string
    contact?: Contact
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ContactForm({ customerId, contact, open, onOpenChange, onSuccess }: ContactFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        email: '',
        phone: '',
        is_primary: false,
        birthday: '',
    })

    useEffect(() => {
        if (open) {
            setFormData({
                name: contact?.name || '',
                position: contact?.position || '',
                email: contact?.email || '',
                phone: contact?.phone || '',
                is_primary: contact?.is_primary || false,
                birthday: contact?.birthday || '',
            })
        }
    }, [open, contact])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name) {
            toast.error('Vui lòng nhập họ và tên')
            return
        }

        setIsLoading(true)
        try {
            if (contact) {
                await updateContact(contact.id, formData)
                toast.success('Cập nhật liên hệ thành công')
            } else {
                await createContact({
                    ...formData,
                    customer_id: customerId,
                })
                toast.success('Thêm liên hệ thành công')
            }
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error('Failed to save contact:', error)
            toast.error(`Lỗi lưu liên hệ: ${(error as any)?.message || 'Thử lại sau'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{contact ? 'Chỉnh sửa liên hệ' : 'Thêm liên hệ mới'}</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin người liên hệ của khách hàng.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Nguyễn Văn A"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="position">Chức vụ</Label>
                        <Input
                            id="position"
                            name="position"
                            placeholder="Giám đốc kinh doanh"
                            value={formData.position}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="090..."
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birthday">Ngày sinh</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.birthday && "text-muted-foreground"
                                    )}
                                >
                                    {formData.birthday ? format(new Date(formData.birthday), "dd/MM/yyyy") : <span>Chọn ngày sinh</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    locale={vi}
                                    selected={formData.birthday ? new Date(formData.birthday) : undefined}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, birthday: date ? format(date, "yyyy-MM-dd") : "" }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <Checkbox
                            id="is_primary"
                            checked={formData.is_primary}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: !!checked }))}
                        />
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="is_primary">
                                Liên hệ chính
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Đây là người liên hệ làm việc chính của khách hàng.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {contact ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
