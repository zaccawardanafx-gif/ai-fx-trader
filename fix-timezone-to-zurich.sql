-- Fix timezone to Europe/Zurich for all existing records

-- Update profiles table
UPDATE profiles 
SET auto_generation_timezone = 'Europe/Zurich' 
WHERE auto_generation_timezone != 'Europe/Zurich' OR auto_generation_timezone IS NULL;

-- Update auto_generation_schedule table
UPDATE auto_generation_schedule 
SET timezone = 'Europe/Zurich' 
WHERE timezone != 'Europe/Zurich' OR timezone IS NULL;

-- Verify the changes
SELECT id, user_id, interval_type, scheduled_time, timezone, next_trigger 
FROM auto_generation_schedule 
WHERE user_id = '16eb67d3-677f-4da1-a946-ea1d0cfc64d1';

SELECT id, auto_generation_interval, auto_generation_time, auto_generation_timezone, next_auto_generation
FROM profiles 
WHERE id = '16eb67d3-677f-4da1-a946-ea1d0cfc64d1';

