import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables!")
    process.exit(1)
}

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
    process.stdout.write("Checking products table...\n");
    const { data, error } = await supa.from('products').select('*').limit(1);
    if (error) {
        process.stdout.write("Error: " + error.message + "\n");
    } else if (data && data.length > 0) {
        process.stdout.write("Columns: " + Object.keys(data[0]).join(', ') + "\n");
    } else {
        process.stdout.write("Table is empty.\n");
    }
}
run().catch(err => {
    process.stdout.write("Fatal error: " + err.message + "\n");
});
