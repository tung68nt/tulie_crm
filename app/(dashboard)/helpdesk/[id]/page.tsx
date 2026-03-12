import { getTicketById } from '@/lib/supabase/services/ticket-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { notFound } from 'next/navigation'
import { TicketDetailClient } from './ticket-detail-client'

export default async function TicketDetailPage({ params }: any) {
    const { id } = await params
    const [ticket, users] = await Promise.all([
        getTicketById(id),
        getUsers()
    ])

    if (!ticket) notFound()

    return <TicketDetailClient ticket={ticket} users={users} />
}
