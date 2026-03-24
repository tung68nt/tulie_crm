import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const contractId = '2c16e3e3-ae05-4b51-8087-75c7967f3fbc'
  
  // 1. Select existing
  const { data: before } = await supabase.from('contract_documents').select('id, type, created_at').eq('contract_id', contractId)
  console.log('Before delete:', before?.length)

  // 2. Delete
  const res = await supabase
        .from('contract_documents')
        .delete()
        .eq('contract_id', contractId)
        .eq('status', 'draft')
        
  console.log('Delete result:', res.error ? res.error : 'Success, count expected', res.count);

  // 3. Select after
  const { data: after } = await supabase.from('contract_documents').select('id, type, created_at').eq('contract_id', contractId)
  console.log('After delete:', after?.length)
}

main()
