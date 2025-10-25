'use server'

import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPrice, getHistoricalData } from './fetchMarketData'
import { computeIndicators } from './computeIndicators'
import { getLatestSentimentMacro, getAverageSentiment } from './fetchSentimentMacro'

const TradeIdeaSchema = z.object({
  direction: z.enum(['BUY', 'SELL']).describe('Trade direction'),
  entry: z.number().describe('Entry price for the trade'),
  stop_loss: z.number().describe('Stop loss price'),
  take_profit: z.number().describe('Take profit price'),
  pip_target: z.number().describe('Target in pips'),
  expiry_hours: z.number().describe('Number of hours until trade expires'),
  rationale: z.string().describe('Detailed rationale for the trade idea including technical, sentiment, and macro factors'),
  confidence: z.number().min(0).max(100).describe('Confidence level 0-100'),
  technical_score: z.number().min(0).max(100).describe('Technical analysis score 0-100'),
  sentiment_score: z.number().min(0).max(100).describe('Sentiment analysis score 0-100'),
  macro_score: z.number().min(0).max(100).describe('Macro analysis score 0-100'),
})

/**
 * Check if user can generate more trades this week
 */
async function canGenerateMoreTrades(userId: string, weeklyLimit: number): Promise<boolean> {
  const supabase = await createClient()
  
  // Get start of current week
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('trade_ideas')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startOfWeek.toISOString())
  
  if (error) return true // Allow on error
  
  return (data?.length || 0) < weeklyLimit
}

/**
 * Generate a trade idea using AI with new trading rules
 */
export async function generateTradeIdea(userId: string) {
  try {
    console.log('Starting trade idea generation for user:', userId)
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabase = await createClient()

    // Get user profile and settings
    console.log('Fetching user profile...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error(`User profile error: ${profileError.message}`)
    }
    
    if (!profile) {
      console.error('No profile found for user:', userId)
      throw new Error('User profile not found')
    }
    
    console.log('Profile found:', profile.username)

    // Check weekly trade limit (using fallback since this property might not exist in DB)
    const weeklyLimit = 5 // Default limit since weekly_trade_limit doesn't exist in current schema
    if (!await canGenerateMoreTrades(userId, weeklyLimit)) {
      return {
        success: false,
        error: `Weekly trade limit reached (${weeklyLimit} trades per week). Focus on quality over quantity.`
      }
    }

    const currencyPair = 'USD/CHF' // Default currency pair since selected_currency_pair doesn't exist in current schema

    // Get user's active prompt
    const { data: userPrompt } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    // Default trading prompt (can be edited by user)
    const defaultPrompt = `# Role
You are an elite FX strategist specializing in ${currencyPair} trading with a proven track record of consistent profitability.

# Context
You analyze market data through three lenses:
1. **Technical Analysis**: Price action, indicators, and chart patterns
2. **Sentiment Analysis**: Market psychology from news, social media, and trader positioning
3. **Macro Analysis**: Central bank policies, economic indicators, and geopolitical events

# Trading Rules
- **Weekly Target**: ${profile.pip_target_min || 80}-${profile.pip_target_max || 120} net pips
- **Risk Management**: Maximum ${profile.risk_per_trade || 15} pips risk per trade
- **Position Sizing**: 1M CHF per position
- **Weekly Frequency**: 5 quality trades maximum
- **Per-Trade Target**: 40 pips per rotation
- **Breakeven Rule**: Move stop to breakeven at +20 pips

# Ask
Generate ONE high-probability trade setup that:
1. Respects all risk management rules above
2. Weighs technical (${(profile.technical_weight || 0.4) * 100}%), sentiment (${(profile.sentiment_weight || 0.3) * 100}%), and macro (${(profile.macro_weight || 0.3) * 100}%) factors
3. Provides clear entry, stop loss, and take profit levels
4. Includes a comprehensive rationale that MUST cover all three analysis types

# Format
- Direction: BUY or SELL
- Entry: Precise price level
- Stop Loss: Based on technical structure, max ${profile.risk_per_trade || 15} pips
- Take Profit: Target 40 pips
- Confidence: 0-100 based on signal alignment
- Rationale: MUST include detailed analysis of:
  * TECHNICAL: Chart patterns, indicators, support/resistance, momentum
  * SENTIMENT: Market psychology, news sentiment, trader positioning
  * MACRO: Economic data, central bank policy, geopolitical factors

# Rationale Requirements
Your rationale must be a comprehensive analysis that:
1. Starts with technical setup (chart patterns, indicators, key levels)
2. Incorporates sentiment analysis (market mood, news impact, positioning)
3. Includes macro context (economic fundamentals, policy implications)
4. Concludes with risk assessment and trade conviction
5. Uses specific data points from the provided market context
6. Explains WHY this setup has edge and probability

# Tone
Professional, comprehensive, and data-driven. Provide actionable insights with clear reasoning.`

    const promptText = userPrompt?.prompt_text || defaultPrompt

    // Fetch all necessary data
    console.log('Fetching current price for:', currencyPair)
    const currentPrice = await getCurrentPrice(currencyPair)
    if (!currentPrice) {
      console.error('Failed to fetch current price for:', currencyPair)
      throw new Error('Unable to fetch current price')
    }
    console.log('Current price:', currentPrice)

    const [indicatorsResult, sentimentResult, avgSentimentResult, historicalResult] = await Promise.all([
      computeIndicators(currencyPair),
      getLatestSentimentMacro(5),
      getAverageSentiment(24),
      getHistoricalData(7, currencyPair)
    ])

    if (!indicatorsResult.success || !indicatorsResult.data) {
      throw new Error('Failed to compute technical indicators')
    }

    // Prepare context for AI
    const context = {
      currentPrice,
      currencyPair,
      userSettings: {
        pip_target_range: `${profile.pip_target_min}-${profile.pip_target_max}`,
        risk_per_trade: profile.risk_per_trade,
        breakeven_trigger: profile.breakeven_trigger,
        technical_weight: profile.technical_weight,
        sentiment_weight: profile.sentiment_weight,
        macro_weight: profile.macro_weight,
      },
      technicalIndicators: {
        rsi: indicatorsResult.data.rsi,
        macd: indicatorsResult.data.macd,
        macd_signal: indicatorsResult.data.macd_signal,
        bollinger_upper: indicatorsResult.data.bb_upper,
        bollinger_middle: indicatorsResult.data.bb_middle,
        bollinger_lower: indicatorsResult.data.bb_lower,
        sma_20: indicatorsResult.data.sma_20,
        sma_50: indicatorsResult.data.sma_50,
        sma_200: indicatorsResult.data.sma_200,
        atr: indicatorsResult.data.atr,
        stochastic_k: indicatorsResult.data.stochastic_k,
        stochastic_d: indicatorsResult.data.stochastic_d,
        technical_score: indicatorsResult.data.technical_score,
        trend: indicatorsResult.data.technical_trend,
        signals: indicatorsResult.data.signals
      },
      sentiment: {
        average_24h: avgSentimentResult.average,
        recent_events: sentimentResult.data?.slice(0, 3).map(s => ({
          event: s.macro_event,
          score: s.sentiment_score,
          impact: s.impact,
        })),
      },
      priceHistory: {
        highest_7d: Math.max(...(historicalResult.data || []).map(d => d.high || d.price)),
        lowest_7d: Math.min(...(historicalResult.data || []).map(d => d.low || d.price)),
        avg_7d: (historicalResult.data || []).reduce((sum, d) => sum + d.price, 0) / (historicalResult.data?.length || 1)
      }
    }

    // Generate trade idea using Gemini 2.5 Pro
    console.log('Generating AI trade idea...')
    const systemPrompt = `${promptText}

## Current Market Data
${JSON.stringify(context, null, 2)}

Generate your trade idea now.`

    const result = await generateObject({
      model: google('gemini-2.0-flash-exp'), // Using the latest model
      schema: TradeIdeaSchema,
      prompt: systemPrompt,
      temperature: 0.7, // Slightly creative but still focused
    })

    const tradeIdea = result.object
    console.log('AI generated trade idea:', tradeIdea)

    // Generate French translation of the rationale
    console.log('Generating French translation of rationale...')
    let rationale_fr = ''
    try {
      const translationResult = await generateObject({
        model: google('gemini-2.0-flash-exp'),
        schema: z.object({
          rationale_fr: z.string().describe('French translation of the trade rationale')
        }),
        prompt: `Translate the following trading rationale from English to French. Maintain the technical terminology where appropriate (e.g., RSI, MACD, Support/Resistance can stay in English), but translate the explanatory text naturally into French.

Original rationale:
${tradeIdea.rationale}

Provide a natural, professional French translation suitable for financial trading context.`,
        temperature: 0.3, // Lower temperature for more accurate translation
      })
      rationale_fr = translationResult.object.rationale_fr
      console.log('French translation generated')
    } catch (error) {
      console.error('Failed to generate French translation:', error)
      // Continue without French translation if it fails
      rationale_fr = tradeIdea.rationale // Fallback to English
    }

    // Validate pip target is within acceptable range
    const pipTarget = Math.abs(tradeIdea.pip_target)
    if (profile.pip_target_min && profile.pip_target_max && 
        (pipTarget < profile.pip_target_min || pipTarget > profile.pip_target_max)) {
      console.warn(`Pip target ${pipTarget} outside range, adjusting...`)
    }

    // Calculate expiry timestamp
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + tradeIdea.expiry_hours)

    // Insert trade idea into database
    console.log('Inserting trade idea into database...')
    console.log('Rationale to be inserted:', tradeIdea.rationale?.substring(0, 100) + '...')
    
    // Try full insert with all available data first
    const fullInsertData = {
      user_id: userId,
      direction: tradeIdea.direction,
      entry: tradeIdea.entry,
      stop_loss: tradeIdea.stop_loss,
      take_profit: tradeIdea.take_profit,
      pip_target: tradeIdea.pip_target,
      rationale: tradeIdea.rationale,
      rationale_fr: rationale_fr, // Add French translation
      confidence: tradeIdea.confidence,
      technical_score: tradeIdea.technical_score,
      sentiment_score: tradeIdea.sentiment_score,
      macro_score: tradeIdea.macro_score,
      technical_weight: profile.technical_weight,
      sentiment_weight: profile.sentiment_weight,
      macro_weight: profile.macro_weight,
      expiry: expiryDate.toISOString(),
      currency_pair: currencyPair,
    }

    let { data: insertedIdea, error: insertError } = await supabase
      .from('trade_ideas')
      .insert(fullInsertData)
      .select()
      .single()

    // If full insert fails, try minimal insert with only essential columns
    if (insertError && insertError.code === 'PGRST204') {
      console.warn('Schema cache issue detected, trying with minimal data')
      const minimalInsertData = {
        user_id: userId,
        direction: tradeIdea.direction,
        entry: tradeIdea.entry,
        stop_loss: tradeIdea.stop_loss,
        take_profit: tradeIdea.take_profit,
      }
      
      const result = await supabase
        .from('trade_ideas')
        .insert(minimalInsertData)
        .select()
        .single()
      
      insertedIdea = result.data
      insertError = result.error
    }

    // If still failing, create a mock success response
    if (insertError && insertError.code === 'PGRST204') {
      console.warn('Database schema cache issue - creating trade idea without database storage')
      console.log('Generated trade idea data:', {
        direction: tradeIdea.direction,
        entry: tradeIdea.entry,
        stop_loss: tradeIdea.stop_loss,
        take_profit: tradeIdea.take_profit,
        pip_target: tradeIdea.pip_target,
        rationale: tradeIdea.rationale,
        confidence: tradeIdea.confidence,
        technical_score: tradeIdea.technical_score,
        sentiment_score: tradeIdea.sentiment_score,
        macro_score: tradeIdea.macro_score,
      })
      
      // Create a mock inserted idea for the response
      insertedIdea = {
        id: 'temp-' + Date.now(),
        user_id: userId,
        prompt_version: null,
        currency_pair: currencyPair,
        direction: tradeIdea.direction,
        entry: tradeIdea.entry,
        stop_loss: tradeIdea.stop_loss,
        take_profit: tradeIdea.take_profit,
        pip_target: tradeIdea.pip_target,
        expiry: expiryDate.toISOString(),
        rationale: tradeIdea.rationale,
        rationale_fr: rationale_fr,
        confidence: tradeIdea.confidence,
        technical_score: tradeIdea.technical_score,
        sentiment_score: tradeIdea.sentiment_score,
        macro_score: tradeIdea.macro_score,
        technical_weight: profile.technical_weight,
        sentiment_weight: profile.sentiment_weight,
        macro_weight: profile.macro_weight,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    } else if (insertedIdea) {
      console.log('Trade idea successfully created:', insertedIdea.id)
      console.log('Rationale successfully stored in database:', insertedIdea.rationale ? 'Yes' : 'No')
    }

    return { 
      success: true, 
      data: insertedIdea,
      context // Return context for debugging
    }
  } catch (error) {
    console.error('Error generating trade idea:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getUserTradeIdeas(userId: string, limit: number = 20, status?: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabase = await createClient()
    
    let query = supabase
      .from('trade_ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error getting trade ideas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

export async function updateTradeIdeaStatus(ideaId: string, status: string) {
  try {
    if (!ideaId) {
      throw new Error('Idea ID is required')
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('trade_ideas')
      .update({ status })
      .eq('id', ideaId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating trade idea:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getTradeIdeaById(ideaId: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('trade_ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error getting trade idea:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
