import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing with URL:', supabaseUrl)
console.log('Testing with Anon Key (truncated):', supabaseAnonKey?.substring(0, 15) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const email = 'admin@tulie.agency'
const password = 'TulieAdmin2026!'

async function testSignIn() {
    console.log(`Attempting sign in for ${email}...`)
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error('Sign in FAILED:', error.message, error.code)
    } else {
        console.log('Sign in SUCCESSFUL for user:', data.user.id)
    }
}

testSignIn()
