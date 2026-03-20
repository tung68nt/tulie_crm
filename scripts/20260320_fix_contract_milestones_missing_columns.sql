-- Migration: Add missing columns to contract_milestones table
-- These columns are used by the contract form but were never added via migration

-- amount: monetary value for the milestone payment
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0;

-- completed_at: timestamp when milestone was actually completed/paid
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- percentage: already added in 20260319 migration, but ensure it exists
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS percentage NUMERIC;

-- type: already added in 20260304 migration, but ensure it exists
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'payment';

-- project_id: already added in 20260304 migration, but ensure it exists
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
