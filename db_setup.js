const { Client } = require('pg');

const run = async () => {
    const client = new Client({
        connectionString: 'postgresql://postgres:ItCls97spLSVJZU6@db.zktmaekplppmzqdmglze.supabase.co:5432/postgres'
    });

    try {
        await client.connect();

        // List columns
        const res = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name='contracts'
        `);
        console.log('Contract Columns:', res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
};

run();
