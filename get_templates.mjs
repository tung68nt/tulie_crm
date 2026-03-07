import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('document_templates').select('id, name')
  if (error) {
    console.error(error)
  } else {
    import('fs').then(fs => fs.writeFileSync('tmp_templates.json', JSON.stringify(data, null, 2)))
  }
}
run()
