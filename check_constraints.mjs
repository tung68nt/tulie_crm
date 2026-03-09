import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.rpc('get_table_info', { table_name: 'products' })
    if (error) {
        // Fallback to direct query if RPC doesn't exist
        const { data: cols, error: err2 } = await supa.from('products').select('*').limit(0)
        console.log("Columns:", Object.keys(cols?.[0] || {}))
        console.log("Error:", err2)
    } else {
        console.log("Table info:", data)
    }
}
run()
