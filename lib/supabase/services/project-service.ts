'use server'

import { createClient } from '../server'
import { Project, ProjectStatus } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getProjects(customerId?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('projects')
            .select('*, customer:customers(id, company_name), assigned_user:users(*), contract:contracts!projects_contract_id_fkey(id, contract_number)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching projects:', error)
            return []
        }

        return data as Project[]
    } catch (err) {
        console.error('Fatal error in getProjects:', err)
        return []
    }
}

export async function getProjectById(id: string) {
    try {
        const supabase = await createClient()
        // Simplify select to avoid relationship ambiguities on empty/new projects
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                customer:customers(*),
                assigned_user:users(*),
                acceptance_reports(*),
                quotations(*),
                contracts(*),
                milestones:contract_milestones(*)
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error(`Error fetching project by id [${id}]:`, error)
            return null
        }

        return data as Project
    } catch (err) {
        console.error(`Fatal error in getProjectById [${id}]:`, err)
        return null
    }
}

export async function createProject(project: Partial<Project>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('projects')
            .insert([project])
            .select()
            .single()

        if (error) {
            console.error('Error creating project:', error)
            throw error
        }

        revalidatePath('/projects')
        return data as Project
    } catch (err) {
        console.error('Service error creating project:', err)
        throw err
    }
}

export async function updateProject(id: string, project: Partial<Project>) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('projects')
            .update(project)
            .eq('id', id)

        if (error) {
            console.error('Error updating project:', error)
            throw error
        }

        revalidatePath('/projects')
        revalidatePath(`/projects/${id}`)
        return true
    } catch (err) {
        console.error('Service error updating project:', err)
        throw err
    }
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
    return updateProject(id, { status })
}

export async function updateProjectMetadata(id: string, metadata: any) {
    try {
        const supabase = await createClient()
        // Get existing metadata first to merge
        const { data: existing } = await supabase.from('projects').select('metadata').eq('id', id).single()

        const newMetadata = {
            ...(existing?.metadata || {}),
            ...metadata
        }

        const { error } = await supabase
            .from('projects')
            .update({ metadata: newMetadata })
            .eq('id', id)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating project metadata:', err)
        throw err
    }
}

// Acceptance Reports Service
export async function createAcceptanceReport(report: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('acceptance_reports')
            .insert([{
                ...report,
                created_by: user?.id
            }])
            .select()
            .single()

        if (error) throw error
        return data
    } catch (err) {
        console.error('Error creating acceptance report:', err)
        throw err
    }
}

export async function signAcceptanceReport(reportId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('acceptance_reports')
            .update({
                is_signed: true,
                signed_at: new Date().toISOString()
            })
            .eq('id', reportId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error signing acceptance report:', err)
        throw err
    }
}

export async function updateProjectMilestones(projectId: string, milestones: any[]) {
    try {
        const supabase = await createClient()

        // 1. Delete old project-level milestones
        const { error: deleteError } = await supabase
            .from('contract_milestones')
            .delete()
            .eq('project_id', projectId)

        if (deleteError) throw deleteError

        // 2. Insert new milestones
        if (milestones.length > 0) {
            const milestoneData = milestones.map(m => ({
                name: m.name,
                description: m.description || '',
                due_date: m.due_date,
                amount: m.amount || 0,
                status: m.status || 'pending',
                type: m.type || 'work',
                project_id: projectId,
                completed_at: m.completed_at || null,
                delay_reason: m.delay_reason || ''
            }))

            const { error: insertError } = await supabase
                .from('contract_milestones')
                .insert(milestoneData)

            if (insertError) throw insertError
        }

        revalidatePath(`/projects/${projectId}`)
        return true
    } catch (err) {
        console.error('Error updating project milestones:', err)
        throw err
    }
}
