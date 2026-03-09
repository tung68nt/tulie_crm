import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  try {
    await client.connect();
    console.log("Checking products table...");
    
    // Add cost_price to products
    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;`);
    console.log("Added cost_price to products");
    
    // Add missing columns to retail_orders as requested previously (fixing the reported syntax error issue)
    await client.query(`
      ALTER TABLE public.retail_orders 
      ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS resource_link text,
      ADD COLUMN IF NOT EXISTS demo_link text,
      ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0;
    `);
    console.log("Updated retail_orders columns");

    // Add updated_at if missing
    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();`);
    
  } catch (err) {
    console.error("PG ERROR:", err);
  } finally {
    await client.end();
  }
}
run();
