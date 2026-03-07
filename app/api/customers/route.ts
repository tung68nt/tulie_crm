import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('id, company_name, address, tax_code, email, phone, representative, position')
            .order('company_name', { ascending: true })
            .limit(200)

        if (error) {
            console.error('Error fetching customers:', error)
            return NextResponse.json([])
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Error:', error)
        return NextResponse.json([])
    }
}
