'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }
  }
}

export async function updateUserProfile(userId: string, updates: {
  username?: string
  risk_per_trade?: number
  pip_target_min?: number
  pip_target_max?: number
  breakeven_trigger?: number
  weekly_pip_target_min?: number
  weekly_pip_target_max?: number
  max_risk_pips_per_trade?: number
  weekly_trade_limit?: number
  pip_target_per_rotation?: number
  breakeven_trigger_pips?: number
  trading_volume_chf?: number
  leverage_enabled?: boolean
  max_leverage?: number
  selected_currency_pair?: string
  technical_weight?: number
  sentiment_weight?: number
  macro_weight?: number
  alert_frequency?: string
  notify_email?: boolean
  notify_whatsapp?: boolean
}) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function createUserProfile(userId: string, email: string, username: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        username,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}





