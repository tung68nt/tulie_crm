import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zktmaekplppmzqdmglze.supabase.co'
const oldAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdG1hZWtwbHBwbXpxZG1nbHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDg1MzEsImV4cCI6MjA4NTU4NDUzMX0.9uoPyLfLd_w9z1h28fAWvtYIf4_Svk9pTr-LDr9wPnE'
const newAnonKey = 'sb_publishable_o11TSuhPlIua6Jw7Uretfw_xNHuFg6K'

const email = 'admin@tulie.agency'
const password = 'TulieAdmin2026!'

async function testKeys() {
    console.log('--- Testing OLD JWT Key ---')
    const supabaseOld = createClient(supabaseUrl, oldAnonKey)
    const { error: errorOld } = await supabaseOld.auth.signInWithPassword({ email, password })
    console.log('Old Key Result:', errorOld ? errorOld.message : 'SUCCESS')

    console.log('\n--- Testing NEW sb_publishable Key ---')
    const supabaseNew = createClient(supabaseUrl, newAnonKey)
    const { error: errorNew } = await supabaseNew.auth.signInWithPassword({ email, password })
    console.log('New Key Result:', errorNew ? errorNew.message : 'SUCCESS')
}

testKeys()
