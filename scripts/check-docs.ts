import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('contract_documents')
    .select('id, contract_id, type, status, doc_number, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

main()
