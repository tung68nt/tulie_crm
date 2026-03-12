'use server'

import { createClient } from '../server'
import { SupportTicket, TicketMessage } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getTickets(filters?: {
    status?: string
    priority?: string
    customer_id?: string
    project_id?: string
    assigned_to?: string
}) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('support_tickets')
            .select('*, customer:customers(id, company_name), project:projects(id, title), assigned_user:users!assigned_to(id, full_name)')
            .order('created_at', { ascending: false })

        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.priority) query = query.eq('priority', filters.priority)
        if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
        if (filters?.project_id) query = query.eq('project_id', filters.project_id)
        if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)

        const { data, error } = await query
        if (error) {
            console.error('Error fetching tickets:', error)
            return []
        }
        return data as SupportTicket[]
    } catch (err) {
        console.error('Fatal error in getTickets:', err)
        return []
    }
}

export async function getTicketById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, customer:customers(*), project:projects(id, title), assigned_user:users!assigned_to(id, full_name, avatar_url), messages:ticket_messages(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching ticket:', error)
            return null
        }

        // Sort messages by date
        if (data?.messages) {
            data.messages.sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
        }

        return data as SupportTicket
    } catch (err) {
        console.error('Fatal error in getTicketById:', err)
        return null
    }
}

export async function createTicket(ticket: Partial<SupportTicket>) {
    try {
        const supabase = await createClient()

        // Generate ticket number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const countRes = await supabase.from('support_tickets').select('id', { count: 'exact', head: true })
        const nextNum = (countRes.count || 0) + 1
        const ticketNumber = `TK-${dateStr}-${nextNum.toString().padStart(3, '0')}`

        const { data, error } = await supabase
            .from('support_tickets')
            .insert([{
                ...ticket,
                ticket_number: ticketNumber,
                status: ticket.status || 'open',
                priority: ticket.priority || 'medium',
                category: ticket.category || 'support',
            }])
            .select()
            .single()

        if (error) throw error

        revalidatePath('/helpdesk')
        return data as SupportTicket
    } catch (err: any) {
        console.error('Error creating ticket:', err)
        throw new Error(err.message || 'Lỗi khi tạo ticket')
    }
}

export async function updateTicket(id: string, updates: Partial<SupportTicket>) {
    try {
        const supabase = await createClient()

        // Auto-set resolved_at/closed_at
        if (updates.status === 'resolved' && !updates.resolved_at) {
            updates.resolved_at = new Date().toISOString()
        }
        if (updates.status === 'closed' && !updates.closed_at) {
            updates.closed_at = new Date().toISOString()
        }

        const { error } = await supabase
            .from('support_tickets')
            .update(updates)
            .eq('id', id)

        if (error) throw error

        revalidatePath('/helpdesk')
        revalidatePath(`/helpdesk/${id}`)
        return true
    } catch (err: any) {
        console.error('Error updating ticket:', err)
        throw new Error(err.message || 'Lỗi khi cập nhật ticket')
    }
}

export async function addTicketMessage(ticketId: string, message: Partial<TicketMessage>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('ticket_messages')
            .insert([{
                ticket_id: ticketId,
                sender_type: message.sender_type || 'staff',
                sender_name: message.sender_name || '',
                content: message.content || '',
                attachments: message.attachments || [],
            }])
            .select()
            .single()

        if (error) throw error

        // Update ticket status to in_progress if it was open
        await supabase
            .from('support_tickets')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('id', ticketId)
            .eq('status', 'open')

        revalidatePath(`/helpdesk/${ticketId}`)
        return data as TicketMessage
    } catch (err: any) {
        console.error('Error adding ticket message:', err)
        throw new Error(err.message || 'Lỗi khi gửi tin nhắn')
    }
}

export async function deleteTicket(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('support_tickets')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/helpdesk')
        return true
    } catch (err: any) {
        console.error('Error deleting ticket:', err)
        throw new Error(err.message || 'Lỗi khi xóa ticket')
    }
}
