import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.from('retail_orders').select('*').limit(1)
    if (error) {
        console.error("Select Error:", error)
    } else if (data && data.length > 0) {
        console.log("Columns found via select:", Object.keys(data[0]))
    } else {
        console.log("No data in retail_orders table to infer columns.")
        // Try to check table info via rpc or just insert
        const { error: insertErr } = await supa.from('retail_orders').insert([{
            customer_name: 'TESTStructureCheck'
        }]).select()
        if (insertErr) {
            console.error("Insert error (revealing structure):", insertErr)
        } else {
            console.log("Insert worked, columns 'customer_name' exists.")
        }
    }
}
run()
