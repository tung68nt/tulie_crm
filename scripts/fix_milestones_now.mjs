// Test: fetch contract and check for non-serializable values
const CONTRACT_ID = process.env.CONTRACT_ID || '48ec5a59-7436-4a05-9e19-015e926304b1'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zktmaekplppmzqdmglze.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

async function main() {
  // Exactly replicate getContractById query
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/contracts?id=eq.${CONTRACT_ID}&select=*,customer:customers(*),creator:users(*),milestones:contract_milestones(*),quotation:quotations(id,quotation_number,deal_id)`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    }
  )
  
  const data = await res.json()
  const contract = data?.[0]
  
  if (!contract) {
    console.log('Contract not found!')
    return
  }
  
  console.log('=== Contract fields ===')
  for (const [key, value] of Object.entries(contract)) {
    if (value === undefined) {
      console.log(`  ⚠️ UNDEFINED: ${key}`)
    } else if (value !== null && typeof value === 'object' && !(value instanceof Array)) {
      // Check nested objects
      for (const [k2, v2] of Object.entries(value)) {
        if (v2 === undefined) {
          console.log(`  ⚠️ UNDEFINED in ${key}.${k2}`)
        }
      }
    }
    
    // Check for Date objects or other non-serializable values
    if (value instanceof Date) {
      console.log(`  ⚠️ DATE OBJECT: ${key}`)  
    }
  }
  
  console.log('\n=== Contract key values ===')
  console.log('contract_number:', JSON.stringify(contract.contract_number))
  console.log('status:', JSON.stringify(contract.status))
  console.log('start_date:', JSON.stringify(contract.start_date))
  console.log('end_date:', JSON.stringify(contract.end_date))
  console.log('signed_date:', JSON.stringify(contract.signed_date))
  
  console.log('\n=== Customer ===')
  console.log(JSON.stringify(contract.customer, null, 2))
  
  console.log('\n=== Milestones ===')
  console.log('Count:', contract.milestones?.length)
  contract.milestones?.forEach((m, i) => {
    console.log(`[${i}]`, JSON.stringify(m))
  })
  
  console.log('\n=== Quotation ===')
  console.log(JSON.stringify(contract.quotation, null, 2))
  
  console.log('\n=== Creator ===')
  console.log(JSON.stringify(contract.creator, null, 2))
  
  // Test JSON serialization (same as Next.js would do)
  console.log('\n=== Serialization test ===')
  try {
    const serialized = JSON.stringify(contract)
    const parsed = JSON.parse(serialized)
    console.log('✅ Contract serializes OK, size:', serialized.length)
  } catch (e) {
    console.log('❌ Serialization FAILED:', e.message)
  }
}

main().catch(console.error)
