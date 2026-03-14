import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const adminEmail = 'admin@tulie.agency'
const adminPassword = 'TulieCRM@2026' // Let's use the one we know worked before

async function forceReset() {
    console.log('--- FORCING PASSWORD RESET ---')
    console.log('URL:', supabaseUrl)

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return console.error('List error:', listError)

    const user = users.find(u => u.email === adminEmail)
    if (!user) return console.error('User not found in Auth!')

    console.log('User ID:', user.id)

    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: adminPassword,
        email_confirm: true
    })

    if (error) {
        console.error('Update FAILED:', error.message)
    } else {
        console.log('SUCCESS! Password reset to: TulieCRM@2026')
        console.log('Confirmed At:', data.user.email_confirmed_at)
    }
}

forceReset()
