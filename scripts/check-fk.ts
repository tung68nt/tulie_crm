import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFKs() {
    const { data, error } = await supabase.rpc('query_fk_quotations', {})
    
    // Actually, we can just try to delete an old quotation or check error message.
    // If we want to execute raw SQL, we can't via REST API unless we have an RPC.
    console.log('We need to check foreign keys.')
}

checkFKs()
