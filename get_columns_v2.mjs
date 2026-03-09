import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.rpc('get_table_columns', { table_name: 'retail_orders' })
    if (error) {
        // Fallback: use SQL if rpc not available
        const { data: qData, error: qErr } = await supa.from('_dummy').select('*').limit(0) // Usually doesnt work for schema.
        // Let's try to query information_schema directly via an ad-hoc SQL if I could.
        // But in Supabase client I can only do this if I have a proxy or RPC.
        // Let's try to fetch an existing row and see keys properly.
        const { data: rows, error: rowsErr } = await supa.from('retail_orders').select('*').limit(1)
        if (rowsErr) {
            console.error("Fetch Error:", rowsErr)
        } else if (rows && rows.length > 0) {
            console.log("Columns:", Object.keys(rows[0]))
        } else {
            console.log("Empty table, check constraints revealed some info.")
        }
    } else {
        console.log("Columns:", data)
    }
}
run()
