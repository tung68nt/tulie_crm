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
    console.log("🚀 STARTING MOCK DATA GENERATION WITH LOGGING...");

    const now = new Date();
    const publicToken = `mock-portal-${uuidv4().substring(0, 8)}`;

    // Helper to log errors
    const checkError = (error: any, step: string) => {
        if (error) {
            console.error(`❌ ERROR at [${step}]:`, JSON.stringify(error, null, 2));
            return true;
        }
        return false;
    };

    // 1. Create Customer
    const customerId = uuidv4();
    const { error: customerError } = await supabase.from('customers').insert({
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
    if (checkError(customerError, "Create Customer")) return;
    console.log("✅ Customer created:", customerId);

    // 2. Create Project
    const projectId = uuidv4();
    const { error: projectError } = await supabase.from('projects').insert({
        id: projectId,
        customer_id: customerId,
        title: "Chuyển đổi số & Tăng trưởng Marketing 2025 (FULL)",
        description: "Dự án hợp tác chiến lược giữa TULIE và GREENTECH nhằm xây dựng nền tảng công nghệ lõi và triển khai các chiến dịch Marketing đa kênh bền vững.",
        status: "in_progress",
        metadata: {
            source_link: "https://greentech.tulie.vn",
            hosting_info: "IP: 103.111.x.x, User: admin_gt",
            domain_info: "greentech.vn (Expiry: Jan 12, 2026)",
            ai_folder_link: "https://drive.google.com/drive/folders/gt_assets"
        },
        start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (checkError(projectError, "Create Project")) return;
    console.log("✅ Project created:", projectId);

    const uniqueId = uuidv4().substring(0, 4);

    // 3. Create Quotation (The gateway to portal)
    const quotationId = uuidv4();
    const { error: quotationError } = await supabase.from('quotations').insert({
        id: quotationId,
        project_id: projectId,
        customer_id: customerId,
        quotation_number: `Q-2025-GT-${uniqueId}`,
        title: "Giải pháp Tổng thể Marketing & CRM",
        status: "accepted",
        total_amount: 580000000,
        accepted_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        public_token: publicToken,
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (checkError(quotationError, "Create Quotation")) return;
    console.log("✅ Quotation created:", quotationId, "(Token: " + publicToken + ")");

    // 4. Create Work Items
    const wi1 = uuidv4();
    const wi2 = uuidv4();
    const wi3 = uuidv4();

    const { error: itemsError } = await supabase.from('project_work_items').insert([
        {
            id: wi1,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 1: Hệ thống CRM & Tự động hóa",
            description: "Xây dựng luồng xử lý data khách hàng tự động từ Website/Ads về CRM.",
            status: "in_progress",
            sort_order: 1,
            delivery_links: [{ label: "CRM Blueprint (Draft)", url: "https://docs.google.com/document/d/1", date: new Date().toISOString() }],
            required_documents: [
                { title: "Báo giá", status: "signed", date: new Date().toISOString() },
                { title: "Hợp đồng", status: "signed", date: new Date().toISOString() },
                { title: "Kế hoạch chi tiết", status: "pending", date: null }
            ]
        },
        {
            id: wi2,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 2: Website & Landing Page Campaign",
            description: "Thiết kế & Lập trình 01 Website chính và 03 Landing Page chiến dịch.",
            status: "delivered",
            sort_order: 2,
            delivery_links: [{ label: "Website Demo", url: "https://greentech-demo.tulie.vn", date: new Date().toISOString() }],
            required_documents: [
                { title: "Biên bản bàn giao", status: "signed", date: new Date().toISOString() },
                { title: "Nghiệm thu thanh toán", status: "pending", date: null }
            ]
        },
        {
            id: wi3,
            project_id: projectId,
            quotation_id: quotationId,
            title: "Module 3: IMC Plan & Advertising",
            description: "Kế hoạch truyền thông tích hợp & Chạy quảng cáo đa nền tảng.",
            status: "pending",
            sort_order: 3,
            required_documents: [
                { title: "Kịch bản quay phim", status: "pending", date: null }
            ]
        }
    ]);
    if (checkError(itemsError, "Create Work Items")) return;
    console.log("✅ Work Items created");

    // 5. Create Tasks
    const { error: tasksError } = await supabase.from('project_tasks').insert([
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Khảo sát & Phân tích quy trình", status: "completed", priority: "high" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Thiết kế cơ sở dữ liệu CRM", status: "completed", priority: "high" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi1, title: "Cấu hình Pipelines & Stages", status: "in_progress", priority: "medium" },

        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Lên Visual Style & UI Kit", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Thiết kế Trang chủ & Landing Page", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi2, title: "Lập trình React/Next.js", status: "completed", priority: "high" },

        { id: uuidv4(), project_id: projectId, work_item_id: wi3, title: "Audit hệ thống quảng cáo hiện tại", status: "completed", priority: "medium" },
        { id: uuidv4(), project_id: projectId, work_item_id: wi3, title: "Setup Tracking (GTM/Pixel)", status: "todo", priority: "high" }
    ]);
    if (checkError(tasksError, "Create Tasks")) return;
    console.log("✅ Tasks created");

    // 6. Create Contract
    const contractId = uuidv4();
    const { error: contractError } = await supabase.from('contracts').insert({
        id: contractId,
        project_id: projectId,
        quotation_id: quotationId,
        customer_id: customerId,
        contract_number: `C-2025-GT-${uniqueId}`,
        title: "Hợp đồng Cung cấp giải pháp Marketing & Công nghệ",
        status: "active",
        total_amount: 580000000,
        created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (checkError(contractError, "Create Contract")) return;
    console.log("✅ Contract created:", contractId);

    // 7. Create Milestones
    const { error: milestonesError } = await supabase.from('contract_milestones').insert([
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
    if (checkError(milestonesError, "Create Milestones")) return;
    console.log("✅ Milestones created");

    // 8. Create Invoice
    const invoiceId = uuidv4();
    const { error: invoiceError } = await supabase.from('invoices').insert({
        id: invoiceId,
        contract_id: contractId,
        quotation_id: quotationId,
        customer_id: customerId,
        invoice_number: `INV-GT-${uniqueId}`,
        total_amount: 174000000,
        status: "paid",
        issue_date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (checkError(invoiceError, "Create Invoice")) return;
    console.log("✅ Invoice created:", invoiceId);

    console.log("\n✨ MOCK DATA GENERATION COMPLETE ✨");
    console.log("Project Dash: http://localhost:3000/projects/" + projectId);
    console.log("Portal Dash: http://localhost:3000/portal/" + publicToken);
}

run().catch(console.error);
