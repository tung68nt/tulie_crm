import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Generating high-quality mock data for TULIE Portal...");

    const now = new Date();
    const publicToken = `mock-portal-${uuidv4().substring(0, 8)}`;

    // 1. Create Customer
    const customerId = uuidv4();
    await supabase.from('customers').insert({
        id: customerId,
        company_name: "Tập đoàn Công nghệ Xanh (GREENTECH)",
        representative: "Ông Phạm Quang Minh",
        position: "Giám đốc Vận hành",
        email: "minh.pq@greentech.vn",
        phone: "0912 345 678",
        address: "Tòa nhà Greentech, Khu Công nghệ cao Hòa Lạc, Hà Nội",
        tax_code: "0109876543",
        status: "active"
    });
    console.log("- Customer created");

    // 2. Create Project
    const projectId = uuidv4();
    await supabase.from('projects').insert({
        id: projectId,
        customer_id: customerId,
        title: "Chuyển đổi số & Tăng trưởng Marketing 2025",
        description: "Dự án hợp tác chiến lược giữa TULIE và GREENTECH nhằm xây dựng nền tảng công nghệ lõi và triển khai các chiến dịch Marketing đa kênh bền vững.",
        status: "in_progress",
        start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log("- Project created");

    // 3. Create Quotation (The gateway to portal)
    const quotationId = uuidv4();
    await supabase.from('quotations').insert({
        id: quotationId,
        project_id: projectId,
        customer_id: customerId,
        quotation_number: "Q-2025-GT01",
        title: "Giải pháp Tổng thể Marketing & CRM",
        status: "accepted",
        total_amount: 580000000,
        accepted_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        public_token: publicToken,
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log("- Quotation created (Token: " + publicToken + ")");

    // 4. Create Work Items
    const wi1 = uuidv4();
    const wi2 = uuidv4();
    const wi3 = uuidv4();

    await supabase.from('project_work_items').insert([
        {
            id: wi1,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 1: Hệ thống CRM & Tự động hóa",
            description: "Xây dựng luồng xử lý data khách hàng tự động từ Website/Ads về CRM.",
            status: "in_progress",
            sort_order: 1
        },
        {
            id: wi2,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 2: Website & Landing Page Campaign",
            description: "Thiết kế & Lập trình 01 Website chính và 03 Landing Page chiến dịch.",
            status: "completed",
            sort_order: 2
        },
        {
            id: wi3,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 3: IMC Plan & Advertising",
            description: "Kế hoạch truyền thông tích hợp & Chạy quảng cáo đa nền tảng.",
            status: "pending",
            sort_order: 3
        }
    ]);
    console.log("- Work Items created");

    // 5. Create Tasks
    await supabase.from('project_tasks').insert([
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Khảo sát & Phân tích quy trình", status: "completed", priority: "high" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Thiết kế cơ sở dữ liệu CRM", status: "completed", priority: "high" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Cấu hình Pipelines & Stages", status: "in_progress", priority: "medium" },

        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Lên Visual Style & UI Kit", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Thiết kế Trang chủ & Landing Page", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Lập trình React/Next.js", status: "completed", priority: "high" },

        { id: uuidv4(), project_id: projectId, work_item_id: wi3, title: "Audit hệ thống quảng cáo hiện tại", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi3, title: "Setup Tracking (GTM/Pixel)", status: "pending", priority: "high" }
    ]);
    console.log("- Tasks created");

    // 6. Create Contract
    const contractId = uuidv4();
    await supabase.from('contracts').insert({
        id: contractId,
        project_id: projectId,
        quotation_id: quotationId,
        contract_number: "C-2025-GT01",
        title: "Hợp đồng Cung cấp giải pháp Marketing & Công nghệ",
        status: "active",
        total_amount: 580000000,
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log("- Contract created");

    // 7. Create Milestones
    await supabase.from('contract_milestones').insert([
        {
            id: uuidv4(),
            contract_id: contractId,
            project_id: projectId,
            name: "Tạm ứng Đợt 1 (Xác lập hợp đồng)",
            description: "Thanh toán 30% tổng giá trị dự án ngay sau khi ký hợp đồng.",
            type: "payment",
            status: "completed",
            due_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: uuidv4(),
            contract_id: contractId,
            project_id: projectId,
            name: "Bàn giao Website & Landing Page",
            description: "Nghiệm thu phần giao diện và tính năng Website.",
            type: "work",
            status: "completed",
            due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: uuidv4(),
            contract_id: contractId,
            project_id: projectId,
            name: "Thanh toán Đợt 2 (Nghiệm thu Web)",
            description: "Thanh toán 40% sau khi bàn giao module Website.",
            type: "payment",
            status: "upcoming",
            due_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]);
    console.log("- Milestones created");

    // 8. Create Invoice
    const invoiceId = uuidv4();
    await supabase.from('invoices').insert({
        id: invoiceId,
        contract_id: contractId,
        quotation_id: quotationId,
        invoice_number: "INV-GT-001",
        total_amount: 174000000,
        status: "paid",
        issue_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString()
    });
    console.log("- Invoice created");

    console.log("\n✨ MOCK DATA COMPLETE ✨");
    console.log("Portal: http://localhost:3000/portal/" + publicToken);
}

run().catch(console.error);
