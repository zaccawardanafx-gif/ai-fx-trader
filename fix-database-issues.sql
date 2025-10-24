-- Fix database issues for AI FX Trader
-- Run this script in your Supabase SQL editor

-- 1. Add missing RLS policies for technical_indicators table
-- First, drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Anyone can insert technical indicators" ON technical_indicators;
DROP POLICY IF EXISTS "Anyone can update technical indicators" ON technical_indicators;

-- Create the policies
CREATE POLICY "Anyone can insert technical indicators"
  ON technical_indicators FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update technical indicators"
  ON technical_indicators FOR UPDATE
  USING (true);

-- 2. Ensure confidence column exists in trade_ideas table
-- (This should already exist, but let's make sure)
ALTER TABLE trade_ideas 
ADD COLUMN IF NOT EXISTS confidence numeric;

-- 3. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trade_ideas' 
AND column_name = 'confidence';

SELECT policy_name, cmd 
FROM pg_policies 
WHERE tablename = 'technical_indicators';
