import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProject() {
    const { data: projects, error: pErr } = await supabase.from('projects').select('*').limit(5)
    if (pErr) {
        console.error("error fetching projects:", pErr)
        return
    }
    if (!projects || projects.length === 0) {
        console.error("No projects found in database even with service role!")
        return
    }

    const id = projects[0].id
    console.log("Testing project ID:", id)

    const { data, error } = await supabase
        .from('projects')
        .select('*, customer:customers(*), assigned_user:users(*), contract:contracts!projects_contract_id_fkey(*), acceptance_reports(*), milestones:contract_milestones(*)')
        .eq('id', id)
        .single()

    console.log("Projects found:", projects.length)
    console.log("Fetch single project data:", !!data)
    console.log("Result error:", error)
}

testProject()
