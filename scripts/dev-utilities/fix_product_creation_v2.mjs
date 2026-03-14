import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    console.log("Starting debug...")
    const { data: records, error: selectErr } = await supa.from('products').select('*').limit(1)
    if (selectErr) {
        console.error("Select failed:", selectErr.message)
    } else {
        console.log("Structure of first record:", records[0])
    }
    
    const dummyProduct = {
        name: "DEBUG_TEST_" + Date.now(),
        price: 99999,
        category: "Debugging",
        unit: "Test"
    }
    console.log("Attempting insert...")
    const { error: insertErr } = await supa.from('products').insert([dummyProduct])
    if (insertErr) {
        console.error("Insert error:", insertErr)
    } else {
        console.log("Insert success!")
    }
}
run()
