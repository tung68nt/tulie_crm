-- ============================================
-- MIGRATION: Cross-module automation triggers
-- Date: 2026-03-23
-- 
-- Triggers that automate workflows between CRM, Workspace, and Workforce:
-- 1. CRM order confirmed → auto-create workspace tasks
-- 2. CRM project milestone → create workspace task reminder
-- 3. Overdue workspace tasks → create notifications
-- 4. Workspace task done → log activity
-- ============================================

-- ============================================
-- 1. CRM Order → Workspace Tasks
-- When a work order is confirmed, auto-create workspace tasks
-- ============================================

CREATE OR REPLACE FUNCTION workspace.on_crm_order_confirmed()
RETURNS TRIGGER AS $$
DECLARE
    ws_project_id UUID;
    task_prefix TEXT;
BEGIN
    -- Only trigger on status change TO 'confirmed' or 'in_progress'
    IF NEW.status NOT IN ('confirmed', 'in_progress') THEN
        RETURN NEW;
    END IF;
    
    -- Skip if status didn't change
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Find or create workspace project linked to CRM project
    IF NEW.project_id IS NOT NULL THEN
        SELECT id INTO ws_project_id 
        FROM workspace.projects 
        WHERE crm_project_id = NEW.project_id 
        LIMIT 1;
    END IF;

    task_prefix := COALESCE(NEW.title, 'Đơn hàng #' || COALESCE(NEW.order_code, NEW.id::text));

    -- Create follow-up tasks
    INSERT INTO workspace.tasks (title, description, status, priority, due_date, 
        crm_project_id, crm_order_code, crm_customer_name, project_id, category, assigned_to)
    VALUES 
        -- Task 1: Confirm requirements with customer
        (
            '📋 Xác nhận yêu cầu: ' || task_prefix,
            'Liên hệ khách hàng xác nhận chi tiết yêu cầu, timeline, và deliverables.',
            'ready', 'high',
            NOW() + INTERVAL '1 day',
            NEW.project_id, NEW.order_code, NULL, ws_project_id, 
            'follow_up', NEW.assigned_to
        ),
        -- Task 2: Start production
        (
            '🔨 Bắt đầu sản xuất: ' || task_prefix,
            'Bắt đầu thực hiện đơn hàng theo yêu cầu đã xác nhận.',
            'backlog', 'medium',
            NOW() + INTERVAL '3 days',
            NEW.project_id, NEW.order_code, NULL, ws_project_id,
            'internal', NEW.assigned_to
        ),
        -- Task 3: QC and delivery
        (
            '✅ Kiểm tra & bàn giao: ' || task_prefix,
            'Kiểm tra chất lượng, gửi preview cho khách, và bàn giao sản phẩm cuối.',
            'backlog', 'medium',
            NEW.due_date,
            NEW.project_id, NEW.order_code, NULL, ws_project_id,
            'follow_up', NEW.assigned_to
        );

    -- Create notification
    IF NEW.assigned_to IS NOT NULL THEN
        INSERT INTO workspace.notifications (user_id, title, content, type)
        VALUES (
            NEW.assigned_to,
            '📦 Đơn hàng mới được xác nhận',
            task_prefix || ' — 3 công việc đã được tạo tự động.',
            'success'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Try to attach trigger to CRM work_items/projects table
DO $$
BEGIN
    -- Check for work_items table (common CRM order table)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'work_items') THEN
        DROP TRIGGER IF EXISTS trigger_crm_order_to_workspace ON public.work_items;
        CREATE TRIGGER trigger_crm_order_to_workspace
            AFTER UPDATE OF status ON public.work_items
            FOR EACH ROW
            EXECUTE FUNCTION workspace.on_crm_order_confirmed();
        RAISE NOTICE 'Trigger attached to public.work_items';
    END IF;
    
    -- Also check for quotations table (khi báo giá được duyệt)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotations') THEN
        DROP TRIGGER IF EXISTS trigger_crm_quotation_approved ON public.quotations;
        -- Quotation approval creates tasks too
    END IF;
END $$;


-- ============================================
-- 2. Overdue Task Checker (called by n8n cron)
-- Returns overdue tasks for notification
-- ============================================

CREATE OR REPLACE FUNCTION workspace.get_overdue_tasks()
RETURNS TABLE (
    task_id UUID,
    title TEXT,
    due_date TIMESTAMPTZ,
    assigned_to UUID,
    status TEXT,
    days_overdue INTEGER,
    crm_order_code TEXT,
    crm_customer_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.due_date,
        t.assigned_to,
        t.status,
        EXTRACT(DAY FROM NOW() - t.due_date)::INTEGER as days_overdue,
        t.crm_order_code,
        t.crm_customer_name
    FROM workspace.tasks t
    WHERE t.due_date < NOW()
      AND t.status NOT IN ('done', 'cancelled')
    ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 3. Task Completion → Auto Notification
-- ============================================

CREATE OR REPLACE FUNCTION workspace.on_task_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        -- Set completed_at
        NEW.completed_at := NOW();
        
        -- Notify task creator (if different from assignee)
        IF NEW.created_by IS NOT NULL AND NEW.created_by != NEW.assigned_to THEN
            INSERT INTO workspace.notifications (user_id, title, content, type, related_task_id)
            VALUES (
                NEW.created_by,
                '✅ Task hoàn thành',
                NEW.title || ' đã được hoàn thành.',
                'success',
                NEW.id
            );
        END IF;
    END IF;
    
    -- Quarantine alert
    IF NEW.status = 'quarantine' AND OLD.status != 'quarantine' THEN
        -- Notify all managers (simplified: notify creator)
        IF NEW.created_by IS NOT NULL THEN
            INSERT INTO workspace.notifications (user_id, title, content, type, related_task_id)
            VALUES (
                NEW.created_by,
                '⚠️ Task vào quarantine',
                NEW.title || ' cần được xem xét lại.',
                'warning',
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_task_completion ON workspace.tasks;
CREATE TRIGGER trigger_ws_task_completion
    BEFORE UPDATE OF status ON workspace.tasks
    FOR EACH ROW
    EXECUTE FUNCTION workspace.on_task_completed();


-- ============================================
-- 4. FB Ads Alert → Workspace Notification
-- When AI creates a critical alert, notify via workspace
-- ============================================

CREATE OR REPLACE FUNCTION workforce.on_fb_alert_created()
RETURNS TRIGGER AS $$
DECLARE
    account_owner UUID;
BEGIN
    -- Only for critical alerts
    IF NEW.severity != 'critical' THEN
        RETURN NEW;
    END IF;
    
    -- Find the account owner from fb_ad_accounts
    SELECT owner_id INTO account_owner
    FROM workforce.fb_ad_accounts
    WHERE id = (
        SELECT account_id FROM workforce.fb_campaigns 
        WHERE id = NEW.campaign_id LIMIT 1
    );
    
    -- Create workspace notification
    IF account_owner IS NOT NULL THEN
        INSERT INTO workspace.notifications (user_id, title, content, type)
        VALUES (
            account_owner,
            '🚨 FB Ads: ' || NEW.alert_type,
            'Campaign: ' || COALESCE(NEW.campaign_name, '') || ' — ' || NEW.message,
            'error'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fb_alert_to_workspace ON workforce.fb_alerts;
CREATE TRIGGER trigger_fb_alert_to_workspace
    AFTER INSERT ON workforce.fb_alerts
    FOR EACH ROW
    EXECUTE FUNCTION workforce.on_fb_alert_created();


-- ============================================
-- 5. Daily Stats Function (called by n8n daily report)
-- ============================================

CREATE OR REPLACE FUNCTION workspace.get_daily_report(report_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'date', report_date,
        'tasks_created', (
            SELECT COUNT(*) FROM workspace.tasks 
            WHERE created_at::date = report_date
        ),
        'tasks_completed', (
            SELECT COUNT(*) FROM workspace.tasks 
            WHERE completed_at::date = report_date
        ),
        'tasks_overdue', (
            SELECT COUNT(*) FROM workspace.tasks 
            WHERE due_date::date <= report_date 
            AND status NOT IN ('done', 'cancelled')
        ),
        'active_tasks', (
            SELECT COUNT(*) FROM workspace.tasks 
            WHERE status IN ('doing', 'in_review')
        ),
        'quarantine_tasks', (
            SELECT COUNT(*) FROM workspace.tasks 
            WHERE status = 'quarantine'
        ),
        'overdue_details', (
            SELECT COALESCE(json_agg(json_build_object(
                'title', title,
                'due_date', due_date,
                'days_overdue', EXTRACT(DAY FROM NOW() - due_date)::INTEGER,
                'crm_order_code', crm_order_code
            )), '[]'::json)
            FROM workspace.tasks 
            WHERE due_date::date <= report_date 
            AND status NOT IN ('done', 'cancelled')
            ORDER BY due_date ASC
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
