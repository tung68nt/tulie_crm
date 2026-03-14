import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
    connectionString: process.env.DIRECT_URL,
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to DB.");

        // Add project_id column to contract_milestones
        await client.query(`ALTER TABLE contract_milestones ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE CASCADE;`);
        console.log("Added project_id column to contract_milestones.");

        // Refresh Supabase schema cache (PostgREST)
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log("Triggered schema cache reload.");

    } catch (error) {
        console.error("Error executing query:", error);
    } finally {
        await client.end();
    }
}

main();
