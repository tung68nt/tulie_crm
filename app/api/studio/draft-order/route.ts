import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { customerName, customerPhone } = await req.json()

        if (!customerName || !customerPhone) {
            return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
        }

        // Use admin client to bypass RLS
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        // Check if there's already a recent draft for this phone (within 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: existingDraft } = await supabase
            .from('retail_orders')
            .select('id, public_token')
            .eq('customer_phone', customerPhone)
            .eq('order_status', 'draft')
            .gte('created_at', twentyFourHoursAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (existingDraft) {
            // Update existing draft with new name
            await supabase
                .from('retail_orders')
                .update({ customer_name: customerName })
                .eq('id', existingDraft.id)

            return NextResponse.json({ draftId: existingDraft.id, token: existingDraft.public_token })
        }

        // Generate draft order number
        const date = new Date()
        const yy = date.getFullYear().toString().slice(-2)
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')

        const { data: maxSttData } = await supabase
            .from('retail_orders')
            .select('stt')
            .order('stt', { ascending: false })
            .limit(1)
            .maybeSingle()

        const nextStt = maxSttData?.stt ? maxSttData.stt + 1 : 810
        const publicToken = crypto.randomUUID()

        const { data: draft, error } = await supabase
            .from('retail_orders')
            .insert([{
                order_number: `DH_${yy}_${mm}${dd}_${nextStt}_0`,
                stt: nextStt,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: '',
                total_amount: 0,
                paid_amount: 0,
                payment_status: 'pending',
                order_status: 'draft',
                source_system: 'website',
                brand: 'studio',
                public_token: publicToken,
                notes: 'Đơn nháp — khách đang điền form',
                created_by: null,
            }])
            .select('id, public_token')
            .single()

        if (error) throw error

        return NextResponse.json({ draftId: draft.id, token: draft.public_token })
    } catch (err: any) {
        console.error('Draft order error:', err)
        return NextResponse.json({ error: err.message || 'Có lỗi xảy ra' }, { status: 500 })
    }
}
