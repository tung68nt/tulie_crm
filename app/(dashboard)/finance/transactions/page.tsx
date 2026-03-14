import { getAllTransactions } from '@/lib/supabase/services/payment-service'
import { TransactionsClient } from './transactions-client'

export default async function TransactionsPage() {
    const { data, total } = await getAllTransactions({ limit: 50, offset: 0 })

    return <TransactionsClient initialData={data} initialTotal={total} />
}
