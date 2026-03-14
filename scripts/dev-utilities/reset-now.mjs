import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const adminEmail = 'admin@tulie.agency'
const adminPassword = 'TulieAdmin2026!'

async function debugAndFixAdmin() {
    console.log('--- PASSWORD RESET START ---')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === adminEmail)

    if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: adminPassword,
            email_confirm: true
        })
        console.log(updateError ? ('Error: ' + updateError.message) : 'Successfully reset password to: TulieAdmin2026!')
    }
}
debugAndFixAdmin()
