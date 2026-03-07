import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testProject() {
    const { data, error } = await supabase.from('contract_milestones').select('*, project_id').limit(1)
    console.log("Check if project_id exists:", data, error)
}
testProject()
