import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const client = new Client({ connectionString: process.env.DIRECT_URL });

    try {
        await client.connect();

        console.log("Checking columns for 'customers' table...");
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'customers'
    `);

        const columns = res.rows.map(r => r.column_name);
        console.log("Current columns:", columns);

        const neededColumns = [
            { name: 'representative', type: 'TEXT' },
            { name: 'position', type: 'TEXT' },
            { name: 'customer_type', type: 'TEXT', default: "'business'" },
            { name: 'is_info_unlocked', type: 'BOOLEAN', default: 'false' },
            { name: 'last_contact_at', type: 'TIMESTAMP WITH TIME ZONE' },
            { name: 'tags', type: 'TEXT[]' }
        ];

        for (const col of neededColumns) {
            if (!columns.includes(col.name)) {
                console.log(`Adding column: ${col.name} (${col.type})`);
                let sql = `ALTER TABLE public.customers ADD COLUMN ${col.name} ${col.type}`;
                if (col.default !== undefined) {
                    sql += ` DEFAULT ${col.default}`;
                }
                await client.query(sql);
            }
        }

        // Also check brand config table or settings
        console.log("Schema check complete.");

    } catch (err) {
        console.error("PG ERROR:", err);
    } finally {
        await client.end();
    }
}
run();
