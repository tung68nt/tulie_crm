'use server'

import { getAllTransactions, syncTransactionsFromSePay } from '@/lib/supabase/services/payment-service'

export async function syncTransactionsAction() {
    return await syncTransactionsFromSePay({ limit: 100 })
}

export async function loadTransactionsAction(params: {
    search?: string
    matchedOnly?: boolean
    unmatchedOnly?: boolean
    sourceSystem?: string
    transferType?: string
    limit?: number
    offset?: number
}) {
    return await getAllTransactions(params)
}
