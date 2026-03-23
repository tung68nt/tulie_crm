-- ============================================
-- AI Providers & Models — Multi-Provider Management
-- (No org dependency — uses user_id directly)
-- ============================================

-- 1. AI Providers table (stores API keys per user)
CREATE TABLE IF NOT EXISTS workforce.ai_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,               -- auth.uid()
    provider        TEXT NOT NULL,                -- 'openai', 'anthropic', 'google', 'deepseek'
    label           TEXT NOT NULL,                -- Display name: 'OpenAI', 'Anthropic'
    api_key_encrypted TEXT,                       -- AES-256 encrypted key
    api_key_masked  TEXT,                         -- 'sk-••••abcd' for display
    base_url        TEXT,                         -- Custom endpoint (e.g. Azure OpenAI)
    is_active       BOOLEAN DEFAULT true,
    is_configured   BOOLEAN DEFAULT false,
    last_tested_at  TIMESTAMPTZ,
    test_status     TEXT DEFAULT 'untested',      -- 'untested', 'success', 'failed'
    test_error      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    UNIQUE(user_id, provider)
);

-- 2. AI Models registry (global — all available models with pricing)
CREATE TABLE IF NOT EXISTS workforce.ai_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        TEXT NOT NULL,
    model_id        TEXT NOT NULL UNIQUE,         -- 'gpt-4o', 'claude-sonnet-4'
    display_name    TEXT NOT NULL,                -- 'GPT-4o'
    description     TEXT,
    
    -- Pricing (per 1M tokens, USD)
    input_price     NUMERIC(10,4) DEFAULT 0,     
    output_price    NUMERIC(10,4) DEFAULT 0,
    
    -- Capabilities
    max_context     INTEGER DEFAULT 128000,
    supports_vision BOOLEAN DEFAULT false,
    supports_json   BOOLEAN DEFAULT true,
    supports_tools  BOOLEAN DEFAULT false,
    supports_streaming BOOLEAN DEFAULT true,
    
    -- Status
    is_enabled      BOOLEAN DEFAULT true,
    is_default      BOOLEAN DEFAULT false,
    tier            TEXT DEFAULT 'standard',      -- 'budget', 'standard', 'premium'
    sort_order      INTEGER DEFAULT 100,
    
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Per-user model settings (enable/disable specific models, set default)
CREATE TABLE IF NOT EXISTS workforce.ai_model_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    model_id        TEXT NOT NULL REFERENCES workforce.ai_models(model_id) ON DELETE CASCADE,
    is_enabled      BOOLEAN DEFAULT true,
    is_default      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    UNIQUE(user_id, model_id)
);

-- 4. Token usage log
CREATE TABLE IF NOT EXISTS workforce.ai_usage_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    agent_id        UUID,
    model_id        TEXT NOT NULL,
    provider        TEXT NOT NULL,
    
    tokens_in       INTEGER DEFAULT 0,
    tokens_out      INTEGER DEFAULT 0,
    cost_usd        NUMERIC(10,6) DEFAULT 0,
    
    request_type    TEXT DEFAULT 'chat',           -- 'chat', 'content', 'image'
    metadata        JSONB DEFAULT '{}',
    
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_user ON workforce.ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON workforce.ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON workforce.ai_usage_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON workforce.ai_usage_log(model_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION workforce.update_ai_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ai_providers_updated') THEN
        CREATE TRIGGER trg_ai_providers_updated
            BEFORE UPDATE ON workforce.ai_providers
            FOR EACH ROW EXECUTE FUNCTION workforce.update_ai_timestamp();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ai_models_updated') THEN
        CREATE TRIGGER trg_ai_models_updated
            BEFORE UPDATE ON workforce.ai_models
            FOR EACH ROW EXECUTE FUNCTION workforce.update_ai_timestamp();
    END IF;
END $$;

-- ============================================
-- SEED DATA: Models with current pricing
-- ============================================

INSERT INTO workforce.ai_models (provider, model_id, display_name, description, input_price, output_price, max_context, supports_vision, supports_json, supports_tools, tier, sort_order) VALUES
-- OpenAI
('openai', 'gpt-4o',       'GPT-4o',       'Flagship multimodal model',           2.50,  10.00, 128000, true,  true, true, 'premium',  10),
('openai', 'gpt-4o-mini',  'GPT-4o Mini',  'Fast & affordable',                   0.15,   0.60, 128000, true,  true, true, 'budget',   20),
('openai', 'gpt-4.1',      'GPT-4.1',      'Latest GPT-4 series',                 2.00,   8.00, 1048576, true, true, true, 'premium',  15),
('openai', 'gpt-4.1-mini', 'GPT-4.1 Mini', 'Balanced cost/quality',               0.40,   1.60, 1048576, true, true, true, 'standard', 25),
('openai', 'gpt-4.1-nano', 'GPT-4.1 Nano', 'Cheapest OpenAI option',              0.10,   0.40, 1048576, false, true, true, 'budget',  30),
('openai', 'o3-mini',      'o3-mini',      'Advanced reasoning',                   1.10,   4.40, 200000, false, true, true, 'standard', 35),
-- Anthropic
('anthropic', 'claude-sonnet-4',    'Claude Sonnet 4',     'Best coding model',    3.00,  15.00, 200000, true, true, true, 'premium',  10),
('anthropic', 'claude-3.5-haiku',   'Claude 3.5 Haiku',    'Fast & cheap',         0.80,   4.00, 200000, true, true, true, 'budget',   20),
('anthropic', 'claude-3.5-sonnet',  'Claude 3.5 Sonnet',   'Previous gen flagship',3.00,  15.00, 200000, true, true, true, 'standard', 15),
-- Google
('google', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'Fast multimodal',             0.15,   0.60, 1048576, true, true, true, 'budget',   10),
('google', 'gemini-2.5-pro',   'Gemini 2.5 Pro',   'Best Google model',           1.25,  10.00, 1048576, true, true, true, 'premium',  15),
('google', 'gemini-2.0-flash',  'Gemini 2.0 Flash',  'Previous gen fast',          0.10,   0.40, 1048576, true, true, true, 'budget',  20),
-- DeepSeek
('deepseek', 'deepseek-chat',     'DeepSeek Chat',     'Best value chat',          0.14,   0.28, 128000, false, true, true, 'budget',   10),
('deepseek', 'deepseek-reasoner', 'DeepSeek Reasoner', 'CoT reasoning model',     0.55,   2.19, 128000, false, true, true, 'standard', 15)
ON CONFLICT (model_id) DO NOTHING;

-- RLS
ALTER TABLE workforce.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.ai_model_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- ai_models: readable by all authenticated users
CREATE POLICY "ai_models_select" ON workforce.ai_models
    FOR SELECT TO authenticated
    USING (true);

-- ai_providers: user's own only
CREATE POLICY "ai_providers_select" ON workforce.ai_providers
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "ai_providers_insert" ON workforce.ai_providers
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_providers_update" ON workforce.ai_providers
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "ai_providers_delete" ON workforce.ai_providers
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ai_model_settings: user's own only
CREATE POLICY "ai_model_settings_all" ON workforce.ai_model_settings
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- ai_usage_log: user reads own, service_role inserts
CREATE POLICY "ai_usage_log_select" ON workforce.ai_usage_log
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "ai_usage_log_insert" ON workforce.ai_usage_log
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
