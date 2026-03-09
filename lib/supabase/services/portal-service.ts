'use server'

import { createClient } from '../server'
import { getQuotationByToken } from './quotation-service'
import { getBrandConfig } from './settings-service'

export async function getPortalDataByToken(token: string) {
    try {
        const supabase = await createClient()

        // 1. Get primary quotation
        const { data: qData } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), items:quotation_items(*), deal:deals(*), project:projects(*)')
            .eq('public_token', token)
            .single()

        if (!qData) return null
        const primaryQuotation = qData as any

        // Fetch creator (sales person) separately
        if (primaryQuotation.created_by) {
            const { data: creatorData } = await supabase
                .from('users')
                .select('id, full_name, email, phone')
                .eq('id', primaryQuotation.created_by)
                .single()
            if (creatorData) primaryQuotation.creator = creatorData
        }

        const projectId = primaryQuotation.project_id
        let allQuotations = [primaryQuotation]
        let allContracts: any[] = []
        let allInvoices: any[] = []
        let allTasks: any[] = []
        let allWorkItems: any[] = []
        let projectMetadata: any = null

        let extraMilestones: any[] = []

        // Fetch Grouped Data
        if (projectId) {
            // Get Project details with assigned manager
            const { data: pDetail } = await supabase
                .from('projects')
                .select('*, manager:users!assigned_to(id, full_name, email, phone)')
                .eq('id', projectId)
                .single()

            if (pDetail) {
                projectMetadata = {
                    ...(pDetail.metadata || {}),
                    manager_name: pDetail.manager?.full_name || 'Tulie Agency'
                }
            }

            // 1. Get all quotations in this project
            const { data: siblingQuotes } = await supabase
                .from('quotations')
                .select('*, customer:customers!customer_id(*), items:quotation_items(*)')
                .eq('project_id', projectId)

            if (siblingQuotes) allQuotations = siblingQuotes

            // 2. Get all contracts in this project
            const { data: siblingContracts } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*)')
                .eq('project_id', projectId)

            if (siblingContracts) allContracts = siblingContracts

            // 3. Get Project-level milestones
            const { data: projectMilestones } = await supabase
                .from('contract_milestones')
                .select('*')
                .eq('project_id', projectId)

            if (projectMilestones) {
                const contractMilestoneIds = new Set(allContracts.flatMap(c => c.milestones?.map((m: any) => m.id) || []))
                extraMilestones = projectMilestones.filter(m => !contractMilestoneIds.has(m.id))
            }

            // 4. Get all tasks in this project
            const { data: projectTasks } = await supabase
                .from('project_tasks')
                .select('*')
                .eq('project_id', projectId)

            if (projectTasks) allTasks = projectTasks

            // 5. Get work items with their tasks
            const { data: workItemsData } = await supabase
                .from('project_work_items')
                .select(`
                    *,
                    quotation:quotations(id, quotation_number, title, status, total_amount, public_token, created_at),
                    contract:contracts(id, contract_number, title, status, total_amount, created_at),
                    tasks:project_tasks(*)
                `)
                .eq('project_id', projectId)
                .order('sort_order', { ascending: true })

            if (workItemsData) allWorkItems = workItemsData
        } else {
            // Standalone mode: Only fetch descendants (Contract + Invoices) for this specific quote
            const { data: contract } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*)')
                .eq('quotation_id', primaryQuotation.id)
                .single()

            if (contract) allContracts = [contract]
        }

        // Fetch Invoices for all identified quotations/contracts
        const qIds = allQuotations.map(q => q.id)
        const cIds = allContracts.map(c => c.id)

        const orFilters = []
        if (qIds.length > 0) orFilters.push(`quotation_id.in.(${qIds.map(id => `'${id}'`).join(',')})`)
        if (cIds.length > 0) orFilters.push(`contract_id.in.(${cIds.map(id => `'${id}'`).join(',')})`)

        if (orFilters.length > 0) {
            const { data: matchingInvoices } = await supabase
                .from('invoices')
                .select('*, payments:invoice_payments(*)')
                .or(orFilters.join(','))
                .order('created_at', { ascending: false })
            if (matchingInvoices) allInvoices = matchingInvoices
        }

        // 2. Build consolidated timeline
        const timeline: any[] = []

        // Add all Quotation milestones
        allQuotations.forEach(q => {
            timeline.push({
                id: `quote-created-${q.id}`,
                type: 'milestone',
                title: `Khởi tạo báo giá #${q.quotation_number}`,
                description: q.title || `Báo giá đã được tạo`,
                date: q.created_at,
                status: 'completed',
                quotation_id: q.id
            })

            if (q.accepted_at) {
                timeline.push({
                    id: `quote-accepted-${q.id}`,
                    type: 'milestone',
                    title: `Phê duyệt báo giá #${q.quotation_number}`,
                    description: 'Khách hàng đã xác nhận đồng ý',
                    date: q.accepted_at,
                    status: 'completed',
                    quotation_id: q.id
                })
            }
        })

        // Add all Contract milestones
        allContracts.forEach(c => {
            const isOrder = c.type === 'order'
            timeline.push({
                id: `contract-created-${c.id}`,
                type: 'milestone',
                title: isOrder ? `Đơn hàng #${c.contract_number} đã xác nhận` : `Hợp đồng #${c.contract_number} đã xác lập`,
                description: c.title || `Dự án chính thức được triển khai`,
                date: c.created_at,
                status: 'completed',
                contract_id: c.id,
                quotation_id: c.quotation_id
            })

            if (c.milestones) {
                c.milestones.forEach((m: any) => {
                    timeline.push({
                        id: `milestone-${m.id}`,
                        type: m.type === 'payment' ? 'payment' : 'work',
                        title: m.name,
                        description: m.description + (m.delay_reason ? `\nLý do chậm trễ: ${m.delay_reason}` : ''),
                        date: m.status === 'completed' && m.completed_at ? m.completed_at : m.due_date,
                        planned_date: m.due_date,
                        status: m.status === 'completed' ? 'completed' :
                            (new Date(m.due_date) < new Date() ? 'overdue' : 'upcoming'),
                        is_late: m.status === 'completed' && m.completed_at && new Date(m.completed_at) > new Date(m.due_date),
                        contract_id: c.id,
                        quotation_id: c.quotation_id
                    })
                })
            }
        })

        // Add extra Project-level milestones
        extraMilestones.forEach((m: any) => {
            timeline.push({
                id: `milestone-${m.id}`,
                type: m.type === 'payment' ? 'payment' : 'work',
                title: m.name,
                description: m.description + (m.delay_reason ? `\nLý do chậm trễ: ${m.delay_reason}` : ''),
                date: m.status === 'completed' && m.completed_at ? m.completed_at : m.due_date,
                planned_date: m.due_date,
                status: m.status === 'completed' ? 'completed' :
                    (new Date(m.due_date) < new Date() ? 'overdue' : 'upcoming'),
                is_late: m.status === 'completed' && m.completed_at && new Date(m.completed_at) > new Date(m.due_date)
            })
        })

        // Add all Invoice milestones
        allInvoices.forEach(inv => {
            timeline.push({
                id: `invoice-${inv.id}`,
                type: 'payment',
                title: `Yêu cầu thanh toán: ${inv.invoice_number}`,
                description: `Số tiền: ${inv.total_amount.toLocaleString('vi-VN')} VNĐ`,
                date: inv.issue_date,
                status: inv.status === 'paid' ? 'completed' : 'pending',
                amount: inv.total_amount,
                contract_id: inv.contract_id,
                quotation_id: inv.quotation_id
            })
        })

        // Sort by date
        timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Fetch Brand Config
        const brandConfig = await getBrandConfig()

        // Fetch Activities for the project/quotation
        let activities: any[] = []
        try {
            if (projectId) {
                const { data: actData } = await supabase
                    .from('activity_log')
                    .select('*, user:users(*)')
                    .or(`entity_id.eq.${projectId},metadata->>project_id.eq.${projectId}`)
                    .order('created_at', { ascending: false })
                    .limit(20)
                if (actData) activities = actData
            } else {
                const { data: actData } = await supabase
                    .from('activity_log')
                    .select('*, user:users(*)')
                    .eq('entity_id', primaryQuotation.id)
                    .order('created_at', { ascending: false })
                    .limit(20)
                if (actData) activities = actData
            }
        } catch (actErr) {
            console.error('Error fetching portal activities:', actErr)
        }

        return {
            quotation: primaryQuotation,
            quotations: allQuotations,
            contracts: allContracts,
            invoices: allInvoices,
            tasks: allTasks,
            timeline,
            customer: primaryQuotation.customer,
            project: primaryQuotation.project,
            projectMetadata,
            brandConfig,
            workItems: allWorkItems,
            activities
        }
    } catch (err) {
        console.error('Error fetching portal data:', err)
        return null
    }
}

export async function updatePortalCustomerInfo(token: string, customerId: string, updateData: any) {
    try {
        const supabase = await createClient()

        // 1. Verify token belongs to this customer
        const { data: qData } = await supabase
            .from('quotations')
            .select('customer_id')
            .eq('public_token', token)
            .single()

        if (!qData || qData.customer_id !== customerId) {
            throw new Error('Unauthorized or invalid token.')
        }

        // 2. Perform the update and lock the profile
        const { error } = await supabase
            .from('customers')
            .update({
                company_name: updateData.company_name,
                representative: updateData.representative,
                position: updateData.position,
                tax_code: updateData.tax_code,
                email: updateData.email,
                phone: updateData.phone,
                address: updateData.address,
                invoice_address: updateData.invoice_address,
                is_info_unlocked: false // lock after updating
            })
            .eq('id', customerId)
            .eq('is_info_unlocked', true) // ensure it was actually unlocked

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('Error updating customer info from portal:', err)
        return { success: false, error: err.message }
    }
}
