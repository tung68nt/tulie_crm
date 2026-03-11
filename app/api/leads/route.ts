import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role or anon key for public form submissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { full_name, company_name, phone, email, business_type, message } = body

        if (!full_name || !phone) {
            return NextResponse.json(
                { error: 'Vui lòng điền họ tên và số điện thoại' },
                { status: 400 }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data, error } = await supabase
            .from('leads')
            .insert({
                full_name,
                company_name: company_name || null,
                phone,
                email: email || null,
                business_type: business_type || null,
                message: message || null,
                status: 'new',
                source: 'landing_page',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, status, notes } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const updates: any = { updated_at: new Date().toISOString() }
        if (status) updates.status = status
        if (notes !== undefined) updates.notes = notes

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
