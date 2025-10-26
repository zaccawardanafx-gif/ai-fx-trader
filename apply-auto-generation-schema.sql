-- Auto-Generation Feature Database Schema Updates
-- Apply this SQL to your Supabase database to add the missing columns

-- Add auto-generation fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_interval TEXT DEFAULT 'weekly'; -- 'hourly', '4hours', '6hours', '8hours', '12hours', 'daily', 'weekly'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_time TIME DEFAULT '09:00:00'; -- For daily/weekly
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_paused BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_retry_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_last_error TEXT;

-- Add missing columns that were in the original schema but missing from types
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_pip_target_min INTEGER DEFAULT 80;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_pip_target_max INTEGER DEFAULT 120;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_risk_pips_per_trade INTEGER DEFAULT 15;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_trade_limit INTEGER DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pip_target_per_rotation INTEGER DEFAULT 40;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS breakeven_trigger_pips INTEGER DEFAULT 20;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trading_volume_chf NUMERIC DEFAULT 1000000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leverage_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_leverage NUMERIC DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_currency_pair TEXT DEFAULT 'USD/CHF';

-- Create auto-generation schedule table for more complex scheduling
CREATE TABLE IF NOT EXISTS auto_generation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interval_type TEXT NOT NULL, -- 'hourly', '4hours', '6hours', '8hours', '12hours', 'daily', 'weekly'
  scheduled_time TIME, -- For daily/weekly
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  last_triggered TIMESTAMPTZ,
  next_trigger TIMESTAMPTZ NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table for auto-generation alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'auto_generation_success', 'auto_generation_error', 'auto_generation_paused'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_user_id ON auto_generation_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_next_trigger ON auto_generation_schedule(next_trigger);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_active ON auto_generation_schedule(is_active, is_paused, next_trigger);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

-- RLS Policies for new tables
ALTER TABLE auto_generation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Auto-generation schedule policies
CREATE POLICY IF NOT EXISTS "Users can view own auto-generation schedule"
  ON auto_generation_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own auto-generation schedule"
  ON auto_generation_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own auto-generation schedule"
  ON auto_generation_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own auto-generation schedule"
  ON auto_generation_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY IF NOT EXISTS "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
