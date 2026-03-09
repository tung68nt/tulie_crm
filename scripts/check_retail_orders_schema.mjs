
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
    // Try to get one row to see columns
    const { data: cols, error: err } = await supabase.from('retail_orders').select().limit(1);

    if (err) {
        console.error('Error fetching columns:', err);
        return;
    }

    if (cols && cols.length > 0) {
        console.log('Columns (from row):', Object.keys(cols[0]));
    } else {
        // Table might be empty, try to get from rpc if you have it or just columns
        console.log('Table is empty, trying another way...');
        // In some cases we can just check if we can insert a dummy object to see errors
    }
}

checkSchema();
