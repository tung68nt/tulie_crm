import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
    console.log("Fetching products...")
    const { data, error } = await supa.from('products').select('*')
    console.log("Error:", error)
    console.log("Count:", data?.length)
    if (data?.length === 0) {
        console.log("Seeding products...")
        const res = await supa.from('products').insert([
            { name: 'Gói ảnh thẻ 79k', price: 79000, unit: 'Gói', category: 'Studio', is_active: true },
            { name: 'Gói ảnh thẻ 199k', price: 199000, unit: 'Gói', category: 'Studio', is_active: true },
            { name: 'Gói ảnh thẻ 339k', price: 339000, unit: 'Gói', category: 'Studio', is_active: true },
            { name: 'In ảnh A5', price: 15000, unit: 'Cái', category: 'Printing', is_active: true },
            { name: 'In ảnh A6 ép plastic', price: 10000, unit: 'Cái', category: 'Printing', is_active: true }
        ])
        console.log("Seed result:", res)
    } else {
        console.log("Existing Products:", JSON.stringify(data, null, 2))
    }
}
run()
