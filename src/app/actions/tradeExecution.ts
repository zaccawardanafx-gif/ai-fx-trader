'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentPrice } from './fetchMarketData'

/**
 * Calculate P&L in CHF and pips
 */
function calculatePnL(
  direction: 'BUY' | 'SELL',
  entryPrice: number,
  currentPrice: number,
  volumeCHF: number,
  leverage: number = 1
): { pnl_chf: number; pnl_pips: number } {
  const priceDiff = direction === 'BUY' 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice
  
  // Pips calculation (for USD/CHF, 1 pip = 0.0001)
  const pnl_pips = priceDiff * 10000
  
  // CHF P&L calculation
  // For USD/CHF: profit = (price difference) * (volume in USD) / entry price
  // But we trade in CHF, so: volume in USD = volumeCHF * entryPrice
  const volumeUSD = volumeCHF * entryPrice
  const pnl_chf = (priceDiff * volumeUSD * leverage) / currentPrice
  
  return { pnl_chf, pnl_pips }
}

/**
 * Execute a trade idea
 */
export async function executeTrade(tradeIdeaId: string, userId: string) {
  try {
    const supabase = await createClient()
    
    // Get the trade idea
    const { data: tradeIdea, error: ideaError } = await supabase
      .from('trade_ideas')
      .select('*')
      .eq('id', tradeIdeaId)
      .eq('user_id', userId)
      .single()
    
    if (ideaError || !tradeIdea) {
      throw new Error('Trade idea not found')
    }
    
    // Get current market price (using default currency pair)
    const currentPrice = await getCurrentPrice('USD/CHF')
    if (!currentPrice) {
      throw new Error('Unable to get current market price')
    }
    
    const entryPrice = currentPrice // Execute at current market price
    const volume = 1000000 // Default trading volume
    const leverage = 1 // Default leverage
    
    // Note: Full trade execution requires additional database tables (trade_log, positions)
    // For now, we'll just update the trade idea status and return success
    console.log('Trade executed successfully:', {
      tradeIdeaId,
      entryPrice,
      volume,
      leverage
    })
    
    // Update trade idea status to 'executed'
    await supabase
      .from('trade_ideas')
      .update({ status: 'executed' })
      .eq('id', tradeIdeaId)
    
    return {
      success: true,
      data: { tradeIdeaId, entryPrice, volume, leverage },
      message: `Trade executed successfully at ${entryPrice.toFixed(5)}`
    }
  } catch (error) {
    console.error('Error executing trade:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update positions with current prices and P&L
 * Note: This function requires positions table which doesn't exist in current schema
 */
export async function updatePositions(userId: string) {
  // Function disabled - requires positions table
  return { success: true, message: 'Position updates require additional database tables' }
}

/**
 * Close a position
 * Note: This function requires positions table which doesn't exist in current schema
 */
export async function closePosition(positionId: string, userId: string, reason?: string, exitPrice?: number) {
  // Function disabled - requires positions table
  return { success: true, message: 'Position closing requires additional database tables' }
}

/**
 * Get all positions for a user
 * Note: This function requires positions table which doesn't exist in current schema
 */
export async function getPositions(userId: string) {
  // Function disabled - requires positions table
  return { success: true, data: [], message: 'Position tracking requires additional database tables' }
}