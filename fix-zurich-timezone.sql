-- Fix timezone to Zurich for existing data
-- This script updates existing timezone settings to Europe/Zurich

-- Update profiles table
UPDATE profiles 
SET auto_generation_timezone = 'Europe/Zurich' 
WHERE auto_generation_timezone IS NULL OR auto_generation_timezone = 'UTC';

-- Update auto_generation_schedule table  
UPDATE auto_generation_schedule 
SET timezone = 'Europe/Zurich' 
WHERE timezone IS NULL OR timezone = 'UTC';

-- Alter the default value for profiles table (if columns exist)
DO $$ 
BEGIN
  -- Check if column exists before altering
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'auto_generation_timezone') THEN
    ALTER TABLE profiles ALTER COLUMN auto_generation_timezone SET DEFAULT 'Europe/Zurich';
  END IF;
  
  -- Check if auto_generation_schedule table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auto_generation_schedule') THEN
    ALTER TABLE auto_generation_schedule ALTER COLUMN timezone SET DEFAULT 'Europe/Zurich';
  END IF;
END $$;

-- Update function defaults
CREATE OR REPLACE FUNCTION calculate_next_generation_time(
  p_interval_type TEXT,
  p_scheduled_time TIME DEFAULT NULL,
  p_timezone TEXT DEFAULT 'Europe/Zurich',
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

-- Update create function
CREATE OR REPLACE FUNCTION create_auto_generation_schedule(
  p_user_id UUID,
  p_interval_type TEXT,
  p_scheduled_time TIME DEFAULT NULL,
  p_timezone TEXT DEFAULT 'Europe/Zurich'
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

