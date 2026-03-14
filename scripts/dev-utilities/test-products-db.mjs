import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSQL() {
    const { data, error } = await supabase.rpc('hello_world') // test
    console.log('Testing connection...')

    // Try to alter products table
    const query = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS default_templates uuid[] DEFAULT '{}';
  `
    // Actually, RPC execute sql
    const { error: queryError } = await supabase.rest.from('products').select('*').limit(1)
    if (queryError) {
        console.log('Error querying products:', queryError)
    } else {
        console.log('Products table accessible.')
    }
}

runSQL()
