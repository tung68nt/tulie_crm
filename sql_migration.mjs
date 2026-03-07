import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });

  try {
    await client.connect();
    // 1. Add fields and unlocking boolean to customers
    await client.query(`
      ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_info_unlocked BOOLEAN DEFAULT false;
      ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS representative TEXT;
      ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS position TEXT;
    `);
    console.log("Added customer columns");

    // 2. Wipe existing document templates so the app uses our new defaults
    const res = await client.query(`DELETE FROM public.document_templates;`);
    console.log("Purged old document templates, deleted rows: ", res.rowCount);
  } catch (err) {
    console.error("PG ERROR:", err);
  } finally {
    await client.end();
  }
}
run();
