

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const { order_id, shipping_info } = await req.json()
        
        if (!order_id) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
        }

        const supabase = await createClient()
        
        const { error } = await supabase
            .from('retail_orders')
            .update({ shipping_info })
            .eq('id', order_id)

        if (error) throw error

        return NextResponse.json({ message: 'Đã lưu thông tin nhận hàng' })
    } catch (err: any) {
        console.error('Error saving shipping info:', err)
        return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 })
    }
}
