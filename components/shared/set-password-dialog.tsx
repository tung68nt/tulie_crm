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
import { Lock, Loader2, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { setEntityPassword, getEntityPasswordPlain } from '@/lib/supabase/services/portal-actions'

interface SetPasswordDialogProps {
    entityId: string
    tableName: 'quotations' | 'projects' | 'contracts'
    hasPassword?: boolean
    triggerType?: 'button' | 'menuitem' | 'icon'
    title?: string
    description?: string
}

export function SetPasswordDialog({
    entityId,
    tableName,
    hasPassword,
    triggerType = 'button',
    title = 'Mật khẩu bảo mật',
    description = 'Thiết lập mật khẩu truy cập cho tài liệu này.'
}: SetPasswordDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState<string | null>(null)
    const [loadingCurrent, setLoadingCurrent] = useState(false)
    const [copied, setCopied] = useState(false)

    // Load current plaintext password when dialog opens
    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open)
        if (open && hasPassword) {
            setLoadingCurrent(true)
            try {
                const result = await getEntityPasswordPlain(tableName, entityId)
                if (result.password) {
                    setCurrentPassword(result.password)
                }
            } catch {
                // ignore — plaintext may not be stored
            } finally {
                setLoadingCurrent(false)
            }
        } else if (!open) {
            setCurrentPassword(null)
            setPassword('')
            setCopied(false)
        }
    }

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(result)
        setShowPassword(true)
    }

    const handleCopy = () => {
        const textToCopy = password || currentPassword
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            toast.success('Đã copy mật khẩu')
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await setEntityPassword(tableName, entityId, password)
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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                ) : triggerType === 'icon' ? (
                    <Button variant={hasPassword ? "default" : "outline"} size="icon" className="h-8 w-8" title={hasPassword ? 'Đã có mật khẩu' : 'Thiết lập mật khẩu'}>
                        <Lock className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant={hasPassword ? "default" : "outline"} className="gap-2">
                        <Lock className="h-4 w-4" />
                        {hasPassword ? 'Thay đổi mật khẩu' : 'Cài đặt mật khẩu'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description} {hasPassword && "Để trống nếu muốn gỡ bỏ mật khẩu hiện tại."}
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
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={generatePassword}>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Tạo ngẫu nhiên
                            </Button>
                            {(password || currentPassword) && (
                                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={handleCopy}>
                                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                    {copied ? 'Đã copy' : 'Copy'}
                                </Button>
                            )}
                        </div>
                    </div>
                    {hasPassword && (
                        <div className="space-y-1.5 p-3 bg-muted/50 rounded-lg border">
                            <Label className="text-xs text-muted-foreground">Mật khẩu hiện tại</Label>
                            {loadingCurrent ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Đang tải...
                                </div>
                            ) : currentPassword ? (
                                <p className="text-sm font-mono font-medium bg-background px-2 py-1 rounded border select-all">{currentPassword}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">Không thể xem (mật khẩu đã mã hoá)</p>
                            )}
                        </div>
                    )}
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
