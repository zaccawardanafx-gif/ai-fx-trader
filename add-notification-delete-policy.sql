-- Add DELETE policy for notifications table
-- This allows users to delete their own notifications
-- Run this in your Supabase SQL Editor

-- First, try to drop the policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Now create the policy
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Verify it was created
SELECT 
  'Policy created successfully!' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'notifications' 
AND policyname = 'Users can delete own notifications';

