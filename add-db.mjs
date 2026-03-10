import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const connPath = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!connPath) {
    console.error("No DATABASE_URL found")
    process.exit(1)
}

const client = new Client({ connectionString: connPath })

async function run() {
    await client.connect()
    try {
        await client.query('ALTER TABLE public.products ADD COLUMN IF NOT EXISTS default_templates uuid[] DEFAULT ARRAY[]::uuid[];')
        console.log('Successfully added default_templates column via pg')
    } catch (e) {
        console.error(e)
    } finally {
        await client.end()
    }
}
run()
