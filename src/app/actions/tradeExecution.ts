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
    
    // Get user profile for trading settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      throw new Error('User profile not found')
    }
    
    // Get current market price
    const currentPrice = await getCurrentPrice(tradeIdea.currency_pair)
    if (!currentPrice) {
      throw new Error('Unable to get current market price')
    }
    
    const entryPrice = currentPrice // Execute at current market price
    const volume = profile.trading_volume_chf || 1000000
    const leverage = profile.leverage_enabled ? (profile.max_leverage || 1) : 1
    
    // Create trade log entry
    const { data: tradeLog, error: logError } = await supabase
      .from('trade_log')
      .insert({
        user_id: userId,
        trade_idea_id: tradeIdeaId,
        currency_pair: tradeIdea.currency_pair,
        direction: tradeIdea.direction,
        entry_price: entryPrice,
        entry_timestamp: new Date().toISOString(),
        volume_chf: volume,
        leverage: leverage,
        stop_loss: tradeIdea.stop_loss,
        take_profit: tradeIdea.take_profit,
        current_stop_loss: tradeIdea.stop_loss,
        current_take_profit: tradeIdea.take_profit,
        status: 'open',
        notes: `Executed from trade idea: ${tradeIdea.rationale?.substring(0, 100)}...`
      })
      .select()
      .single()
    
    if (logError || !tradeLog) {
      throw new Error('Failed to create trade log')
    }
    
    // Create position entry
    const { error: positionError } = await supabase
      .from('positions')
      .insert({
        user_id: userId,
        trade_log_id: tradeLog.id,
        currency_pair: tradeIdea.currency_pair,
        direction: tradeIdea.direction,
        entry_price: entryPrice,
        current_price: currentPrice,
        volume_chf: volume,
        leverage: leverage,
        stop_loss: tradeIdea.stop_loss,
        take_profit: tradeIdea.take_profit,
        unrealized_pnl_chf: 0,
        unrealized_pnl_pips: 0,
        opened_at: new Date().toISOString()
      })
    
    if (positionError) {
      throw new Error('Failed to create position')
    }
    
    // Update trade idea status to 'executed'
    await supabase
      .from('trade_ideas')
      .update({ status: 'executed' })
      .eq('id', tradeIdeaId)
    
    return {
      success: true,
      data: tradeLog,
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
 */
export async function updatePositions(userId: string) {
  try {
    const supabase = await createClient()
    
    // Get all open positions
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
    
    if (positionsError) throw positionsError
    if (!positions || positions.length === 0) {
      return { success: true, updated: 0 }
    }
    
    // Update each position
    for (const position of positions) {
      const currentPrice = await getCurrentPrice(position.currency_pair)
      if (!currentPrice) continue
      
      const pnl = calculatePnL(
        position.direction as 'BUY' | 'SELL',
        position.entry_price,
        currentPrice,
        position.volume_chf,
        position.leverage
      )
      
      // Check if stop loss or take profit hit
      let shouldClose = false
      let closeReason = ''
      
      if (position.direction === 'BUY') {
        if (currentPrice <= position.stop_loss) {
          shouldClose = true
          closeReason = 'stopped_out'
        } else if (currentPrice >= position.take_profit) {
          shouldClose = true
          closeReason = 'target_hit'
        }
      } else {
        if (currentPrice >= position.stop_loss) {
          shouldClose = true
          closeReason = 'stopped_out'
        } else if (currentPrice <= position.take_profit) {
          shouldClose = true
          closeReason = 'target_hit'
        }
      }
      
      if (shouldClose) {
        await closePosition(position.id, userId, closeReason, currentPrice)
      } else {
        // Update position
        await supabase
          .from('positions')
          .update({
            current_price: currentPrice,
            unrealized_pnl_chf: pnl.pnl_chf,
            unrealized_pnl_pips: pnl.pnl_pips,
            last_updated: new Date().toISOString()
          })
          .eq('id', position.id)
      }
    }
    
    return { success: true, updated: positions.length }
  } catch (error) {
    console.error('Error updating positions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Close a position
 */
export async function closePosition(
  positionId: string, 
  userId: string, 
  reason: string = 'closed',
  exitPrice?: number
) {
  try {
    const supabase = await createClient()
    
    // Get position
    const { data: position, error: posError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', positionId)
      .eq('user_id', userId)
      .single()
    
    if (posError || !position) {
      throw new Error('Position not found')
    }
    
    // Get current price if not provided
    const currentPrice = exitPrice || await getCurrentPrice(position.currency_pair)
    if (!currentPrice) {
      throw new Error('Unable to get current price')
    }
    
    // Calculate final P&L
    const pnl = calculatePnL(
      position.direction as 'BUY' | 'SELL',
      position.entry_price,
      currentPrice,
      position.volume_chf,
      position.leverage
    )
    
    // Update trade log
    await supabase
      .from('trade_log')
      .update({
        exit_price: currentPrice,
        exit_timestamp: new Date().toISOString(),
        status: reason,
        realized_pnl_chf: pnl.pnl_chf,
        realized_pnl_pips: pnl.pnl_pips
      })
      .eq('id', position.trade_log_id)
    
    // Delete position
    await supabase
      .from('positions')
      .delete()
      .eq('id', positionId)
    
    // Update P&L summary
    await updatePnLSummary(userId)
    
    return {
      success: true,
      data: { pnl_chf: pnl.pnl_chf, pnl_pips: pnl.pnl_pips },
      message: `Position closed. P&L: ${pnl.pnl_chf.toFixed(2)} CHF (${pnl.pnl_pips.toFixed(1)} pips)`
    }
  } catch (error) {
    console.error('Error closing position:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get all positions for a user
 */
export async function getUserPositions(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting positions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Update P&L summary
 */
async function updatePnLSummary(userId: string) {
  try {
    const supabase = await createClient()
    
    // Calculate daily summary
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: todayTrades, error } = await supabase
      .from('trade_log')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_timestamp', today.toISOString())
      .lt('entry_timestamp', tomorrow.toISOString())
      .in('status', ['closed', 'stopped_out', 'target_hit'])
    
    if (error) throw error
    
    if (todayTrades && todayTrades.length > 0) {
      const totalTrades = todayTrades.length
      const winningTrades = todayTrades.filter(t => (t.realized_pnl_chf || 0) > 0).length
      const losingTrades = todayTrades.filter(t => (t.realized_pnl_chf || 0) < 0).length
      const totalPips = todayTrades.reduce((sum, t) => sum + (t.realized_pnl_pips || 0), 0)
      const totalPnL = todayTrades.reduce((sum, t) => sum + (t.realized_pnl_chf || 0), 0)
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
      
      const wins = todayTrades.filter(t => (t.realized_pnl_pips || 0) > 0)
      const losses = todayTrades.filter(t => (t.realized_pnl_pips || 0) < 0)
      
      const avgWinPips = wins.length > 0 
        ? wins.reduce((sum, t) => sum + (t.realized_pnl_pips || 0), 0) / wins.length 
        : 0
      
      const avgLossPips = losses.length > 0 
        ? losses.reduce((sum, t) => sum + (t.realized_pnl_pips || 0), 0) / losses.length 
        : 0
      
      const largestWin = Math.max(...todayTrades.map(t => t.realized_pnl_chf || 0))
      const largestLoss = Math.min(...todayTrades.map(t => t.realized_pnl_chf || 0))
      
      // Upsert daily summary
      await supabase
        .from('pnl_summary')
        .upsert({
          user_id: userId,
          period_type: 'daily',
          period_start: today.toISOString(),
          period_end: tomorrow.toISOString(),
          total_trades: totalTrades,
          winning_trades: winningTrades,
          losing_trades: losingTrades,
          total_pips: totalPips,
          total_pnl_chf: totalPnL,
          win_rate: winRate,
          avg_win_pips: avgWinPips,
          avg_loss_pips: avgLossPips,
          largest_win_chf: largestWin,
          largest_loss_chf: largestLoss
        }, {
          onConflict: 'user_id,period_type,period_start'
        })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating P&L summary:', error)
    return { success: false }
  }
}

/**
 * Get P&L summary
 */
export async function getPnLSummary(userId: string, periodType: 'daily' | 'weekly' | 'monthly' = 'daily', limit: number = 30) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('pnl_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting P&L summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

