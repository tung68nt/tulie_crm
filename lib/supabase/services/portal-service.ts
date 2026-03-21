'use server'

import { createAdminClient } from '../admin'
import { getQuotationByToken } from './quotation-service'
import { getBrandConfig } from './settings-service'

export async function getPortalDataByToken(token: string) {
    try {
        const supabase = createAdminClient()

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
                .select('id, full_name')
                .eq('id', primaryQuotation.created_by)
                .single()
            // SECURITY: Only expose name to portal clients
            if (creatorData) primaryQuotation.creator = { full_name: creatorData.full_name }
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
                .select('*, manager:users!assigned_to(id, full_name)')
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

            const qIdsStr = allQuotations.map(q => q.id).join(',')
            const contractOrFilter = qIdsStr ? `project_id.eq.${projectId},quotation_id.in.(${qIdsStr})` : `project_id.eq.${projectId}`

            const { data: siblingContracts } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*)')
                .or(contractOrFilter)

            if (siblingContracts) {
                // Deduplicate in case a contract matches both
                const uniqueContracts = Array.from(new Map(siblingContracts.map(c => [c.id, c])).values())
                allContracts = uniqueContracts
            }

            // 2b. Fetch contract_documents for all contracts (so portal can show viewable docs)
            if (allContracts.length > 0) {
                const contractIds = allContracts.map(c => c.id)
                let { data: contractDocs } = await supabase
                    .from('contract_documents')
                    .select('id, contract_id, type, doc_number, content, status, is_visible_on_portal')
                    .in('contract_id', contractIds)
                    .order('created_at', { ascending: true })

                // Auto-generate documents for contracts that don't have any yet
                const contractsWithDocs = new Set((contractDocs || []).map(d => d.contract_id))
                const contractsWithoutDocs = allContracts.filter(c => !contractsWithDocs.has(c.id))
                if (contractsWithoutDocs.length > 0) {
                    try {
                        const { generateDocumentBundle } = await import('./document-template-service')
                        for (const c of contractsWithoutDocs) {
                            const generated = await generateDocumentBundle(c.id)
                            if (generated && generated.length > 0) {
                                contractDocs = [...(contractDocs || []), ...generated.map((d: any) => ({
                                    id: d.id || d.contract_id + '-' + d.type,
                                    contract_id: d.contract_id,
                                    type: d.type,
                                    doc_number: d.doc_number,
                                    content: d.content,
                                    status: d.status,
                                    is_visible_on_portal: true
                                }))]
                            }
                        }
                    } catch (genErr) {
                        console.error('Error auto-generating contract documents:', genErr)
                    }
                }

                if (contractDocs) {
                    // Attach documents to their respective contracts
                    const docsByContract = new Map<string, any[]>()
                    contractDocs.forEach(doc => {
                        const list = docsByContract.get(doc.contract_id) || []
                        list.push(doc)
                        docsByContract.set(doc.contract_id, list)
                    })
                    allContracts = allContracts.map(c => ({
                        ...c,
                        documents: docsByContract.get(c.id) || []
                    }))
                }
            }

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

            if (workItemsData) {
                // Auto-match contracts to work items via quotation_id
                // (work items may have quotation_id but no contract_id set yet)
                // Then attach documents from allContracts (which have contract_documents loaded)
                allWorkItems = workItemsData.map((wi: any) => {
                    let workItem = wi

                    if (!wi.contract && wi.quotation_id) {
                        const matchedContract = allContracts.find(c => c.quotation_id === wi.quotation_id)
                        if (matchedContract) {
                            workItem = {
                                ...wi,
                                contract_id: matchedContract.id,
                                contract: {
                                    id: matchedContract.id,
                                    contract_number: matchedContract.contract_number,
                                    title: matchedContract.title,
                                    status: matchedContract.status,
                                    total_amount: matchedContract.total_amount,
                                    created_at: matchedContract.created_at,
                                    documents: matchedContract.documents || []
                                }
                            }
                        }
                    }

                    // Attach documents from allContracts to work item's contract
                    // (Supabase join only fetches basic contract fields, not contract_documents)
                    if (workItem.contract && !workItem.contract.documents) {
                        const fullContract = allContracts.find(c => c.id === workItem.contract.id)
                        if (fullContract?.documents) {
                            workItem = {
                                ...workItem,
                                contract: { ...workItem.contract, documents: fullContract.documents }
                            }
                        }
                    }

                    return workItem
                })
            }
        } else {
            // Standalone mode: Only fetch descendants (Contract + Invoices) for this specific quote
            const { data: contract } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*)')
                .eq('quotation_id', primaryQuotation.id)
                .single()

            if (contract) {
                // Also fetch contract_documents for standalone mode
                let { data: contractDocs } = await supabase
                    .from('contract_documents')
                    .select('id, contract_id, type, doc_number, content, status, is_visible_on_portal')
                    .eq('contract_id', contract.id)
                    .order('created_at', { ascending: true })

                // Auto-generate if no documents exist yet
                if (!contractDocs || contractDocs.length === 0) {
                    try {
                        const { generateDocumentBundle } = await import('./document-template-service')
                        const generated = await generateDocumentBundle(contract.id)
                        if (generated && generated.length > 0) {
                            contractDocs = generated.map((d: any) => ({
                                id: d.id || d.contract_id + '-' + d.type,
                                contract_id: d.contract_id,
                                type: d.type,
                                doc_number: d.doc_number,
                                content: d.content,
                                status: d.status,
                                is_visible_on_portal: true
                            }))
                        }
                    } catch (genErr) {
                        console.error('Error auto-generating contract documents (standalone):', genErr)
                    }
                }

                allContracts = [{ ...contract, documents: contractDocs || [] }]
            }
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
                description: `Số tiền: ${inv.total_amount.toLocaleString('vi-VN')} VND`,
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
                    .select('id, entity_type, entity_id, action, details, created_at, user:users(id, full_name)')
                    .or(`entity_id.eq.${projectId},metadata->>project_id.eq.${projectId}`)
                    .order('created_at', { ascending: false })
                    .limit(20)
                if (actData) activities = actData
            } else {
                const { data: actData } = await supabase
                    .from('activity_log')
                    .select('id, entity_type, entity_id, action, details, created_at, user:users(id, full_name)')
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
        const { createAdminClient } = await import('../admin')
        const supabase = createAdminClient()

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
                representative_title: updateData.representative_title,
                representative: updateData.representative,
                position: updateData.position,
                tax_code: updateData.tax_code,
                email: updateData.email,
                phone: updateData.phone,
                address: updateData.address,
                invoice_address: updateData.invoice_address,
                is_info_unlocked: false // lock after final save
            })
            .eq('id', customerId)

        if (error) throw error

        // 3. Sync to customer_snapshot on contracts in the same project
        const snapshot = {
            company_name: updateData.company_name,
            representative_title: updateData.representative_title,
            representative: updateData.representative,
            position: updateData.position,
            tax_code: updateData.tax_code,
            email: updateData.email,
            phone: updateData.phone,
            address: updateData.address,
            invoice_address: updateData.invoice_address,
        }

        // Find project_id from the quotation linked to this token
        const { data: qDetail } = await supabase
            .from('quotations')
            .select('project_id')
            .eq('public_token', token)
            .single()

        if (qDetail?.project_id) {
            await supabase
                .from('contracts')
                .update({ customer_snapshot: snapshot })
                .eq('project_id', qDetail.project_id)
        } else {
            // Fallback: no project — sync only contracts of this customer
            await supabase
                .from('contracts')
                .update({ customer_snapshot: snapshot })
                .eq('customer_id', customerId)
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error updating customer info from portal:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Save customer info as draft (partial save, does NOT lock profile)
 * Allows customers to fill in data incrementally
 */
export async function savePortalCustomerInfoDraft(token: string, customerId: string, updateData: any) {
    try {
        const { createAdminClient } = await import('../admin')
        const supabase = createAdminClient()

        const { data: qData } = await supabase
            .from('quotations')
            .select('customer_id')
            .eq('public_token', token)
            .single()

        if (!qData || qData.customer_id !== customerId) {
            throw new Error('Unauthorized or invalid token.')
        }

        // Only update non-empty fields, keep is_info_unlocked unchanged
        const fieldsToUpdate: Record<string, any> = {}
        const allowedFields = ['company_name', 'representative_title', 'representative', 'position', 'tax_code', 'email', 'phone', 'address', 'invoice_address']
        for (const field of allowedFields) {
            if (updateData[field] !== undefined && updateData[field] !== '') {
                fieldsToUpdate[field] = updateData[field]
            }
        }

        if (Object.keys(fieldsToUpdate).length === 0) {
            return { success: true }
        }

        const { error } = await supabase
            .from('customers')
            .update(fieldsToUpdate)
            .eq('id', customerId)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('Error saving customer info draft:', err)
        return { success: false, error: err.message }
    }
}
