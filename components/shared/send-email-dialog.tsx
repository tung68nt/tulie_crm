'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SendEmailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: 'quotation' | 'invoice' | 'contract' | 'notification'
    defaultTo?: string
    defaultSubject?: string
    data: Record<string, any>
}

export function SendEmailDialog({
    open,
    onOpenChange,
    type,
    defaultTo = '',
    defaultSubject = '',
    data,
}: SendEmailDialogProps) {
    const [to, setTo] = useState(defaultTo)
    const [customSubject, setCustomSubject] = useState('')
    const [extraMessage, setExtraMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const typeLabels: Record<string, string> = {
        quotation: 'Báo giá',
        invoice: 'Hoá đơn',
        contract: 'Hợp đồng',
        notification: 'Thông báo',
    }

    const handleSend = async () => {
        if (!to.trim()) {
            toast.error('Vui lòng nhập email người nhận')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const emails = to.split(',').map(e => e.trim())
        const invalidEmails = emails.filter(e => !emailRegex.test(e))
        if (invalidEmails.length > 0) {
            toast.error(`Email không hợp lệ: ${invalidEmails.join(', ')}`)
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    to: emails,
                    data: {
                        ...data,
                        customSubject: customSubject || undefined,
                        extraMessage: extraMessage || undefined,
                    },
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Gửi email thất bại')
            }

            setSent(true)
            toast.success('Email đã được gửi thành công!')

            // Auto close after 2 seconds
            setTimeout(() => {
                onOpenChange(false)
                setSent(false)
                setCustomSubject('')
                setExtraMessage('')
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi gửi email')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = (isOpen: boolean) => {
        if (!loading) {
            onOpenChange(isOpen)
            if (!isOpen) {
                setSent(false)
                setCustomSubject('')
                setExtraMessage('')
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Gửi email {typeLabels[type]}
                    </DialogTitle>
                    <DialogDescription>
                        Gửi thông tin {typeLabels[type].toLowerCase()} qua email cho khách hàng.
                    </DialogDescription>
                </DialogHeader>

                {sent ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="text-lg font-medium text-green-700">Gửi email thành công!</p>
                        <p className="text-sm text-muted-foreground">Email đã được gửi đến {to}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email-to">
                                    Email người nhận <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email-to"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nhiều email cách nhau bởi dấu phẩy
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email-subject">
                                    Tiêu đề (tuỳ chọn)
                                </Label>
                                <Input
                                    id="email-subject"
                                    placeholder={defaultSubject || `Mặc định: [Tulie] ${typeLabels[type]}...`}
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            {type === 'notification' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="email-message">
                                        Nội dung
                                    </Label>
                                    <Textarea
                                        id="email-message"
                                        placeholder="Nhập nội dung thông báo..."
                                        value={extraMessage}
                                        onChange={(e) => setExtraMessage(e.target.value)}
                                        disabled={loading}
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => handleClose(false)}
                                disabled={loading}
                            >
                                Huỷ
                            </Button>
                            <Button onClick={handleSend} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Gửi email
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
