import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDelete() {
    // We will just try to delete an old or arbitrary quotation and see the error
    // Let's first pick a quotation to delete
    const { data: quotes, error: fetchErr } = await supabase
        .from('quotations')
        .select('id, quotation_number')
        .limit(3)
        
    if (fetchErr) {
        console.error('Fetch error:', fetchErr)
        return
    }
    
    if (!quotes || quotes.length === 0) {
        console.log('No quotations found.')
        return
    }
    
    console.log('Found quotations:', quotes)
    const quoteToDeleteId = quotes[0].id
    
    console.log(`Trying to delete quotation ${quoteToDeleteId}`)
    const { error: delErr } = await supabase
        .from('quotations')
        .delete()
        .eq('id', quoteToDeleteId)
        
    if (delErr) {
        console.error('Delete error:', JSON.stringify(delErr, null, 2))
    } else {
        console.log('Delete successful!')
    }
}

testDelete()
