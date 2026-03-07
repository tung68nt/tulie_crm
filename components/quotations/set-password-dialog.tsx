'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { setQuotationPassword } from '@/lib/supabase/services/portal-actions'

interface SetPasswordDialogProps {
    quotationId: string
    hasPassword?: boolean
    triggerType?: 'button' | 'menuitem'
}

export function SetPasswordDialog({ quotationId, hasPassword, triggerType = 'button' }: SetPasswordDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await setQuotationPassword(quotationId, password)
            if (result.success) {
                toast.success(password ? 'Đã cài đặt mật khẩu thành công' : 'Đã gỡ mật khẩu')
                setIsOpen(false)
                setPassword('')
            } else {
                toast.error(result.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            toast.error('Lỗi hệ thống')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerType === 'menuitem' ? (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsOpen(true)
                        }}
                        className="cursor-pointer"
                    >
                        <Lock className="h-4 w-4" />
                        {hasPassword ? 'Thay đổi mật khẩu' : 'Cài đặt mật khẩu'}
                    </DropdownMenuItem>
                ) : (
                    <Button variant={hasPassword ? "default" : "outline"} size="icon" title={hasPassword ? 'Đã có mật khẩu' : 'Thiết lập mật khẩu'}>
                        <Lock className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mật khẩu truy cập Portal</DialogTitle>
                    <DialogDescription>
                        Bảo vệ trang portal của khách hàng bằng mật khẩu. {hasPassword && "Để trống nếu muốn gỡ bỏ mật khẩu hiện tại."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={hasPassword ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu...'}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {password ? 'Lưu mật khẩu' : (hasPassword ? 'Gỡ mật khẩu' : 'Lưu')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
