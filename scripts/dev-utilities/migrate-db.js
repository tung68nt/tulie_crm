const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const connectionString = "postgresql://postgres:ItCls97spLSVJZU6@db.zktmaekplppmzqdmglze.supabase.co:5432/postgres";
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('Connected to database');

        const scripts = [
            '20260303_setup_system_settings.sql',
            '20260303_add_retail_orders.sql',
            '20260303_add_source_to_retail_orders.sql',
            '20260303_unify_brands.sql',
            '20260303_add_quotation_type.sql'
        ];

        for (const script of scripts) {
            const sqlPath = path.join(__dirname, 'scripts', script);
            const sql = fs.readFileSync(sqlPath, 'utf8');
            console.log('Running migration:', script);
            await client.query(sql);
            console.log('Success:', script);
        }

        console.log('All migrations completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
