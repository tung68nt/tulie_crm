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

async function fixAdminAggressive() {
    console.log(`Starting AGGRESSIVE sync for: ${adminEmail}...`)

    // 1. Find existing user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const existingUser = users.find(u => u.email === adminEmail)

    if (existingUser) {
        console.log(`Found existing user (ID: ${existingUser.id}). DELETING for a fresh start...`)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)
        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            // Continue anyway, maybe create will overwrite or fail with more info
        } else {
            console.log('User deleted successfully.')
        }
    }

    // 2. Create fresh user
    console.log('Creating FRESH admin user...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: 'System Admin' }
    })

    if (createError) {
        console.error('Error creating user:', createError)
        return
    }

    const userId = newUser.user.id
    console.log(`Fresh user created with ID: ${userId}`)

    // 3. Sync public.users
    console.log('Syncing with public.users table...')

    // Try to delete existing profile if any (to avoid foreign key or unique constraint weirdness if ID changed)
    const { error: cleanupProfileError } = await supabase
        .from('users')
        .delete()
        .eq('email', adminEmail)

    if (cleanupProfileError) {
        console.log('Note: No existing profile to cleanup or error during cleanup:', cleanupProfileError.message)
    }

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
        console.error('Error inserting profile:', insertError)
    } else {
        console.log('Successfully created public profile with ADMIN role.')
    }

    console.log('\n--- FINAL VERIFICATION ---')
    console.log(`URL: ${supabaseUrl}`)
    console.log(`Admin Email: ${adminEmail}`)
    console.log(`New Password: ${adminPassword}`)
    console.log(`Status: AUTH & DB SYNCED`)
}

fixAdminAggressive()
