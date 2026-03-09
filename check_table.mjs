import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    // Try to get one record and see its keys
    const { data, error } = await supa.from('products').select('*').limit(1)
    if (error) {
        console.error("Error:", error)
        return
    }
    console.log("Record structure:", data[0])
}
run()
