// Quick script to fix contract_milestones missing updated_at column
// Run from project root: node scripts/fix_milestones_now.js

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zktmaekplppmzqdmglze.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

async function main() {
  // Step 1: Check current columns
  console.log('=== Checking contract_milestones structure ===')
  const { data: sample, error: sampleErr } = await supabase
    .from('contract_milestones')
    .select('*')
    .limit(1)
  
  if (sampleErr) {
    console.log('Error:', sampleErr)
    return
  }
  
  const cols = sample?.[0] ? Object.keys(sample[0]) : []
  console.log('Current columns:', cols.join(', '))
  console.log('Has updated_at?', cols.includes('updated_at'))
  
  if (cols.includes('updated_at')) {
    console.log('\n✅ Column already exists! The trigger should work fine.')
    console.log('The issue might be elsewhere. Let me check a sample milestone:')
    console.log(JSON.stringify(sample[0], null, 2))
    return
  }
  
  console.log('\n❌ Column updated_at is MISSING! This is causing the trigger error.')
  console.log('You need to run the following SQL in Supabase Dashboard → SQL Editor:')
  console.log('\n---')
  console.log(`ALTER TABLE public.contract_milestones 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());`)
  console.log('---\n')
}

main().catch(console.error)
