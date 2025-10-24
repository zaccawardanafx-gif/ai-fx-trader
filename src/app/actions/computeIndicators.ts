'use server'

import { createClient } from '@/lib/supabase/server'
import { getHistoricalData } from './fetchMarketData'
import { calculateTechnicalIndicators, analyzeTechnicalSignal, type TechnicalIndicators } from '@/lib/technicalAnalysis'

export async function computeIndicators(currencyPair: string = 'USD/CHF'): Promise<{
  success: boolean
  data?: TechnicalIndicators & { technical_score?: number, technical_trend?: string, signals?: string[] }
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get historical market data (30 days should give us enough data points)
    const { data: historicalData, success, error: fetchError } = await getHistoricalData(30, currencyPair)
    
    if (!success || !historicalData || historicalData.length < 200) {
      throw new Error(fetchError || 'Insufficient market data for indicator calculation')
    }

    // Transform to the format expected by technicalAnalysis library
    const priceData = historicalData.map(d => ({
      close: d.close || d.price,
      high: d.high || d.price,
      low: d.low || d.price,
      open: d.open || d.price,
      volume: d.volume ?? undefined
    }))

    // Calculate all technical indicators
    const indicators = calculateTechnicalIndicators(priceData)
    
    // Get current price (latest close)
    const currentPrice = priceData[priceData.length - 1].close
    
    // Analyze technical signal
    const analysis = analyzeTechnicalSignal(indicators, currentPrice)

    // Prepare data for database
    const dbData = {
      timestamp: new Date().toISOString(),
      pair: currencyPair,
      rsi: indicators.rsi,
      macd: indicators.macd,
      macd_signal: indicators.macd_signal,
      macd_histogram: indicators.macd_histogram,
      sma50: indicators.sma_50,
      sma200: indicators.sma_200,
      atr: indicators.atr,
    }

    // Insert into database
    const { error: insertError } = await supabase
      .from('technical_indicators')
      .insert(dbData)

    if (insertError) {
      console.error('Error inserting indicators:', insertError)
      // Continue anyway, don't fail on DB insert
    }

    return { 
      success: true, 
      data: {
        ...indicators,
        technical_score: analysis.score,
        technical_trend: analysis.trend,
        signals: analysis.signals
      }
    }
  } catch (error) {
    console.error('Error computing indicators:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getLatestIndicators(currencyPair: string = 'USD/CHF') {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('technical_indicators')
      .select('*')
      .eq('pair', currencyPair)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no data in DB, compute fresh
      return await computeIndicators(currencyPair)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error getting latest indicators:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
