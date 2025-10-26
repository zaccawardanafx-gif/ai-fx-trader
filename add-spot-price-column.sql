-- Add spot_price_at_generation column to trade_ideas table
-- This column stores the current spot price at the time of trade idea generation

ALTER TABLE trade_ideas
ADD COLUMN IF NOT EXISTS spot_price_at_generation NUMERIC(10, 5);

-- Add comment for documentation
COMMENT ON COLUMN trade_ideas.spot_price_at_generation IS 'The spot price (current market price) at the time the trade idea was generated';
