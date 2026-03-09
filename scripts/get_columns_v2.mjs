
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function checkCols() {
    const { data, error } = await supabase.rpc('get_table_columns_v2', { t_name: 'retail_orders' });
    if (error) {
        // Direct query to information_schema
        const { data: cols, error: err } = await supabase.from('information_schema_columns' as any).select('column_name, data_type, is_nullable').eq('table_name', 'retail_orders');
        // Actually information_schema might not be accessible via from() unless enabled.
        // Let's try to just select * from retail_orders and see errors or just list columns if possible.
        console.error('Error fetching columns:', error);

        // Try to get columns by seeing what fields are returned in a search if any existed
        // Since it's empty, let's try to insert a garbage row and see what it complains about.
    } else {
        console.log('Columns info:', data);
    }
}

// Another way: use postgres to list columns
import { exec } from 'child_process';
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    exec(`psql "${dbUrl}" -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'retail_orders';"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
} else {
    console.log('DATABASE_URL not found');
}
