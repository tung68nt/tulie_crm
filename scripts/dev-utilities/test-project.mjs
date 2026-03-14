import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log("Fetching a project ID...")
    // Find SFSV Marketing 2026 project
    const { data: projects, error: pErr } = await supabase.from('projects').select('id, title').ilike('title', '%SFSV%').limit(1)

    if (pErr) {
        console.error("Error fetching project:", pErr)
        return
    }

    if (!projects || projects.length === 0) {
        console.log("No SFSV projects found, fetching any project...")
        const { data: anyProjects } = await supabase.from('projects').select('id, title').limit(1)
        if (!anyProjects || anyProjects.length === 0) {
            console.log("No projects in database at all.")
            return
        }
        projects.push(anyProjects[0])
    }

    const id = projects[0].id
    console.log("Testing with project ID:", id, "Title:", projects[0].title)

    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            customer:customers(*),
            assigned_user:users(*),
            acceptance_reports(*),
            quotations!quotations_project_id_fkey(*),
            contracts:contracts!contracts_project_id_fkey(*),
            milestones:contract_milestones!contract_milestones_project_id_fkey(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error("Test Error:", error.message, error.details, error.hint)
    } else {
        console.log("Success! Data:", data)
    }
}

test()
