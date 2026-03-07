'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { SendEmailDialog } from '@/components/shared/send-email-dialog'

interface InvoiceEmailButtonProps {
    customerEmail?: string
    customerName: string
    invoiceNumber: string
    totalAmount: string
    dueDate: string
    senderName: string
}

export function InvoiceEmailButton({
    customerEmail,
    customerName,
    invoiceNumber,
    totalAmount,
    dueDate,
    senderName,
}: InvoiceEmailButtonProps) {
    const [emailOpen, setEmailOpen] = useState(false)

    return (
        <>
            <Button variant="outline" onClick={() => setEmailOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Gửi email
            </Button>

            <SendEmailDialog
                open={emailOpen}
                onOpenChange={setEmailOpen}
                type="invoice"
                defaultTo={customerEmail || ''}
                data={{
                    customerName,
                    invoiceNumber,
                    totalAmount,
                    dueDate,
                    senderName,
                }}
            />
        </>
    )
}
