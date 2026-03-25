const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const quoteNumbers = ['Q-2025-GT-e180', 'Q-2025-GT-1bf3', 'Q-2025-GT-NEW'];
  
  // Find IDs
  const { data: quotes, error: fetchErr } = await supabase
    .from('quotations')
    .select('id, quotation_number')
    .in('quotation_number', quoteNumbers);
    
  if (fetchErr) {
    console.error("Error fetching:", fetchErr);
    process.exit(1);
  }
  
  if (!quotes || quotes.length === 0) {
    console.log("No quotes found.");
    process.exit(0);
  }
  
  const ids = quotes.map(q => q.id);
  console.log(`Found ${ids.length} quotes to delete. IDs:`, ids);
  
  // Clean up child tables to avoid FK errors
  await supabase.from('quotation_items').delete().in('quotation_id', ids);
  await supabase.from('quotation_versions').delete().in('quotation_id', ids);
  await supabase.from('quotation_views').delete().in('quotation_id', ids);
  
  // Delete quotations
  const { error: deleteErr } = await supabase
    .from('quotations')
    .delete()
    .in('id', ids);
    
  if (deleteErr) {
    console.error("Error deleting:", deleteErr);
    process.exit(1);
  }
  
  console.log("Successfully deleted.");
}

main().catch(console.error);
