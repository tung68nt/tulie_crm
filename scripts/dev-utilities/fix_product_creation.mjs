import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    console.log("Checking columns for 'products' table...")
    const { data: cols, error: err } = await supa.rpc('execute_sql', { sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';" })
    
    if (err) {
        console.log("RPC execute_sql failed, using workaround...")
        // Try to insert a dummy product to see which columns it has
        const dummyProduct = {
            name: "Test Product " + Date.now(),
            price: 1000,
            category: "Test",
            unit: "Test"
        }
        const { error: insertErr } = await supa.from('products').insert([dummyProduct])
        if (insertErr) {
            console.error("Insert failed:", insertErr.message)
        } else {
            console.log("Insert successful! Table columns are likely correct.")
        }
    } else {
        console.log("Columns:", cols)
    }
}
run()
