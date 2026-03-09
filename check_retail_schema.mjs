import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  try {
    await client.connect();
    console.log("Checking retail_orders table...");
    const resOrders = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'retail_orders';");
    console.log("retail_orders:", resOrders.rows);
    
    console.log("Checking retail_order_items table...");
    const resItems = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'retail_order_items';");
    console.log("retail_order_items:", resItems.rows);
  } catch (err) {
    console.error("PG ERROR:", err);
  } finally {
    await client.end();
  }
}
run();
