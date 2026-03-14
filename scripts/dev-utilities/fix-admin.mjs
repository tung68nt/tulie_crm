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

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const adminEmail = 'admin@tulie.agency'
const adminPassword = 'TulieCRM@2026'

async function fixAdmin() {
    console.log(`Checking admin user: ${adminEmail}...`)

    // 1. Check/Create in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    let adminUser = users.find(u => u.email === adminEmail)
    let userId

    if (!adminUser) {
        console.log('Admin user not found in Auth. Creating...')
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        })

        if (createError) {
            console.error('Error creating auth user:', createError)
            return
        }
        userId = newUser.user.id
        console.log(`Created auth user with ID: ${userId}`)
    } else {
        console.log('Admin user exists in Auth. Updating password...')
        userId = adminUser.id
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: adminPassword
        })

        if (updateError) {
            console.error('Error updating auth user:', updateError)
            return
        }
        console.log('Updated password successfully.')
    }

    // 2. Check/Create in public.users
    console.log(`Syncing with public.users table...`)
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking public.users:', profileError)
        return
    }

    if (!profile) {
        console.log('User not found in public.users. Inserting...')
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: adminEmail,
                full_name: 'System Admin',
                role: 'admin',
                is_active: true
            })

        if (insertError) {
            console.error('Error inserting into public.users:', insertError)
        } else {
            console.log('Successfully added to public.users.')
        }
    } else {
        console.log('User exists in public.users. Ensuring role is admin...')
        const { error: updateProfileError } = await supabase
            .from('users')
            .update({ role: 'admin', is_active: true })
            .eq('id', userId)

        if (updateProfileError) {
            console.error('Error updating public.users role:', updateProfileError)
        } else {
            console.log('Successfully updated public.users role.')
        }
    }

    console.log('--- DONE ---')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
}

fixAdmin()
