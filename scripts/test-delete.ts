import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const contractId = '2c16e3e3-ae05-4b51-8087-75c7967f3fbc'

  const { error } = await supabase
    .from('contract_documents')
    .delete()
    .eq('contract_id', contractId)
    .eq('status', 'draft')

  console.log('Delete error:', error)
}

main()
