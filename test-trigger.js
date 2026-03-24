const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('projects').insert([{
    title: 'Test Trigger',
    customer_id: 'e4cc18af-34b8-490b-ba6f-0099ab460f1b', // using some customer_id
    status: 'todo',
    brand: 'agency'
  }]).select();
  console.log("Result:", data, "Error:", error);
}

test();
