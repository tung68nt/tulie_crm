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
const adminPassword = 'TulieCRM@2026'

async function debugAndFixAdmin() {
    console.log('--- DIAGNOSTIC START ---')

    // 1. Get user details from Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) return console.error('List error:', listError)

    const user = users.find(u => u.email === adminEmail)

    if (!user) {
        console.log('User NOT found. Creating fresh...')
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        })
        if (createError) return console.error('Create error:', createError)
        console.log('Created successfully.')
    } else {
        console.log('User FOUND. Details:', {
            id: user.id,
            email_confirmed: !!user.email_confirmed_at,
            last_sign_in: user.last_sign_in_at,
            banned_until: user.banned_until,
        })

        console.log('Resetting password and forcibly confirming email...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: adminPassword,
            email_confirm: true // This should update email_confirmed_at
        })
        if (updateError) console.error('Update error:', updateError)
        else console.log('Update success.')
    }

    // 2. Sync public profile
    console.log('Syncing public profile...')
    const { data: profile } = await supabase.from('users').select('*').eq('email', adminEmail).single()

    const userId = user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === adminEmail).id

    if (!profile) {
        await supabase.from('users').insert({ id: userId, email: adminEmail, role: 'admin', full_name: 'Admin' })
    } else {
        await supabase.from('users').update({ role: 'admin' }).eq('id', userId)
    }

    console.log('--- DIAGNOSTIC END ---')
}

debugAndFixAdmin()
