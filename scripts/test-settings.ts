import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
    const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'system_settings';" })
    
    if (error) {
        // Fallback: try an insert without updated_at
        console.log('No RPC. Testing insert without updated_at...')
        const key = 'test_' + Date.now()
        const { error: err1 } = await supabase.from('system_settings').upsert({ key, value: { test: 1 } }, { onConflict: 'key' })
        console.log('Insert without updated_at error:', err1)
        
        const { error: err2 } = await supabase.from('system_settings').upsert({ key, value: { test: 1 }, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        console.log('Insert with updated_at error:', err2)
    } else {
        console.log('Columns:', data)
    }
}

run()
