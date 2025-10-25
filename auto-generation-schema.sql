-- Auto-Generation Feature Database Schema Updates

-- Add auto-generation fields to profiles table
ALTER TABLE profiles ADD COLUMN auto_generation_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN auto_generation_interval TEXT DEFAULT 'weekly'; -- 'hourly', '4hours', '6hours', '8hours', '12hours', 'daily', 'weekly'
ALTER TABLE profiles ADD COLUMN auto_generation_time TIME DEFAULT '09:00:00'; -- For daily/weekly
ALTER TABLE profiles ADD COLUMN auto_generation_timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN auto_generation_paused BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN last_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN next_auto_generation TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN auto_generation_retry_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN auto_generation_last_error TEXT;

-- Create auto-generation schedule table for more complex scheduling
CREATE TABLE auto_generation_schedule (
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
CREATE TABLE notifications (
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
CREATE INDEX idx_auto_generation_schedule_user_id ON auto_generation_schedule(user_id);
CREATE INDEX idx_auto_generation_schedule_next_trigger ON auto_generation_schedule(next_trigger);
CREATE INDEX idx_auto_generation_schedule_active ON auto_generation_schedule(is_active, is_paused, next_trigger);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

-- RLS Policies for new tables
ALTER TABLE auto_generation_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Auto-generation schedule policies
CREATE POLICY "Users can view own auto-generation schedule"
  ON auto_generation_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto-generation schedule"
  ON auto_generation_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto-generation schedule"
  ON auto_generation_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto-generation schedule"
  ON auto_generation_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate next generation time
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
  -- Convert current time to user's timezone
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
        -- Find next occurrence of the same day of week at scheduled time
        scheduled_datetime := (current_time_tz::date + p_scheduled_time) AT TIME ZONE p_timezone;
        WHILE scheduled_datetime <= current_time_tz OR EXTRACT(DOW FROM scheduled_datetime) != EXTRACT(DOW FROM current_time_tz) LOOP
          scheduled_datetime := scheduled_datetime + INTERVAL '1 day';
        END LOOP;
        next_time := scheduled_datetime;
      ELSE
        next_time := current_time_tz + INTERVAL '1 week';
      END IF;
    ELSE
      next_time := current_time_tz + INTERVAL '1 week'; -- Default to weekly
  END CASE;
  
  -- Convert back to UTC
  RETURN next_time AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Function to create auto-generation schedule
CREATE OR REPLACE FUNCTION create_auto_generation_schedule(
  p_user_id UUID,
  p_interval_type TEXT,
  p_scheduled_time TIME DEFAULT NULL,
  p_timezone TEXT DEFAULT 'UTC'
) RETURNS UUID AS $$
DECLARE
  schedule_id UUID;
  next_trigger TIMESTAMPTZ;
BEGIN
  -- Calculate next trigger time
  next_trigger := calculate_next_generation_time(p_interval_type, p_scheduled_time, p_timezone);
  
  -- Insert new schedule
  INSERT INTO auto_generation_schedule (
    user_id,
    interval_type,
    scheduled_time,
    timezone,
    next_trigger
  ) VALUES (
    p_user_id,
    p_interval_type,
    p_scheduled_time,
    p_timezone,
    next_trigger
  ) RETURNING id INTO schedule_id;
  
  -- Update user profile
  UPDATE profiles SET
    auto_generation_enabled = true,
    auto_generation_interval = p_interval_type,
    auto_generation_time = p_scheduled_time,
    auto_generation_timezone = p_timezone,
    next_auto_generation = next_trigger
  WHERE id = p_user_id;
  
  RETURN schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Function to pause/resume auto-generation
CREATE OR REPLACE FUNCTION toggle_auto_generation_pause(
  p_user_id UUID,
  p_paused BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles SET
    auto_generation_paused = p_paused
  WHERE id = p_user_id;
  
  UPDATE auto_generation_schedule SET
    is_paused = p_paused
  WHERE user_id = p_user_id AND is_active = true;
  
  RETURN p_paused;
END;
$$ LANGUAGE plpgsql;

-- Function to update next generation time after successful generation
CREATE OR REPLACE FUNCTION update_next_generation_time(
  p_user_id UUID
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_time TIMESTAMPTZ;
  user_profile RECORD;
BEGIN
  -- Get user's auto-generation settings
  SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND OR NOT user_profile.auto_generation_enabled THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next generation time
  next_time := calculate_next_generation_time(
    user_profile.auto_generation_interval,
    user_profile.auto_generation_time,
    user_profile.auto_generation_timezone
  );
  
  -- Update both profile and schedule
  UPDATE profiles SET
    last_auto_generation = NOW(),
    next_auto_generation = next_time,
    auto_generation_retry_count = 0,
    auto_generation_last_error = NULL
  WHERE id = p_user_id;
  
  UPDATE auto_generation_schedule SET
    last_triggered = NOW(),
    next_trigger = next_time,
    retry_count = 0,
    last_error = NULL
  WHERE user_id = p_user_id AND is_active = true;
  
  RETURN next_time;
END;
$$ LANGUAGE plpgsql;
