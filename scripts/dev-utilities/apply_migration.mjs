import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    console.log("Applying column additions...")
    const { error } = await supa.rpc('execute_sql', { sql_query: "ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;" })
    if (error) {
        console.error("RPC Error:", error.message)
    } else {
        console.log("Migration successful!")
    }
}
run()
