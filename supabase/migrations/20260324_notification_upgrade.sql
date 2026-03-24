-- Migration: Add severity, metadata, source columns to notifications table
-- and create RPC for workspace notification merge 

-- 1. Add new columns to public.notifications
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'error')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'crm' CHECK (source IN ('crm', 'workspace'));

-- 2. RPC to fetch workspace notifications (cross-schema)
CREATE OR REPLACE FUNCTION public.get_workspace_notifications(
    p_user_id UUID,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    content TEXT,
    type TEXT,
    related_task_id UUID,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Check if workspace.notifications table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'workspace' AND table_name = 'notifications'
    ) THEN
        RETURN QUERY
        SELECT n.id, n.user_id, n.title, n.content, n.type::TEXT,
               n.related_task_id, n.is_read, n.created_at
        FROM workspace.notifications n
        WHERE n.user_id = p_user_id
        ORDER BY n.created_at DESC
        LIMIT p_limit;
    END IF;
END;
$$;

-- 3. Index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications (user_id, read, created_at DESC);

-- 4. Comment
COMMENT ON FUNCTION public.get_workspace_notifications IS 'Cross-schema query for workspace notifications, used by CRM notification bell merge';
