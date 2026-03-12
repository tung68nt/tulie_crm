-- =====================================================
-- DEMO PROJECT SEED DATA
-- Project: "Thiết kế Website & Hệ thống số cho ABC Corp"
-- 3 Hạng mục, mỗi hạng mục có 2 báo giá (Cơ bản & Nâng cao)
-- Mỗi báo giá có 2 phương án (Tiết kiệm & Cao cấp)
-- Đầy đủ to-do list với ngày cho Gantt chart
-- =====================================================

-- Step 0: Get first customer and user for reference
-- Replace these with actual IDs from your database
DO $$
DECLARE
    v_customer_id UUID;
    v_user_id UUID;
    v_brand TEXT := 'tulie';
    -- Project
    v_project_id UUID := gen_random_uuid();
    -- Quotations (3 hạng mục × 2 báo giá = 6)
    v_q1_basic UUID := gen_random_uuid();
    v_q1_advanced UUID := gen_random_uuid();
    v_q2_basic UUID := gen_random_uuid();
    v_q2_advanced UUID := gen_random_uuid();
    v_q3_basic UUID := gen_random_uuid();
    v_q3_advanced UUID := gen_random_uuid();
    -- Work Items
    v_wi1 UUID := gen_random_uuid();
    v_wi2 UUID := gen_random_uuid();
    v_wi3 UUID := gen_random_uuid();
BEGIN
    -- Get first customer and user
    SELECT id INTO v_customer_id FROM customers LIMIT 1;
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_customer_id IS NULL OR v_user_id IS NULL THEN
        RAISE EXCEPTION 'Cần có ít nhất 1 khách hàng và 1 user trong hệ thống';
    END IF;

    -- =====================================================
    -- 1. CREATE PROJECT
    -- =====================================================
    INSERT INTO projects (id, customer_id, title, description, status, start_date, end_date, assigned_to, brand, created_at, updated_at)
    VALUES (
        v_project_id,
        v_customer_id,
        'Thiết kế Website & Hệ thống số cho ABC Corp',
        E'Dự án trọn gói thiết kế website doanh nghiệp, hệ thống email marketing, và landing page quảng cáo.\n\n- Giai đoạn 1: Thiết kế Website chính\n- Giai đoạn 2: Email Marketing Automation\n- Giai đoạn 3: Landing Page & Ads',
        'in_progress',
        '2026-03-15',
        '2026-06-30',
        v_user_id,
        v_brand,
        now(),
        now()
    );

    -- =====================================================
    -- 2. CREATE QUOTATIONS (6 báo giá: 3 cặp cơ bản + nâng cao)
    -- =====================================================

    -- ---- Hạng mục 1: Website Doanh nghiệp ----
    -- Báo giá Cơ bản
    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q1_basic, 'BG-20260312-W01', v_customer_id, v_user_id, 'sent', 'standard',
        'Website Doanh nghiệp - Gói Cơ bản',
        'Thiết kế website doanh nghiệp responsive, chuẩn SEO',
        45000000, 10, 4500000, 49500000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    -- Items cho BG1 Cơ bản (2 phương án: Tiết kiệm & Cao cấp)
    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    -- Section: Thiết kế UI/UX
    (gen_random_uuid(), v_q1_basic, 'Thiết kế giao diện Homepage', 'Thiết kế 1 trang chính responsive', 1, 'trang', 8000000, 8000000, 1, 'Thiết kế UI/UX', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_basic, 'Thiết kế 5 trang phụ', 'Giới thiệu, Dịch vụ, Blog, Liên hệ, FAQ', 5, 'trang', 2000000, 10000000, 2, 'Thiết kế UI/UX', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_basic, 'Thiết kế giao diện Homepage Premium', 'Thiết kế homepage animation, parallax, custom illustration', 1, 'trang', 15000000, 15000000, 3, 'Thiết kế UI/UX', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q1_basic, 'Thiết kế 8 trang phụ Premium', 'Bao gồm trang Portfolio, Case Study, Team, FAQ nâng cao', 8, 'trang', 3000000, 24000000, 4, 'Thiết kế UI/UX', 'PA2/Cao cấp'),
    -- Section: Lập trình & Tích hợp
    (gen_random_uuid(), v_q1_basic, 'Lập trình Frontend cơ bản', 'HTML/CSS responsive, Wordpress theme', 1, 'gói', 12000000, 12000000, 5, 'Lập trình & Tích hợp', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_basic, 'Tích hợp CMS cơ bản', 'Wordpress + plugin quản trị nội dung', 1, 'gói', 5000000, 5000000, 6, 'Lập trình & Tích hợp', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_basic, 'Lập trình Frontend Next.js', 'Next.js + Tailwind, SSR, tối ưu Core Web Vitals', 1, 'gói', 25000000, 25000000, 7, 'Lập trình & Tích hợp', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q1_basic, 'Headless CMS + API', 'Strapi/Sanity CMS, REST API, CDN', 1, 'gói', 10000000, 10000000, 8, 'Lập trình & Tích hợp', 'PA2/Cao cấp'),
    -- Section: SEO & Tối ưu
    (gen_random_uuid(), v_q1_basic, 'SEO On-page cơ bản', 'Meta tags, sitemap, robots.txt', 1, 'gói', 5000000, 5000000, 9, 'SEO & Tối ưu', NULL),
    (gen_random_uuid(), v_q1_basic, 'Tối ưu tốc độ', 'Nén ảnh, lazy load, minify CSS/JS', 1, 'gói', 5000000, 5000000, 10, 'SEO & Tối ưu', NULL);

    -- Báo giá Nâng cao
    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q1_advanced, 'BG-20260312-W02', v_customer_id, v_user_id, 'draft', 'standard',
        'Website Doanh nghiệp - Gói Nâng cao',
        'Website doanh nghiệp cao cấp kèm blog, portfolio, đa ngôn ngữ',
        95000000, 10, 9500000, 104500000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    (gen_random_uuid(), v_q1_advanced, 'Thiết kế UI/UX toàn bộ', 'Wireframe + Mockup + Prototype Figma', 1, 'gói', 20000000, 20000000, 1, 'Thiết kế', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_advanced, 'Thiết kế UI/UX + Motion Design', 'Bao gồm animation, micro-interaction, video intro', 1, 'gói', 35000000, 35000000, 2, 'Thiết kế', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q1_advanced, 'Lập trình Full-stack', 'Next.js + Supabase, authentication, dashboard', 1, 'gói', 40000000, 40000000, 3, 'Lập trình', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q1_advanced, 'Lập trình Full-stack + AI', 'Gồm chatbot AI, search thông minh, analytics', 1, 'gói', 65000000, 65000000, 4, 'Lập trình', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q1_advanced, 'Đa ngôn ngữ (i18n)', 'Hỗ trợ Tiếng Việt, English, 日本語', 1, 'gói', 8000000, 8000000, 5, 'Mở rộng', NULL),
    (gen_random_uuid(), v_q1_advanced, 'SEO nâng cao + Content', 'Nghiên cứu keyword, tối ưu content, schema markup', 1, 'gói', 12000000, 12000000, 6, 'Mở rộng', NULL);

    -- ---- Hạng mục 2: Email Marketing ----
    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q2_basic, 'BG-20260312-E01', v_customer_id, v_user_id, 'sent', 'standard',
        'Email Marketing - Gói Cơ bản',
        'Thiết lập hệ thống email marketing tự động',
        25000000, 10, 2500000, 27500000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    (gen_random_uuid(), v_q2_basic, 'Thiết kế 5 Email Template', 'Welcome, Newsletter, Promotion, Cart, Thank you', 5, 'mẫu', 2000000, 10000000, 1, 'Email Template', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q2_basic, 'Thiết kế 10 Email Template Premium', 'Full bộ lifecycle email + seasonal campaign', 10, 'mẫu', 3000000, 30000000, 2, 'Email Template', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q2_basic, 'Cấu hình Mailchimp', 'Thiết lập list, segment, automation cơ bản', 1, 'gói', 5000000, 5000000, 3, 'Automation', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q2_basic, 'Cấu hình HubSpot + Workflow', 'CRM integration, lead scoring, A/B testing', 1, 'gói', 15000000, 15000000, 4, 'Automation', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q2_basic, 'Báo cáo & Analytics', 'Dashboard theo dõi open rate, click, conversion', 1, 'gói', 5000000, 5000000, 5, 'Báo cáo', NULL);

    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q2_advanced, 'BG-20260312-E02', v_customer_id, v_user_id, 'draft', 'standard',
        'Email Marketing - Gói Nâng cao',
        'Email marketing đầy đủ kèm CRM và personalization',
        55000000, 10, 5500000, 60500000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    (gen_random_uuid(), v_q2_advanced, 'Email Design System', 'Bộ component email tái sử dụng', 1, 'gói', 15000000, 15000000, 1, 'Design', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q2_advanced, 'Email Design System + AI Content', 'Auto-generated content dựa trên user behavior', 1, 'gói', 25000000, 25000000, 2, 'Design', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q2_advanced, 'Marketing Automation Flow', '10 automated workflows + triggers', 1, 'gói', 20000000, 20000000, 3, 'Automation', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q2_advanced, 'Advanced Automation + CDP', 'Customer Data Platform, prediction, retargeting', 1, 'gói', 35000000, 35000000, 4, 'Automation', 'PA2/Cao cấp');

    -- ---- Hạng mục 3: Landing Page & Quảng cáo ----
    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q3_basic, 'BG-20260312-L01', v_customer_id, v_user_id, 'accepted', 'standard',
        'Landing Page & Ads - Gói Cơ bản',
        'Thiết kế landing page và setup quảng cáo Google/Facebook',
        30000000, 10, 3000000, 33000000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    (gen_random_uuid(), v_q3_basic, 'Thiết kế 2 Landing Page', 'Responsive, A/B testing ready', 2, 'trang', 5000000, 10000000, 1, 'Landing Page', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q3_basic, 'Thiết kế 5 Landing Page + Video', 'Premium design, video background, 3D elements', 5, 'trang', 8000000, 40000000, 2, 'Landing Page', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q3_basic, 'Setup Google Ads', 'Search + Display campaign, conversion tracking', 1, 'gói', 8000000, 8000000, 3, 'Quảng cáo', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q3_basic, 'Setup Google + Meta Ads Full', 'Search, Display, Performance Max, Facebook, Instagram', 1, 'gói', 15000000, 15000000, 4, 'Quảng cáo', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q3_basic, 'Pixel & Tracking Setup', 'Google Tag Manager, Facebook Pixel, GA4', 1, 'gói', 5000000, 5000000, 5, 'Tracking', NULL),
    (gen_random_uuid(), v_q3_basic, 'Content copywriting', 'Viết nội dung cho landing page', 1, 'gói', 7000000, 7000000, 6, 'Nội dung', NULL);

    INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)
    VALUES (v_q3_advanced, 'BG-20260312-L02', v_customer_id, v_user_id, 'draft', 'standard',
        'Landing Page & Ads - Gói Nâng cao',
        'Full landing page ecosystem với conversion optimization',
        70000000, 10, 7000000, 77000000,
        '2026-04-15', encode(gen_random_bytes(16), 'hex'), v_brand, v_project_id, now(), now());

    INSERT INTO quotation_items (id, quotation_id, product_name, description, quantity, unit, unit_price, total_price, sort_order, section_name, alternative_group) VALUES
    (gen_random_uuid(), v_q3_advanced, 'Landing Page Funnel (3 bước)', 'Awareness → Consideration → Conversion', 3, 'trang', 10000000, 30000000, 1, 'Funnel', 'PA1/Tiết kiệm'),
    (gen_random_uuid(), v_q3_advanced, 'Landing Page Funnel + Chatbot', 'Full funnel + AI chatbot qualification', 3, 'trang', 15000000, 45000000, 2, 'Funnel', 'PA2/Cao cấp'),
    (gen_random_uuid(), v_q3_advanced, 'CRO & Heatmap', 'Hotjar, heatmap analysis, CTA optimization', 1, 'gói', 10000000, 10000000, 3, 'Tối ưu', NULL),
    (gen_random_uuid(), v_q3_advanced, 'Retargeting Campaign', 'Facebook retargeting, Google remarketing', 1, 'gói', 15000000, 15000000, 4, 'Quảng cáo nâng cao', NULL);

    -- =====================================================
    -- 3. CREATE WORK ITEMS (3 Hạng mục)
    -- =====================================================
    INSERT INTO project_work_items (id, project_id, title, description, status, quotation_id, sort_order, metadata, created_at, updated_at)
    VALUES
    (v_wi1, v_project_id, 'Website Doanh nghiệp', 'Thiết kế và phát triển website chính thức cho ABC Corp', 'in_progress', v_q1_basic, 0,
     jsonb_build_object('quotation_ids', jsonb_build_array(v_q1_basic::text, v_q1_advanced::text)),
     now(), now()),
    (v_wi2, v_project_id, 'Email Marketing Automation', 'Xây dựng hệ thống email marketing tự động hóa', 'pending', v_q2_basic, 1,
     jsonb_build_object('quotation_ids', jsonb_build_array(v_q2_basic::text, v_q2_advanced::text)),
     now(), now()),
    (v_wi3, v_project_id, 'Landing Page & Quảng cáo', 'Thiết kế landing page và triển khai chiến dịch ads', 'pending', v_q3_basic, 2,
     jsonb_build_object('quotation_ids', jsonb_build_array(v_q3_basic::text, v_q3_advanced::text)),
     now(), now());

    -- =====================================================
    -- 4. CREATE TASKS (for Gantt chart)
    -- =====================================================

    -- ==== Hạng mục 1: Website (15/3 - 30/4) ====
    INSERT INTO project_tasks (id, project_id, work_item_id, title, status, priority, start_date, end_date) VALUES
    -- Phase 1: Research & Planning
    (gen_random_uuid(), v_project_id, v_wi1, 'Khảo sát yêu cầu khách hàng', 'completed', 'high', '2026-03-15', '2026-03-17'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Phân tích đối thủ & benchmark', 'completed', 'medium', '2026-03-17', '2026-03-19'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Lập sitemap & IA (Information Architecture)', 'completed', 'high', '2026-03-19', '2026-03-21'),
    -- Phase 2: Design
    (gen_random_uuid(), v_project_id, v_wi1, 'Wireframe toàn bộ trang', 'in_progress', 'high', '2026-03-21', '2026-03-28'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Thiết kế UI Homepage', 'in_progress', 'high', '2026-03-28', '2026-04-02'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Thiết kế UI các trang phụ', 'todo', 'medium', '2026-04-02', '2026-04-08'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Review & chỉnh sửa design (2 vòng)', 'todo', 'medium', '2026-04-08', '2026-04-11'),
    -- Phase 3: Development
    (gen_random_uuid(), v_project_id, v_wi1, 'Setup project & cấu hình hosting', 'todo', 'high', '2026-04-11', '2026-04-12'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Lập trình Frontend Homepage', 'todo', 'high', '2026-04-12', '2026-04-17'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Lập trình Frontend các trang phụ', 'todo', 'medium', '2026-04-17', '2026-04-22'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Tích hợp CMS & Backend', 'todo', 'high', '2026-04-22', '2026-04-25'),
    -- Phase 4: Testing & Launch
    (gen_random_uuid(), v_project_id, v_wi1, 'UAT - Kiểm thử chức năng', 'todo', 'high', '2026-04-25', '2026-04-27'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Tối ưu SEO & Performance', 'todo', 'medium', '2026-04-27', '2026-04-29'),
    (gen_random_uuid(), v_project_id, v_wi1, 'Go-live & monitoring', 'todo', 'high', '2026-04-29', '2026-04-30'),

    -- ==== Hạng mục 2: Email Marketing (1/5 - 31/5) ====
    (gen_random_uuid(), v_project_id, v_wi2, 'Phân tích customer journey', 'todo', 'high', '2026-05-01', '2026-05-03'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Thiết kế Email Design System', 'todo', 'high', '2026-05-03', '2026-05-08'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Code Email Template (5 mẫu)', 'todo', 'high', '2026-05-08', '2026-05-14'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Thiết lập Mailchimp/HubSpot', 'todo', 'medium', '2026-05-14', '2026-05-17'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Cấu hình automation workflow', 'todo', 'high', '2026-05-17', '2026-05-22'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Import danh sách & segmentation', 'todo', 'medium', '2026-05-22', '2026-05-24'),
    (gen_random_uuid(), v_project_id, v_wi2, 'A/B Testing & tối ưu', 'todo', 'medium', '2026-05-24', '2026-05-27'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Setup dashboard báo cáo', 'todo', 'low', '2026-05-27', '2026-05-29'),
    (gen_random_uuid(), v_project_id, v_wi2, 'Training & bàn giao', 'todo', 'high', '2026-05-29', '2026-05-31'),

    -- ==== Hạng mục 3: Landing Page & Ads (1/6 - 30/6) ====
    (gen_random_uuid(), v_project_id, v_wi3, 'Nghiên cứu keyword & audience', 'todo', 'high', '2026-06-01', '2026-06-03'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Viết copywriting landing page', 'todo', 'high', '2026-06-03', '2026-06-06'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Thiết kế Landing Page #1', 'todo', 'high', '2026-06-06', '2026-06-10'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Thiết kế Landing Page #2', 'todo', 'medium', '2026-06-10', '2026-06-13'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Lập trình & deploy landing pages', 'todo', 'high', '2026-06-13', '2026-06-17'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Setup Google Tag Manager & Pixel', 'todo', 'high', '2026-06-17', '2026-06-19'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Tạo Google Ads Campaign', 'todo', 'high', '2026-06-19', '2026-06-22'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Tạo Facebook/Instagram Ads', 'todo', 'medium', '2026-06-22', '2026-06-25'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Monitoring & tối ưu CPA', 'todo', 'high', '2026-06-25', '2026-06-28'),
    (gen_random_uuid(), v_project_id, v_wi3, 'Báo cáo kết quả & handover', 'todo', 'medium', '2026-06-28', '2026-06-30');

    -- =====================================================
    -- 5. CREATE MILESTONES (for Portal Timeline)
    -- =====================================================
    UPDATE projects SET milestones = jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Kick-off & Khảo sát', 'description', 'Họp kick-off, thu thập yêu cầu', 'due_date', '2026-03-17', 'status', 'completed', 'type', 'work', 'amount', 0),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Thanh toán đợt 1 (30%)', 'description', 'Tạm ứng triển khai', 'due_date', '2026-03-20', 'status', 'completed', 'type', 'payment', 'amount', 30000000),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Bàn giao thiết kế Website', 'description', 'Figma file + asset xuất', 'due_date', '2026-04-11', 'status', 'pending', 'type', 'delivery', 'amount', 0),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Go-live Website', 'description', 'Deploy production', 'due_date', '2026-04-30', 'status', 'pending', 'type', 'delivery', 'amount', 0),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Thanh toán đợt 2 (40%)', 'description', 'Sau khi go-live website', 'due_date', '2026-05-05', 'status', 'pending', 'type', 'payment', 'amount', 40000000),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Bàn giao Email Marketing', 'description', 'Templates + automation setup', 'due_date', '2026-05-31', 'status', 'pending', 'type', 'delivery', 'amount', 0),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Bàn giao Landing Page & Ads', 'description', 'Landing pages + campaign setup', 'due_date', '2026-06-30', 'status', 'pending', 'type', 'delivery', 'amount', 0),
        jsonb_build_object('id', gen_random_uuid(), 'name', 'Thanh toán đợt cuối (30%)', 'description', 'Nghiệm thu & thanh lý', 'due_date', '2026-06-30', 'status', 'pending', 'type', 'payment', 'amount', 30000000)
    )
    WHERE id = v_project_id;

    RAISE NOTICE '✅ Demo project created successfully!';
    RAISE NOTICE 'Project ID: %', v_project_id;
    RAISE NOTICE '📊 6 báo giá (3 cơ bản + 3 nâng cao)';
    RAISE NOTICE '📦 3 hạng mục với tổng 32 to-do tasks';
    RAISE NOTICE '📅 8 milestones (timeline)';

END $$;
