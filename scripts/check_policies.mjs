
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPolicies() {
    const { data, error } = await supabase.rpc('get_table_policies', { table_name: 'retail_orders' });
    if (error) {
        // Try direct query if rpc doesn't exist
        const { data: policies, error: err2 } = await supabase.from('pg_policies' as any).select('*').eq('tablename', 'retail_orders');
        console.error('Error fetching policies via RPC:', error);
        if (policies) {
            console.log('Policies (from pg_policies):', policies);
        } else {
            console.error('Error fetching from pg_policies:', err2);
        }
    } else {
        console.log('Policies info:', data);
    }
}

checkPolicies();
