import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { error } = await supabase.from('document_templates').delete().neq('id', 'non-existent')
  if (error) {
    console.error(error)
  } else {
    console.log("Successfully purged old templates.")
  }
}
run()
