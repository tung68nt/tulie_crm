import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    const { data, error } = await supa.from('products').select('*').limit(1)
    if (error) {
        console.error("Error:", error)
    } else {
        console.log("Products Schema Sample:", data[0])
    }
}
run()
