'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { SendEmailDialog } from '@/components/shared/send-email-dialog'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface ContractEmailButtonProps {
    contract: any
}

export function ContractEmailButton({
    contract,
}: ContractEmailButtonProps) {
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
                type="contract"
                defaultTo={contract.customer?.email || ''}
                data={{
                    customerName: contract.customer?.company_name || 'Quý khách',
                    contractNumber: contract.contract_number,
                    title: contract.title,
                    totalAmount: formatCurrency(contract.total_amount),
                    startDate: formatDate(contract.start_date),
                    endDate: contract.end_date ? formatDate(contract.end_date) : undefined,
                    senderName: contract.creator?.full_name || 'Tulie Agency',
                }}
            />
        </>
    )
}
