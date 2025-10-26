-- Add metadata column to notifications table
-- This allows storing structured data like trade direction, confidence, etc.

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Add index for better query performance on metadata
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON notifications USING GIN (metadata);

-- Add comment to explain the column
COMMENT ON COLUMN notifications.metadata IS 'Structured metadata for notifications (e.g., trade direction, confidence level, currency pair)';

