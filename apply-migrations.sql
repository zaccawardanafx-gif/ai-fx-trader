-- Complete migration script to fix auto-generation feature
-- Run this in your Supabase SQL Editor to update the database schema

-- Step 1: Add auto-generation fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_interval TEXT DEFAULT 'weekly';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_time TIME;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_paused BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_retry_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_generation_last_error TEXT;

-- Step 2: Create auto_generation_schedule table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS auto_generation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interval_type TEXT NOT NULL,
  scheduled_time TIME,
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

-- Step 3: Create notifications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Add metadata column to notifications (if already exists)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_user_id ON auto_generation_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_next_trigger ON auto_generation_schedule(next_trigger);
CREATE INDEX IF NOT EXISTS idx_auto_generation_schedule_active ON auto_generation_schedule(is_active, is_paused, next_trigger);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON notifications USING GIN (metadata);

-- Step 6: Enable RLS on new tables
ALTER TABLE auto_generation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for auto_generation_schedule
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'auto_generation_schedule' 
    AND policyname = 'Users can view own auto-generation schedule'
  ) THEN
    CREATE POLICY "Users can view own auto-generation schedule"
      ON auto_generation_schedule FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'auto_generation_schedule' 
    AND policyname = 'Users can insert own auto-generation schedule'
  ) THEN
    CREATE POLICY "Users can insert own auto-generation schedule"
      ON auto_generation_schedule FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'auto_generation_schedule' 
    AND policyname = 'Users can update own auto-generation schedule'
  ) THEN
    CREATE POLICY "Users can update own auto-generation schedule"
      ON auto_generation_schedule FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'auto_generation_schedule' 
    AND policyname = 'Users can delete own auto-generation schedule'
  ) THEN
    CREATE POLICY "Users can delete own auto-generation schedule"
      ON auto_generation_schedule FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Step 8: Create RLS policies for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can insert own notifications'
  ) THEN
    CREATE POLICY "Users can insert own notifications"
      ON notifications FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can delete own notifications'
  ) THEN
    CREATE POLICY "Users can delete own notifications"
      ON notifications FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Step 9: Create database functions (if they don't exist)
CREATE OR REPLACE FUNCTION calculate_next_generation_time(
  p_interval_type TEXT,
  p_scheduled_time TIME DEFAULT NULL,
  p_timezone TEXT DEFAULT 'UTC',
  p_current_time TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_time TIMESTAMPTZ;
  current_time_tz TIMESTAMPTZ;
  scheduled_datetime TIMESTAMPTZ;
BEGIN
  current_time_tz := p_current_time AT TIME ZONE p_timezone;
  
  CASE p_interval_type
    WHEN 'hourly' THEN
      next_time := date_trunc('hour', current_time_tz) + INTERVAL '1 hour';
    WHEN '4hours' THEN
      next_time := date_trunc('hour', current_time_tz) + INTERVAL '4 hours';
    WHEN '6hours' THEN
      next_time := date_trunc('hour', current_time_tz) + INTERVAL '6 hours';
    WHEN '8hours' THEN
      next_time := date_trunc('hour', current_time_tz) + INTERVAL '8 hours';
    WHEN '12hours' THEN
      next_time := date_trunc('hour', current_time_tz) + INTERVAL '12 hours';
    WHEN 'daily' THEN
      IF p_scheduled_time IS NOT NULL THEN
        scheduled_datetime := (current_time_tz::date + p_scheduled_time) AT TIME ZONE p_timezone;
        IF scheduled_datetime <= current_time_tz THEN
          scheduled_datetime := scheduled_datetime + INTERVAL '1 day';
        END IF;
        next_time := scheduled_datetime;
      ELSE
        next_time := current_time_tz + INTERVAL '1 day';
      END IF;
    WHEN 'weekly' THEN
      IF p_scheduled_time IS NOT NULL THEN
        scheduled_datetime := (current_time_tz::date + p_scheduled_time) AT TIME ZONE p_timezone;
        WHILE scheduled_datetime <= current_time_tz OR EXTRACT(DOW FROM scheduled_datetime) != EXTRACT(DOW FROM current_time_tz) LOOP
          scheduled_datetime := scheduled_datetime + INTERVAL '1 day';
        END LOOP;
        next_time := scheduled_datetime;
      ELSE
        next_time := current_time_tz + INTERVAL '1 week';
      END IF;
    ELSE
      next_time := current_time_tz + INTERVAL '1 week';
  END CASE;
  
  RETURN next_time AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Step 10: Update notification to add metadata comment
COMMENT ON COLUMN notifications.metadata IS 'Structured metadata for notifications (e.g., trade direction, confidence level, currency pair)';

