import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.from('products').select('*').limit(1)
    if (data && data.length > 0) {
        console.log("Existing columns:", Object.keys(data[0]))
    } else {
        console.log("No data found to check columns")
    }
}
run()
