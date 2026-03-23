-- ============================================
-- MIGRATION: Content Posts table
-- Date: 2026-03-23
-- Workflow: Content Creator → Image Gen → Auto Post → FB Ads
-- ============================================

-- Content posts management
CREATE TABLE IF NOT EXISTS workforce.content_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    tone TEXT DEFAULT 'professional', -- professional, casual, fun, promotional
    category TEXT DEFAULT 'general',  -- general, product, education, event, promo
    
    -- Media
    image_url TEXT,
    image_prompt TEXT,               -- Prompt used to generate image
    media_urls TEXT[] DEFAULT '{}',  -- Additional media
    
    -- Status workflow: draft → pending → approved → scheduled → publishing → published → failed
    status TEXT NOT NULL DEFAULT 'draft',
    rejection_reason TEXT,
    
    -- Facebook integration
    fb_post_id TEXT,
    fb_page_id TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Ads boost
    auto_boost BOOLEAN DEFAULT false,
    boost_budget DECIMAL(10,2) DEFAULT 0,
    boost_duration_days INTEGER DEFAULT 3,
    boost_target_audience JSONB DEFAULT '{}',
    campaign_id UUID,
    
    -- Engagement metrics (synced from FB)
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    
    -- Meta
    metadata JSONB DEFAULT '{}',
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON workforce.content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled ON workforce.content_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_content_posts_fb_post ON workforce.content_posts(fb_post_id) WHERE fb_post_id IS NOT NULL;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION workforce.update_content_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_posts_updated ON workforce.content_posts;
CREATE TRIGGER trigger_content_posts_updated
    BEFORE UPDATE ON workforce.content_posts
    FOR EACH ROW
    EXECUTE FUNCTION workforce.update_content_posts_timestamp();

-- Auto-create workspace notification when content is ready for review
CREATE OR REPLACE FUNCTION workforce.on_content_pending_review()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' AND OLD.status = 'draft' THEN
        -- Notify via workspace
        INSERT INTO workspace.notifications (user_id, title, content, type)
        SELECT 
            NEW.created_by,
            '📝 Bài viết chờ duyệt',
            NEW.title || ' — đã sẵn sàng để review.',
            'info'
        WHERE NEW.created_by IS NOT NULL;
    END IF;
    
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_status_change ON workforce.content_posts;
CREATE TRIGGER trigger_content_status_change
    BEFORE UPDATE OF status ON workforce.content_posts
    FOR EACH ROW
    EXECUTE FUNCTION workforce.on_content_pending_review();

-- Content templates for different post types
CREATE TABLE IF NOT EXISTS workforce.content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt_template TEXT NOT NULL,     -- GPT prompt template with {{variables}}
    image_prompt_template TEXT,        -- DALL-E prompt template
    hashtag_suggestions TEXT[],
    tone TEXT DEFAULT 'professional',
    example_output TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed starter templates
INSERT INTO workforce.content_templates (name, category, prompt_template, image_prompt_template, hashtag_suggestions, tone)
VALUES 
    ('Bài chia sẻ kiến thức', 'education', 
     'Viết một bài đăng Facebook (200-300 từ) chia sẻ kiến thức về {{topic}}. Giọng văn chuyên nghiệp nhưng gần gũi. Kết thúc bằng call-to-action. Tiếng Việt.',
     'Professional infographic about {{topic}}, modern minimalist design, blue and white color scheme, clean typography',
     ARRAY['#ChiaSeKienThuc', '#TulieLab', '#Marketing', '#Digital'],
     'professional'),
    ('Bài quảng bá sản phẩm', 'product',
     'Viết caption quảng bá sản phẩm/dịch vụ {{product_name}}. Highlights: {{features}}. Tone: hấp dẫn, FOMO nhẹ. Có CTA rõ ràng. Tiếng Việt. Max 200 từ.',
     'Product photography of {{product_name}}, studio lighting, white background, premium feel, commercial quality',
     ARRAY['#SanPhamMoi', '#UuDai', '#MuaNgay'],
     'promotional'),
    ('Bài behind-the-scenes', 'casual',
     'Viết caption đăng Facebook về hậu trường làm việc tại {{company}}: {{context}}. Tone thân thiện, storytelling. Max 150 từ. Tiếng Việt.',
     'Behind the scenes photo of a creative team working in a modern office, candid style, warm lighting, Vietnamese office setting',
     ARRAY['#HauTruong', '#TeamWork', '#Culture'],
     'casual'),
    ('Bài event/workshop', 'event',
     'Viết bài đăng Facebook mời tham gia event/workshop: {{event_name}}. Ngày: {{date}}. Địa điểm: {{location}}. Highlights: {{highlights}}. Có CTA đăng ký. Tiếng Việt.',
     'Event poster design for {{event_name}}, modern gradient background, bold typography, professional layout',
     ARRAY['#Event', '#Workshop', '#DangKyNgay'],
     'professional');

-- RLS (allow all for workforce users)
ALTER TABLE workforce.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workforce content_posts access" ON workforce.content_posts
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Workforce content_templates access" ON workforce.content_templates
    FOR ALL USING (true) WITH CHECK (true);
