import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const client = new Client({ connectionString: process.env.DIRECT_URL });

    try {
        await client.connect();
        // Add missing option fields to quotation_items
        await client.query(`
      ALTER TABLE public.quotation_items ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT false;
      ALTER TABLE public.quotation_items ADD COLUMN IF NOT EXISTS alternative_group TEXT;
    `);
        console.log("Added Option fields to quotation_items.");
    } catch (err) {
        console.error("PG ERROR:", err);
    } finally {
        await client.end();
    }
}
run();
