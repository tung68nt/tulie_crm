import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // use service role key to bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProject() {
    // Get a project ID
    const { data: projects, error: pErr } = await supabase.from('projects').select('id').limit(1)
    if (pErr) {
        console.error("error fetching projects:", pErr)
        return
    }
    if (!projects || projects.length === 0) {
        console.error("No projects found")
        return
    }
    
    const id = projects[0].id
    console.log("Testing project ID:", id)
    
    const { data, error } = await supabase
        .from('projects')
        .select('*, customer:customers(*), assigned_user:users(*), contract:contracts(*), acceptance_reports(*), milestones:contract_milestones(*)')
        .eq('id', id)
        .single()
        
    console.log("Result error:", error)
}

testProject()
