'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Send, Mail } from 'lucide-react'
import { SendEmailDialog } from '@/components/shared/send-email-dialog'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface QuotationEmailButtonProps {
    quotation: any
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    showText?: boolean
    triggerType?: 'button' | 'menuitem'
}

export function QuotationEmailButton({
    quotation,
    variant = 'outline',
    size = 'default',
    showText = true,
    triggerType = 'button',
}: QuotationEmailButtonProps) {
    const [emailOpen, setEmailOpen] = useState(false)
    const publicUrl = `/quote/${quotation.public_token}`

    return (
        <>
            {triggerType === 'menuitem' ? (
                <DropdownMenuItem
                    onClick={() => setEmailOpen(true)}
                    className="cursor-pointer"
                >
                    <Mail className="h-4 w-4" />
                    Gửi Email báo giá
                </DropdownMenuItem>
            ) : (
                <Button variant={variant} size={size} onClick={() => setEmailOpen(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    {showText && 'Gửi email'}
                </Button>
            )}

            <SendEmailDialog
                open={emailOpen}
                onOpenChange={setEmailOpen}
                type="quotation"
                defaultTo={quotation.customer?.email || ''}
                data={{
                    customerName: quotation.customer?.company_name || 'Quý khách',
                    quotationNumber: quotation.quotation_number,
                    totalAmount: formatCurrency(quotation.total_amount),
                    validUntil: quotation.valid_until ? formatDate(quotation.valid_until) : 'N/A',
                    publicUrl: typeof window !== 'undefined'
                        ? `${window.location.origin}${publicUrl}`
                        : publicUrl,
                    senderName: quotation.creator?.full_name || 'Tulie Agency',
                }}
            />
        </>
    )
}
