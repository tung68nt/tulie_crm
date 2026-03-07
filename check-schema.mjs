import { createClient } from './lib/supabase/server.ts'

async function checkSchema() {
    const supabase = await createClient()

    console.log('--- PROJECTS colums ---')
    const { data: projects, error: pError } = await supabase.from('projects').select('*').limit(1)
    if (projects && projects.length > 0) console.log(Object.keys(projects[0]))
    else console.log('No project found or error:', pError)

    console.log('\n--- CONTRACTS columns ---')
    const { data: contracts, error: cError } = await supabase.from('contracts').select('*').limit(1)
    if (contracts && contracts.length > 0) console.log(Object.keys(contracts[0]))
    else console.log('No contract found or error:', cError)

    console.log('\n--- QUOTATIONS columns ---')
    const { data: quotations, error: qError } = await supabase.from('quotations').select('*').limit(1)
    if (quotations && quotations.length > 0) console.log(Object.keys(quotations[0]))
    else console.log('No quotation found or error:', qError)
}

checkSchema()
