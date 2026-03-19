'use server'

import { createClient } from '../server'
import { Contract, ContractMilestone } from '@/types'
import { revalidatePath } from 'next/cache'
import { logActivity, logDestructiveAction } from './activity-service'

export async function getContracts(customerId?: string, type?: 'contract' | 'order', brand?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('contracts')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (type) {
            query = query.eq('type', type)
        }

        if (brand) {
            query = query.eq('brand', brand)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching contracts:', error)
            return []
        }

        return data as Contract[]
    } catch (err) {
        console.error('Fatal error in getContracts:', err)
        return []
    }
}

export async function getContractById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contracts')
            .select('*, customer:customers(*), creator:users(*), milestones:contract_milestones(*), quotation:quotations(id, quotation_number, deal_id)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching contract by id:', error)
            return null
        }

        return data as Contract
    } catch (err) {
        console.error('Fatal error in getContractById:', err)
        return null
    }
}

export async function createContract(contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]) {
    const supabase = await createClient()

    // Auto-snapshot customer info if customer_id is provided and no snapshot exists
    if (contract.customer_id && !contract.customer_snapshot) {
        const { data: custData } = await supabase
            .from('customers')
            .select('company_name, tax_code, email, phone, address, invoice_address, representative, position')
            .eq('id', contract.customer_id)
            .single()
        if (custData) {
            contract.customer_snapshot = custData
        }
    }

    // 1. Insert contract
    const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert([contract])
        .select()
        .single()

    if (contractError) {
        console.error('Error creating contract:', contractError)
        throw contractError
    }

    // 2. Insert milestones
    if (milestones && milestones.length > 0) {
        const contractMilestones = milestones.map(m => ({
            ...m,
            contract_id: contractData.id
        }))

        const { error: milestoneError } = await supabase
            .from('contract_milestones')
            .insert(contractMilestones)

        if (milestoneError) {
            console.error('Error creating milestones:', milestoneError)
            throw milestoneError
        }
    }

    revalidatePath('/contracts')

    await logActivity({
        action: 'create',
        entity_type: contract.type || 'contract',
        entity_id: contractData.id,
        description: `Tạo ${contract.type === 'order' ? 'đơn hàng' : 'hợp đồng'} mới: ${contract.title}`
    })

    return contractData
}

export async function updateContract(id: string, contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]) {
    try {
        const supabase = await createClient()

        // 1. Update contract
        const { error: contractError } = await supabase
            .from('contracts')
            .update(contract)
            .eq('id', id)

        if (contractError) {
            console.error('Error updating contract:', contractError)
            throw contractError
        }

        // 2. Refresh milestones
        const { error: deleteError } = await supabase
            .from('contract_milestones')
            .delete()
            .eq('contract_id', id)

        if (deleteError) {
            console.error('Error deleting old milestones:', deleteError)
            throw deleteError
        }

        if (milestones && milestones.length > 0) {
            const contractMilestones = milestones.map(m => ({
                ...m,
                id: undefined,
                contract_id: id
            }))

            const { error: milestoneError } = await supabase
                .from('contract_milestones')
                .insert(contractMilestones)

            if (milestoneError) {
                console.error('Error inserting new milestones:', milestoneError)
                throw milestoneError
            }

            // 3. Auto-sync: link payment milestones to the project (for customer portal)
            const { data: linkedProject } = await supabase
                .from('projects')
                .select('id')
                .eq('contract_id', id)
                .single()

            if (linkedProject) {
                await supabase
                    .from('contract_milestones')
                    .update({ project_id: linkedProject.id })
                    .eq('contract_id', id)
                    .eq('type', 'payment')
            }
        }

        revalidatePath('/contracts')
        revalidatePath(`/contracts/${id}`)

        await logActivity({
            action: 'update',
            entity_type: 'contract',
            entity_id: id,
            description: `Cập nhật hợp đồng: ${contract.title || id}`
        })

        return true
    } catch (err: any) {
        console.error('Fatal error in updateContract:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật hợp đồng')
    }
}

export async function deleteContract(id: string) {
    try {
        const supabase = await createClient()

        // 1. Find linked quotation and reset its status
        const { data: contract } = await supabase
            .from('contracts')
            .select('quotation_id')
            .eq('id', id)
            .single()

        // 2. Delete the contract
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting contract:', error)
            throw error
        }

        // 3. Reset quotation status so it can be re-converted
        if (contract?.quotation_id) {
            await supabase
                .from('quotations')
                .update({ status: 'accepted' })
                .eq('id', contract.quotation_id)
                .eq('status', 'converted')
            revalidatePath('/quotations')
        }

        revalidatePath('/contracts')
        await logDestructiveAction('contract', id, 'delete')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContract:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa hợp đồng')
    }
}

export async function deleteContracts(ids: string[]) {
    try {
        const supabase = await createClient()

        // 1. Find linked quotations before deletion
        const { data: contracts } = await supabase
            .from('contracts')
            .select('quotation_id')
            .in('id', ids)
        const quotationIds = (contracts || [])
            .map(c => c.quotation_id)
            .filter(Boolean) as string[]

        // 2. Delete contracts
        const { error } = await supabase
            .from('contracts')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting contracts:', error)
            throw error
        }

        // 3. Reset linked quotation statuses
        if (quotationIds.length > 0) {
            await supabase
                .from('quotations')
                .update({ status: 'accepted' })
                .in('id', quotationIds)
                .eq('status', 'converted')
            revalidatePath('/quotations')
        }

        revalidatePath('/contracts')
        await logDestructiveAction('contract', ids[0], 'bulk_delete', { affected_count: ids.length })
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContracts:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều hợp đồng')
    }
}
export async function convertQuotationToOrder(quotationId: string, type: 'contract' | 'order' = 'order') {
    try {
        const supabase = await createClient()

        // 1. Get quotation details
        const { data: quotation, error: qError } = await supabase
            .from('quotations')
            .select('*, customer:customers(*), items:quotation_items(*), deal:deals(*)')
            .eq('id', quotationId)
            .single()

        if (qError || !quotation) throw new Error('Không tìm thấy báo giá')

        // Guard: check if quotation is already converted and has a contract
        if (quotation.status === 'converted') {
            // Check if there's still a linked contract
            const { count } = await supabase
                .from('contracts')
                .select('id', { count: 'exact', head: true })
                .eq('quotation_id', quotationId)
            if (count && count > 0) {
                throw new Error('Báo giá này đã được chuyển thành hợp đồng/đơn hàng. Xóa hợp đồng cũ trước khi tạo mới.')
            }
            // If no contract exists (was deleted), reset status so conversion can proceed
            await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quotationId)
        }

        // 2. Generate number — use yyyymmdd/HDKT-TL-XXX if abbreviation exists
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const customerAbbr = quotation.customer?.abbreviation || ''
        let formattedNum: string
        if (customerAbbr) {
            const typePrefix = type === 'order' ? 'DH' : 'HDKT'
            formattedNum = `${dateStr}/${typePrefix}-TL-${customerAbbr.toUpperCase()}`
        } else {
            const prefix = type === 'order' ? 'DH' : 'HD'
            const countRes = await supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('type', type)
            const nextNum = (countRes.count || 0) + 1
            formattedNum = `${prefix}-${dateStr}-${nextNum.toString().padStart(3, '0')}`
        }

        // 3. Snapshot customer info from quotation join
        const customerSnapshot = quotation.customer ? {
            company_name: quotation.customer.company_name,
            tax_code: quotation.customer.tax_code,
            email: quotation.customer.email,
            phone: quotation.customer.phone,
            address: quotation.customer.address,
            invoice_address: quotation.customer.invoice_address,
            representative: quotation.customer.representative,
            position: quotation.customer.position,
        } : null

        // 4. Create Contract/Order
        const { data: contract, error: cError } = await supabase
            .from('contracts')
            .insert([{
                contract_number: formattedNum,
                order_number: type === 'order' ? formattedNum : null,
                customer_id: quotation.customer_id,
                quotation_id: quotation.id,
                title: quotation.title || `Đơn hàng từ ${quotation.quotation_number}`,
                total_amount: quotation.total_amount,
                status: 'draft',
                type: type,
                start_date: new Date().toISOString().split('T')[0],
                terms: quotation.terms,
                created_by: (await supabase.auth.getUser()).data.user?.id,
                brand: quotation.brand,
                project_id: quotation.project_id,
                customer_snapshot: customerSnapshot,
            }])
            .select()
            .single()

        if (cError) throw cError

        // 4. Create default milestones if it's an order
        const defaultMilestones = [
            { name: 'Khởi tạo & Xác nhận', description: 'Tiếp nhận đơn hàng và chuẩn bị triển khai', due_date: new Date().toISOString(), status: 'completed', type: 'work' },
            { name: 'Triển khai thực tế', description: 'Quá trình thực hiện dịch vụ/sản phẩm', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', type: 'work' },
            { name: 'Nghiệm thu & Bàn giao', description: 'Hoàn thiện và gửi kết quả cho khách hàng', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', type: 'work' }
        ]

        await supabase.from('contract_milestones').insert(
            defaultMilestones.map(m => ({ ...m, contract_id: contract.id }))
        )

        // 5. Create or Link Project
        if (quotation.project_id) {
            // Project already exists, just make sure contract is linked (done above in insert)
            // Optionally update project milestones or metadata if needed
        } else {
            // Create Project automatically
            const { data: project, error: pError } = await supabase.from('projects').insert([{
                contract_id: contract.id,
                customer_id: quotation.customer_id,
                title: `Dự án: ${contract.title}`,
                description: `Dự án triển khai từ ${type === 'order' ? 'đơn hàng' : 'hợp đồng'} ${contract.contract_number}`,
                status: 'todo',
                start_date: contract.start_date,
                assigned_to: contract.created_by,
                brand: quotation.brand,
                metadata: {
                    quotation_number: quotation.quotation_number,
                    source_link: '',
                    hosting_info: '',
                    domain_info: '',
                    ai_folder_link: ''
                }
            }]).select().single()

            if (!pError && project) {
                // Link quotation and contract to the new project
                await supabase.from('quotations').update({ project_id: project.id }).eq('id', quotation.id)
                await supabase.from('contracts').update({ project_id: project.id }).eq('id', contract.id)

                // Sync payment milestones to project for customer portal
                await supabase
                    .from('contract_milestones')
                    .update({ project_id: project.id })
                    .eq('contract_id', contract.id)
                    .eq('type', 'payment')
            }
        }

        // 6. Update quotation status
        await supabase.from('quotations').update({ status: 'converted' }).eq('id', quotationId)

        // 7. If linked to a deal, update deal status to closed_won
        if (quotation.deal_id) {
            await supabase.from('deals').update({ status: 'closed_won' }).eq('id', quotation.deal_id)
        }

        revalidatePath('/quotations')
        revalidatePath('/contracts')
        revalidatePath('/projects')
        revalidatePath('/deals')

        await logActivity({
            action: 'convert',
            entity_type: type,
            entity_id: contract.id,
            description: `Chuyển đổi báo giá ${quotation.quotation_number} thành ${type === 'order' ? 'đơn hàng' : 'hợp đồng'} ${contract.contract_number}`
        })

        return { success: true, id: contract.id }
    } catch (err: any) {
        console.error('Conversion error:', err)
        return { success: false, error: err.message }
    }
}
export async function getAcceptanceReportsByProjectId(projectId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('acceptance_reports')
            .select(`
                *,
                created_by_user:users!created_by(full_name),
                contract:contracts(contract_number)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching acceptance reports:', err)
        return []
    }
}
