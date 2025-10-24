-- Quick Database Fix for AI FX Trader
-- Run this in Supabase SQL Editor

-- 1. Fix RLS policy for technical_indicators
DROP POLICY IF EXISTS "Anyone can insert technical indicators" ON technical_indicators;
CREATE POLICY "Anyone can insert technical indicators"
  ON technical_indicators FOR INSERT
  WITH CHECK (true);

-- 2. Refresh schema cache to recognize confidence column
NOTIFY pgrst, 'reload schema';

-- 3. Verify the confidence column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trade_ideas' 
AND column_name = 'confidence';
