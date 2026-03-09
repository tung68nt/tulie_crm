import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
    console.log("Fetching categories...")
    const { data, error } = await supa.from('product_categories').select('*')
    console.log("Categories:", data)
}
run()
