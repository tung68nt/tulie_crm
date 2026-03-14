import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.rpc('execute_sql', { sql_query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'products';" })
    if (error) {
        // Fallback: use an insert and see what error says or just use a select * limit 1
        const { data: records, error: err2 } = await supa.from('products').select('*').limit(1)
        if (err2) {
            console.error("Error:", err2)
        } else {
            console.log("Existing columns:", Object.keys(records[0] || {}))
        }
    } else {
        console.log("Table info:", data)
    }
}
run()
