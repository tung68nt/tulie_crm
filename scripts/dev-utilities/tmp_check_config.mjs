import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConfig() {
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'brand_config')
        .single()

    if (error) {
        console.error('Error fetching brand_config:', error)
        return
    }

    console.log('Brand Config:', JSON.stringify(data.value, null, 2))
}

checkConfig()
