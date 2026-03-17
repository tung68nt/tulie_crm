import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'sepay_debug_%')
        .order('updated_at', { ascending: false })
        .limit(5)
        
    console.log('--- SePay Webhook 401 Debug Logs ---')
    if (error) {
        console.error(error)
    } else if (data && data.length > 0) {
        console.log(JSON.stringify(data.map(d => ({
            key: d.key,
            time: d.updated_at,
            headers: d.value
        })), null, 2))
    } else {
        console.log("CHƯA CÓ LOG NÀO! (Có thể Vercel chưa build xong, hoặc bạn chưa bắn lại test Webhook từ SePay Dashboard).")
    }
}

run()
