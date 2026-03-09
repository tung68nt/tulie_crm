
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    const testOrder = {
        customer_name: "Test User",
        customer_phone: "0123456789",
        total_amount: 199000,
        deposit_amount: 0,
        paid_amount: 0,
        shipping_fee: 0,
        payment_status: "pending",
        order_status: "pending",
        order_date: new Date().toISOString().split('T')[0],
        brand: "studio",
        order_number: "TEST_" + Date.now(),
        stt: 9999
    };

    const { data: insertedOrder, error: orderError } = await supabase
        .from('retail_orders')
        .insert([testOrder])
        .select()
        .single();

    if (orderError) {
        console.error('Order Insert Error Details:', JSON.stringify(orderError, null, 2));
        return;
    }

    console.log('Order inserted successfully:', insertedOrder.id);

    const testItem = {
        order_id: insertedOrder.id,
        product_name: "Test Product",
        quantity: 1,
        unit_price: 199000,
        total_price: 199000,
        sort_order: 0
    };

    const { error: itemError } = await supabase
        .from('retail_order_items')
        .insert([testItem]);

    if (itemError) {
        console.error('Item Insert Error Details:', JSON.stringify(itemError, null, 2));
    } else {
        console.log('Item inserted successfully');
    }

    // Cleanup
    await supabase.from('retail_order_items').delete().eq('order_id', insertedOrder.id);
    await supabase.from('retail_orders').delete().eq('id', insertedOrder.id);
}

testInsert();
