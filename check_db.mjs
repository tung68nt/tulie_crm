import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase.from('quotations').select('id, password_hash').limit(1)
    console.log('Data:', data)
    console.log('Error:', error)
}

check()
