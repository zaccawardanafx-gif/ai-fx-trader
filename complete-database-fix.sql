-- Complete Database Fix for AI FX Trader
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate the trade_ideas table to ensure schema consistency
DROP TABLE IF EXISTS trade_ideas CASCADE;

CREATE TABLE trade_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt_version integer,
  currency_pair text default 'USD/CHF',
  direction text not null, -- 'BUY' or 'SELL'
  entry numeric not null,
  stop_loss numeric not null,
  take_profit numeric not null,
  pip_target numeric,
  expiry timestamptz,
  rationale text,
  technical_score numeric,
  sentiment_score numeric,
  macro_score numeric,
  confidence numeric, -- 0-100
  technical_weight numeric,
  sentiment_weight numeric,
  macro_weight numeric,
  status text default 'active', -- 'active', 'executed', 'closed', 'cancelled', 'expired'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Recreate indexes
CREATE INDEX idx_trade_ideas_user_id ON trade_ideas(user_id, created_at desc);
CREATE INDEX idx_trade_ideas_status ON trade_ideas(user_id, status, created_at desc);

-- 3. Enable RLS
ALTER TABLE trade_ideas ENABLE ROW LEVEL SECURITY;

-- 4. Recreate RLS policies
CREATE POLICY "Users can view own trade ideas"
  ON trade_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade ideas"
  ON trade_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade ideas"
  ON trade_ideas FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Fix technical_indicators RLS policies
DROP POLICY IF EXISTS "Anyone can insert technical indicators" ON technical_indicators;
CREATE POLICY "Anyone can insert technical indicators"
  ON technical_indicators FOR INSERT
  WITH CHECK (true);

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Verify tables exist
SELECT table_name FROM information_schema.tables WHERE table_name IN ('trade_ideas', 'technical_indicators');
