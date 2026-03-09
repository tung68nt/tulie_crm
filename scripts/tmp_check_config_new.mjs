import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkConfig() {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'brand_config')
        .single()

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Brand Config:', JSON.stringify(data.value, null, 2))
}

checkConfig()
