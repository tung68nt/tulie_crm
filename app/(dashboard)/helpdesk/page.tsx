import { getTickets } from '@/lib/supabase/services/ticket-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { HelpdeskClient } from './helpdesk-client'

export const dynamic = 'force-dynamic'

export default async function HelpdeskPage() {
    const [tickets, users, customers] = await Promise.all([
        getTickets(),
        getUsers(),
        getCustomers()
    ])

    return (
        <HelpdeskClient
            initialTickets={tickets}
            users={users}
            customers={customers}
        />
    )
}
