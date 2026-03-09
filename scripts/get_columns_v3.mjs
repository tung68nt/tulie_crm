
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { exec } from 'child_process';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    exec(`psql "${dbUrl}" -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'retail_orders';"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            // Try without quotes if it fails
            exec(`psql ${dbUrl} -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'retail_orders';"`, (err2, stdout2, stderr2) => {
                console.log(`stdout: ${stdout2}`);
            });
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
} else {
    console.log('DATABASE_URL not found');
}
